from Mesonet.classifiers import Meso4  # Import your model class
import numpy as np
from PIL import Image
import logging

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)

# Instantiate your model
classifier = Meso4()
classifier.load('./Mesonet/weights/Meso4_DF.h5')

def make_prediction(image_file):
    try:
        # Read the image file
        img = Image.open(image_file)
        
        # Convert PIL image to numpy array
        img_array = np.array(img)
        
        # Convert image to RGB if it has an alpha channel (i.e., if it has four channels)
        if len(img_array.shape) == 3 and img_array.shape[2] == 4:
            img_array = img_array[:, :, :3]  # Keep only the first three channels (RGB)
        
        # Resize the image
        img_array = np.array(Image.fromarray(img_array).resize((256, 256)))
        
        # Expand dimensions to match the expected input shape
        img_array = np.expand_dims(img_array, axis=0)
        
        # Normalize pixel values
        img_array = img_array / 255.0
        
        # Make prediction
        prediction = classifier.predict(img_array)
        
        # Return prediction as a list (assuming classifier.predict() returns an array)
        return prediction.tolist()
    
    except Exception as e:
        # Return error message if any exception occurs
        return {"error": str(e)}

@app.route('/predict', methods=['POST'])
def predict():
    app.logger.info('Predict endpoint called')
    if 'file' not in request.files:
        app.logger.error('No file part in the request')
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    app.logger.info(f'File received: {file.filename}')
    
    if file.filename == '':
        app.logger.error('No selected file')
        return jsonify({"error": "No selected file"}), 400
    
    try:
        prediction = make_prediction(file)
        app.logger.info(f'Prediction: {prediction}')
        return jsonify({"prediction": prediction})
    
    except Exception as e:
        app.logger.error(f'Error during prediction: {str(e)}')
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return jsonify({"message": "Hello, World!"})

if __name__ == "__main__":
    app.run(debug=True)
