console.log("Content script is running");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message is to snip the screen
  if (request.action === "snip") {
    // Send a message to the background script to capture the visible tab
    chrome.runtime.sendMessage({ action: "captureVisibleTab" }, (response) => {
      console.log("Response from background script:", response);
      if (response.success) {
        // Create an image element to decode the data URL
        const img = new Image();
        img.src = response.imgSrc;
        img.onload = function () {
          // Now snip the required area to get the coordinates
          snip(img);
        };
      } else {
        console.error("Failed to capture image:", response.error);
      }
    });
  }
});

// Function to snip the required area of the image
function snip(img) {
  // Get the dimensions of the image and the window to calculate the ratio
  const imgWidth = img.width;
  const imgHeight = img.height;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Calculate the ratio of the image to the window inorder to get the actual coordinates of the captured area in the full visible tab img
  const widthRatio = imgWidth / windowWidth;
  const heightRatio = imgHeight / windowHeight;

  // Create the main overlay to dim the entire screen
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "10000";
  overlay.style.cursor = "crosshair";
  document.body.appendChild(overlay);

  let startX, startY, endX, endY;
  let isSelecting = false;

  // Create a selection box
  const selectionBox = document.createElement("div");
  selectionBox.style.position = "fixed";
  selectionBox.style.border = "2px dashed #fff";
  selectionBox.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
  selectionBox.style.pointerEvents = "none"; // Allow mouse events to pass through
  overlay.appendChild(selectionBox);

  // event to listen when the mouse is clicked
  overlay.addEventListener("mousedown", (event) => {
    // Starting selection
    isSelecting = true;

    // Get the starting coordinates of the selection box
    startX = event.clientX;
    startY = event.clientY;

    // Setting the initial position and dimensions of the selection box
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";
    selectionBox.style.display = "block";
  });

  // event to listen when the mouse is moved
  overlay.addEventListener("mousemove", (event) => {
    // returning if the mouse is not clicked/selection has not started yet
    if (!isSelecting) return;

    // Updating the selection box dimensions as the mouse is moving in real time
    endX = event.clientX;
    endY = event.clientY;

    const width = endX - startX;
    const height = endY - startY;

    // Setting the position and dimensions of the selection box in real time
    selectionBox.style.width = `${Math.abs(width)}px`;
    selectionBox.style.height = `${Math.abs(height)}px`;
    selectionBox.style.left = `${Math.min(startX, endX)}px`;
    selectionBox.style.top = `${Math.min(startY, endY)}px`;
  });

  // event to listen when the mouse is released
  overlay.addEventListener("mouseup", () => {
    // Ending selection
    isSelecting = false;

    // Adjust end coordinates if necessary
    endX = Math.max(endX, 0);
    endY = Math.max(endY, 0);

    // Get the selected area's coordinates and dimensions with respect to the full visible tab image
    const x = Math.min(startX, endX) * widthRatio;
    const y = Math.min(startY, endY) * heightRatio;
    const width = Math.abs(endX - startX) * widthRatio;
    const height = Math.abs(endY - startY) * heightRatio;
    // Ask for confirmation before capturing the selected area
    userConfirmation(() => {
      // Capture the selected area as an image
      captureSelectedArea(img, x, y, width, height);
    });
  });

  // Confirmatino DialogueBox Function
  function userConfirmation(callback) {
    // Create confirmation dialog
    const confirmationDialog = document.createElement("div");
    confirmationDialog.style.position = "fixed";
    confirmationDialog.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    confirmationDialog.style.padding = "5px";
    confirmationDialog.style.borderRadius = "5px";
    confirmationDialog.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";
    confirmationDialog.style.zIndex = "10001";

    // Calculate position relative to the viewport
    const viewportX = Math.min(startX, endX);
    const viewportY = Math.min(startY, endY);
    const viewportWidth = Math.abs(endX - startX);
    const viewportHeight = Math.abs(endY - startY);

    // Set position of confirmation dialog
    confirmationDialog.style.left = `${viewportX + viewportWidth - 120}px`; // Adjust for dialog width and right offset
    confirmationDialog.style.top = `${viewportY + viewportHeight + 5}px`; // Adjust for down offset

    // Create confirm button
    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Confirm";
    confirmButton.style.marginRight = "10px";
    confirmButton.onclick = () => {
      document.body.removeChild(overlay);
      document.body.removeChild(confirmationDialog);
      callback(); // Invoke the callback function if user confirms
    };

    // Create cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.onclick = () => {
      document.body.removeChild(overlay);
      document.body.removeChild(confirmationDialog);
    };

    // Append buttons to the confirmation dialog
    confirmationDialog.appendChild(confirmButton);
    confirmationDialog.appendChild(cancelButton);

    // Append the confirmation dialog to the body
    document.body.appendChild(confirmationDialog);
  }

  // Capturing area
  function captureSelectedArea(
    img,
    scaledStartX,
    scaledStartY,
    scaledWidth,
    scaledHeight
  ) {
    // Drawingthe selected area on the canvas
    console.log("Capturing selected area");

    // Create a canvas element to draw the selected area
    var canvas = document.createElement("canvas");
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Get the 2D context of the canvas
    const context = canvas.getContext("2d");

    // Draw the selected area of the image onto the canvas
    context.drawImage(
      img,
      scaledStartX,
      scaledStartY,
      scaledWidth,
      scaledHeight,
      0,
      0,
      scaledWidth,
      scaledHeight
    );

    // Saving image to local storage so that it can be displayed in the popup
    saveImageToLocalStorage(canvas);
  }
}

// Function to save the image to local storage along with the deepfake percentage
async function saveImageToLocalStorage(canvas) {
  const canvasDataUrl = canvas.toDataURL();

  try {
    // Get the deepfake percentage from the backend
    const deepfakeScore = await getDeepfakePercentage(canvasDataUrl);

    // Convert the prediction to represent the likelihood of being a deepfake
    const deepfakePercentage = (1 - deepfakeScore) * 100; // Multiply by 100 to represent as percentage
    const roundedPercentage = Math.round(deepfakePercentage * 100) / 100; // Round to two decimal places

    // Retrieve existing images and deepfake percentages from local storage
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get("imageHistory", (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });

    const imageHistory = result.imageHistory || [];

    // Add the new image and deepfake percentage to the history
    imageHistory.push({
      imageDataUrl: canvasDataUrl,
      deepfakePercentage: roundedPercentage,
    });

    // Store the updated array in local storage
    await new Promise((resolve, reject) => {
      chrome.storage.local.set({ imageHistory: imageHistory }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log("Image data and deepfake percentage saved successfully");
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Error saving image data:", error);
  }
}

// Function to make the API call to get the deepfake percentage and returning it as a promise
async function getDeepfakePercentage(imageDataUrl) {
  try {
    const response = await fetch("http://localhost:3000/extension/upload", {
      method: "POST",
      body: JSON.stringify({ image: imageDataUrl }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get deepfake percentage");
    }

    const data = await response.json();
    console.log("Data received from API:", data);
    return data.prediction;
  } catch (error) {
    console.error("Error sending screenshot:", error);
    throw error; // Rethrow the error to propagate it
  }
}
