const fs = require('fs');
const { spawn } = require('child_process');

exports.postUpload = (req, res, next) => {
    const image = req.body.image;

    // Check if image data exists in the request body
    if (image) {
        // Remove the dataURL prefix
        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Write the buffer to a file
        const imagePath = 'images/screenshot.png';
        fs.writeFile('images/screenshot.png', buffer, function(err) {
            if (err) {
                console.error('Error saving screenshot:', err);
                res.status(500).send('Error saving screenshot');
            } else {
                const pythonProcess = spawn('python3', ['predict.py', imagePath]);
    
                let predictionData = '';
                let errorOccurred = false; // Flag to track if error occurred¸¸
                var prediction  =0;
            
                pythonProcess.stdout.on('data', (data) => {
                    predictionData += data.toString();
                });
                
                pythonProcess.on('close', (code) => {
                    if (!errorOccurred) {
                        if (code === 0) {
                            const lines = predictionData.trim().split('\n');
                            const lastLine = lines[lines.length - 1];
                            prediction = parseFloat(JSON.parse(lastLine).prediction);
            
                            if(prediction>0.5){
                                prediction = "The image is a cat";
                            }
                            console.log(prediction);
                            // res.render('prediction', {
                            //     pageTitle: 'prediction',
                            //     prediction: prediction,
                            // });
            
                        } else {
                            console.error(`Python process exited with code ${code}`);
                            res.status(500).send('Internal Server Error');
                        }
                    }
                });
            }
        });
    } else {
        res.status(400).send('No image data found in the request body');
    }
}