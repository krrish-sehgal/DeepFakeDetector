const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

exports.postUpload = (req, res, next) => {
  const image = req.body.image;

  // Check if image data exists in the request body
  if (image) {
    // Remove the dataURL prefix
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Write the buffer to a file
    const imagePath = "images/screenshot.png";
    fs.writeFile(imagePath, buffer, function (err) {
      if (err) {
        console.error("Error saving screenshot:", err);
        return res.status(500).send("Error saving screenshot");
      }

      // Now imagePath contains the path where the image is saved
      // Make a POST request to your Flask API for prediction
      const formData = new FormData();
      formData.append("file", fs.createReadStream(imagePath));

      axios
        .post("http://127.0.0.1:5000/predict", formData, {
          headers: {
            ...formData.getHeaders(), // Include form data headers (including boundary)
          },
        })
        .then((response) => {
          // Handle prediction response from Flask API
          console.log("Prediction:", response.data.prediction);
          res.status(200).json({
            prediction: response.data.prediction,
          });
        })
        .catch((error) => {
          console.error("Error predicting:", error.message);
          res.status(500).send("Error predicting");
        });
    });
  } else {
    res.status(400).send("No image data found in the request body");
  }
};

exports.getIndex = (req, res, next) => {
  res.render("extension/index", {
    pageTitle: "About Extension",
  });
};
