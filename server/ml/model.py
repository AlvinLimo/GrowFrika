# Fixed model.py - Complete working version

import os
# Suppress TensorFlow messages BEFORE importing tensorflow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import sys
import traceback

try:
    import tensorflow as tf
    from tensorflow.keras.preprocessing import image
    import numpy as np

    print("TensorFlow imports successful", file=sys.stderr)
except ImportError as e:
    print(f"Missing required packages: {e}", file=sys.stderr)
    print("Run: pip install tensorflow numpy Pillow", file=sys.stderr)
    sys.exit(1)

# Debug: Print working directory
print(f"Current working directory: {os.getcwd()}", file=sys.stderr)

# ====== Load Model Once (Global) ======
MODEL_PATH = os.path.join(os.path.dirname(__file__), "coffee_disease_final.keras")
print(f"Looking for model at: {MODEL_PATH}", file=sys.stderr)

# Check if model file exists
if not os.path.exists(MODEL_PATH):
    print(f"ERROR: Model file not found at: {MODEL_PATH}", file=sys.stderr)
    try:
        files_in_dir = os.listdir(os.path.dirname(__file__))
        print(f"Files in ml directory: {files_in_dir}", file=sys.stderr)
    except:
        print("Could not list directory contents", file=sys.stderr)
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

try:
    print("Loading model...", file=sys.stderr)
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully", file=sys.stderr)
except Exception as e:
    print(f"ERROR loading model: {e}", file=sys.stderr)
    print(f"Full traceback: {traceback.format_exc()}", file=sys.stderr)
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {e}")

# Define your class labels (must match training order)
CLASS_NAMES = ["miner", "nodisease", "phoma", "rust"]
IMG_SIZE = (128, 128)  # same size used in training

def preprocess_image(img_path):
    """
    Loads and preprocesses image for prediction
    """
    try:
        print(f"Preprocessing image: {img_path}", file=sys.stderr)
        if not os.path.exists(img_path):
            raise FileNotFoundError(f"Image file not found: {img_path}")
        
        img = image.load_img(img_path, target_size=IMG_SIZE)
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        print("Image preprocessed successfully", file=sys.stderr)
        return img_array
    except Exception as e:
        print(f"ERROR preprocessing: {e}", file=sys.stderr)
        raise RuntimeError(f"Failed to preprocess image {img_path}: {e}")

def predict_image(img_path, confidence_threshold=0.7):
    """
    Predicts disease from a single coffee leaf image
    """
    try:
        print("Starting prediction...", file=sys.stderr)
        img_array = preprocess_image(img_path)

        print("Running model prediction...", file=sys.stderr)
        # Run prediction
        preds = model.predict(img_array, verbose=0)
        class_idx = np.argmax(preds[0])
        confidence = float(preds[0][class_idx])

        result = {
            "predicted_class": CLASS_NAMES[class_idx],
            "confidence": confidence,
            "all_probabilities": {
                CLASS_NAMES[i]: float(preds[0][i]) for i in range(len(CLASS_NAMES))
            },
            "reliable": confidence >= confidence_threshold,
            "status": "success"
        }

        print("Prediction completed successfully", file=sys.stderr)
        return result
    except Exception as e:
        print(f"ERROR in prediction: {e}", file=sys.stderr)
        print(f"Full traceback: {traceback.format_exc()}", file=sys.stderr)
        raise RuntimeError(f"Prediction failed: {e}")

# Test the function exists
if __name__ == "__main__":
    print("predict_image function is defined and available", file=sys.stderr)