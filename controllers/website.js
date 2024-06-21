const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
exports.getIndex = (req, res, next) => {
  res.render("main/index", {
    pageTitle: "Index",
  });
};

exports.postPredict = (req, res, next) => {
  const file = req.file;
  const imagePath = path.join(__dirname, "..", "images", file.filename);

  const formData = new FormData();
  formData.append("file", fs.createReadStream(imagePath));

  console.log("formData", formData, "ans ", formData.getHeaders());
  axios
    .post("http://127.0.0.1:5000/predict", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    })
    .then((response) => {
      const prediction = response.data.prediction;
      let roundedPrediction = parseFloat(prediction);

      if (roundedPrediction > 0.5) {
        roundedPrediction = 100 * roundedPrediction;
      }

      roundedPrediction = roundedPrediction.toFixed(2);

      res.render("main/prediction", {
        pageTitle: "prediction",
        prediction: roundedPrediction,
        imageUrl: `/images/${file.filename}`,
      });
    })
    .catch((error) => {
      console.error("Error:", error.message);
      res.status(500).send("Internal Server Error");
    });
};
