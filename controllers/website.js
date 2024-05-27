const { spawn } = require("child_process");
const path = require("path");

exports.getIndex = (req, res, next) => {
  res.render("index", {
    pageTitle: "Index",
  });
};
exports.postPredict = (req, res, next) => {
  const file = req.file;
  const imagePath = path.join(__dirname, "..", "images", file.filename); // Assuming images are saved in 'images' directory

  // Spawn a Python process
  const pythonProcess = spawn("python3", ["predict.py", imagePath]);

  let predictionData = "";
  let errorOccurred = false; // Flag to track if error occurred¸¸
  var prediction = 0;

  pythonProcess.stdout.on("data", (data) => {
    predictionData += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (!errorOccurred) {
      if (code === 0) {
        const lines = predictionData.trim().split("\n");
        const lastLine = lines[lines.length - 1];
        prediction = parseFloat(JSON.parse(lastLine).prediction);

        res.render("prediction", {
          pageTitle: "prediction",
          prediction: prediction,
        });
      } else {
        console.error(`Python process exited with code ${code}`);
        res.status(500).send("Internal Server Error");
      }
    }
  });
};
