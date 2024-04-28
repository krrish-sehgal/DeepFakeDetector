const fs = require('fs');

exports.postUpload = (req, res, next) => {
    const image = req.body.image;

    // Check if image data exists in the request body
    if (image) {
        // Remove the dataURL prefix
        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Write the buffer to a file
        fs.writeFile('images/screenshot.png', buffer, function(err) {
            if (err) {
                console.error('Error saving screenshot:', err);
                res.status(500).send('Error saving screenshot');
            } else {
                console.log('Screenshot saved successfully');
                res.send('Screenshot saved');
            }
        });
    } else {
        res.status(400).send('No image data found in the request body');
    }
}