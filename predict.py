# to take the image path 
# read the image , 
# run it into the model 
# get the prediction
# return the prediction as JSON 

from Mesonet.classifiers import Meso4  # Import your model class
import numpy as np
from PIL import Image
import io
import sys
import json

# Instantiate your model
classifier = Meso4()
classifier.load('./Mesonet/weights/Meso4_DF.h5')

def make_prediction(image_path):
    try:
        # Read the image file
        img = Image.open(image_path)
        
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

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 your_script.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    prediction = make_prediction(image_path)
    
    # Output the prediction as JSON
    print(json.dumps({"prediction": prediction}))
