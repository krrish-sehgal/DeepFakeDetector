document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('snipButton').addEventListener('click', function() {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(dataUrl) {
            var img = new Image();
            img.src = dataUrl;
            document.body.appendChild(img);
            // You can then send this dataUrl to your server
            sendToServer(dataUrl);
        });
    });
});

function sendToServer(dataUrl) {
    fetch('http://localhost:3000/extension/upload', {
        method: 'POST',
        body: JSON.stringify({ image: dataUrl }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("response = ", response);
        console.log('Screenshot sent successfully');
    })
    .catch(error => {
        console.error('Error sending screenshot:', error);
    });
}