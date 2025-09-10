import sys
import json
import os
import traceback

def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No image path provided"}))
            sys.exit(1)

        img_path = sys.argv[1]
        
        # Check if image file exists
        if not os.path.exists(img_path):
            print(json.dumps({"error": f"Image file not found: {img_path}"}))
            sys.exit(1)
        
        # Import the model here to catch import errors
        try:
            from model import predict_image
        except ImportError as e:
            print(json.dumps({
                "error": "Failed to import model", 
                "details": str(e),
                "suggestion": "Make sure model.py exists and all dependencies are installed"
            }))
            sys.exit(1)

        # Make the prediction
        result = predict_image(img_path)
        print(json.dumps(result))
        
    except Exception as e:
        error_info = {
            "error": "Prediction failed",
            "details": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_info))
        sys.exit(1)

if __name__ == "__main__":
    main()