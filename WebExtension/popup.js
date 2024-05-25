console.log("popup script Loaded");
document.addEventListener("DOMContentLoaded", runFunction);

function runFunction() {
  document
    .getElementById("snipButton")
    .addEventListener("click", clickFunction);
  function clickFunction() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "snip",
      });
    });
    window.close();
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
        imgElement.addEventListener("click", openThumbnail);
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
  function openThumbnail() {
    const largeImage = document.createElement("img");
    largeImage.src = imageDataUrl;
    largeImage.style.width = "100%";
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

    // Add click event to close the large image view
    largeImage.addEventListener("click", () => {
      largeImage.remove();
    });

    document.body.appendChild(largeImage);
  }
}
