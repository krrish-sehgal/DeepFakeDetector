console.log("popup script Loaded");

document.addEventListener("DOMContentLoaded", runFunction);

async function runFunction() {
  const authForm = document.getElementById("authForm");
  const authContainer = document.getElementById("authContainer");
  const snipContainer = document.getElementById("snipContainer");
  const snipButton = document.getElementById("snipButton");
  const logOutBtn = document.getElementById("logOut");
  const authMessage = document.getElementById("authMessage");
  const signupLink = document.getElementById("signupLink");

  let thumbClicks = 0;

  var token = localStorage.getItem("jwt");
  let expirationTime = localStorage.getItem("expirationTime");

  if (token) {
    // Check if the token is expired
    const currentTime = new Date();
    if (currentTime > new Date(expirationTime)) {
      // Token is expired
      console.log("Token expired");
      logOut();
    } else {
      // setting time out if the extension is kept open and the token is expired (auto logout )
      const millisecondsLeftTillExpiration =
        new Date(expirationTime) - currentTime;
      setTimeout(() => {
        logOut();
      }, millisecondsLeftTillExpiration);

      // Display the snipping tool
      displaySnipTool();
    }
  }

  snipButton.addEventListener("click", startSnipping);
  logOutBtn.addEventListener("click", logOut);

  function logOut() {
    // remove the token from localStorage
    localStorage.removeItem("jwt");
    localStorage.removeItem("userID");
    localStorage.removeItem("expirationTime");

    // remove the image history from chrome local storage
    chrome.storage.local.remove("imageHistory", () => {
      if (chrome.runtime.lastError) {
        console.error("Error removing image data:", chrome.runtime.lastError);
      } else {
        console.log("Image history cleared successfully");
      }
    });

    // reload the popup
    window.location.reload();
  }

  function startSnipping() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "snip",
        token: token,
      });
    });
    window.close();
  }

  // Handle form submission
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:4000/extension/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Set the token variable to the token received from the server
      token = data.token;

      // Set the token to expire in 1 min
      const remainingMilliSeconds = 60 * 1000;
      const expirationTime = new Date(
        new Date().getTime() + remainingMilliSeconds
      );

      // Store the token and expiration time in localStorage
      localStorage.setItem("jwt", token);
      localStorage.setItem("userID", data.userId);
      localStorage.setItem("expirationTime", expirationTime.toISOString());

      // if the extension is opened and the token is expired, log out the user
      setTimeout(() => {
        logOut();
      }, remainingMilliSeconds);

      displaySnipTool();
    } else {
      authMessage.textContent = data.message;
    }
  });

  // Open the signup page in a new tab
  signupLink.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:4000/extension/signup" });
  });

  // Display the snipping tool and hide the auth form
  function displaySnipTool() {
    authContainer.style.display = "none";
    snipContainer.style.display = "block";
  }

  // Retrieve the array of image data URLs and deepfake percentages from local storage and display them
  chrome.storage.local.get("imageHistory", (result) => {
    const imageHistory = result.imageHistory || [];
    const imageContainer = document.getElementById("imageContainer");

    if (imageHistory.length > 0) {
      // Create a button to clear the image history
      const clearHistoryButton = document.createElement("button");
      clearHistoryButton.textContent = "Clear History";
      clearHistoryButton.id = "clearHistoryButton";
      document.body.appendChild(clearHistoryButton);

      // Add click event to clear the image history
      document
        .getElementById("clearHistoryButton")
        .addEventListener("click", clearImageHistory);

      // Display each image and its deepfake percentage
      imageHistory.forEach((entry, index) => {
        const imageDataUrl = entry.imageDataUrl;
        const deepfakePercentage = entry.deepfakePercentage;

        // Create a container for each image and its details
        const container = document.createElement("div");
        container.className = "image-container";

        // Create an img element to display the thumbnail(small image)
        const imgElement = document.createElement("img");
        imgElement.src = imageDataUrl;
        imgElement.className = "thumbnail";

        // Create a span element to display the deepfake percentage
        const percentageElement = document.createElement("span");
        percentageElement.className = "deepfake-percentage";
        percentageElement.textContent = `Deepfake: ${deepfakePercentage}%`;

        // Append img and span to the container
        container.appendChild(imgElement);
        container.appendChild(percentageElement);

        // Append the container to the imageContainer
        imageContainer.appendChild(container);

        // Add click event to open the image in a larger view
        imgElement.addEventListener("click", () => {
          thumbClicks++;
          if (thumbClicks % 2 === 1) {
            openThumbnail(imageDataUrl);
          } else {
            closeThumbnail();
          }
        });
      });
    } else {
      // Handle case where no images are found
      console.log("No images found in local storage");
    }
  });

  // Function to clear the image history from local storage and remove the clearHistory button
  function clearImageHistory() {
    chrome.storage.local.remove("imageHistory", () => {
      if (chrome.runtime.lastError) {
        console.error("Error removing image data:", chrome.runtime.lastError);
      } else {
        console.log("Image history cleared successfully");
        // Remove all img elements from the popup
        document
          .querySelectorAll(".image-container")
          .forEach((div) => div.remove());

        // Remove the clearHistory button
        const clearHistoryButton =
          document.getElementById("clearHistoryButton");
        if (clearHistoryButton) {
          clearHistoryButton.parentNode.removeChild(clearHistoryButton);
        }
      }
    });
  }

  // Function to open the image in a larger view
  function openThumbnail(imageDataUrl) {
    const existingLargeImage = document.getElementById("largeImage");
    if (existingLargeImage) {
      existingLargeImage.remove();
    }

    const largeImage = document.createElement("img");
    largeImage.id = "largeImage";
    largeImage.src = imageDataUrl;
    largeImage.style.width = "50%";
    largeImage.style.height = "auto";
    largeImage.style.position = "fixed";
    largeImage.style.top = "50%";
    largeImage.style.left = "50%";
    largeImage.style.transform = "translate(-50%, -50%)";
    largeImage.style.zIndex = "1000";
    largeImage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    largeImage.style.padding = "10px";
    largeImage.style.borderRadius = "10px";
    largeImage.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    largeImage.style.cursor = "pointer";

    document.body.appendChild(largeImage);
  }
  function closeThumbnail() {
    const existingLargeImage = document.getElementById("largeImage");
    if (existingLargeImage) {
      existingLargeImage.remove();
    }
  }
}
