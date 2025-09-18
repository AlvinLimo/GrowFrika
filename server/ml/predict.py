import os
# Suppress TensorFlow messages BEFORE importing tensorflow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import sys
import json
import traceback

def main():
    try:
        if len(sys.argv) < 2:
            result = {"error": "No image path provided"}
            print(json.dumps(result))
            return
        
        img_path = sys.argv[1]
        
        # Check if image file exists
        if not os.path.exists(img_path):
            result = {"error": f"Image file not found: {img_path}"}
            print(json.dumps(result))
            return
        
        # Import the model - this is where it might be failing
        try:
            from model import predict_image
        except Exception as import_error:
            result = {
                "error": "Failed to import model", 
                "details": str(import_error)
            }
            print(json.dumps(result))
            return
        
        # Make the prediction
        result = predict_image(img_path)
        print(json.dumps(result))
        
    except Exception as e:
        error_info = {
            "error": "Prediction failed",
            "details": str(e),
            "type": str(type(e).__name__)
        }
        print(json.dumps(error_info))
    
    # Force flush and exit
    sys.stdout.flush()
    sys.exit(0)

if __name__ == "__main__":
    main()