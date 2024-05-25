console.log("Background.js is running");

// Listen for any messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message is to capture the visible tab(recieved from contentscript.js)
  if (request.action === "captureVisibleTab") {
    // Capture the visible tab and send the data URL back to the contentscript.js
    chrome.tabs.captureVisibleTab(null, { format: "png" }, function (dataUrl) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
        return;
      }
      // Sending the capture status and the img back to the contentscript.js
      sendResponse({ success: true, imgSrc: dataUrl });
    });
    return true; // Indicates you want to send a response asynchronously
  }
});
