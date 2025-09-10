import os
import sys

try:
    import tensorflow as tf
    import numpy as np
    from tensorflow.keras.utils import image # type: ignore
except ImportError as e:
    print(f"Missing required packages. Please install: {e}")
    print("Run: pip install tensorflow numpy Pillow")
    sys.exit(1)

# ====== Load Model Once (Global) ======
MODEL_PATH = os.path.join(os.path.dirname(__file__), "coffee_disease_final.keras")

# Check if model file exists
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"Model loaded successfully from: {MODEL_PATH}", file=sys.stderr)
except Exception as e:
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {e}")

# Define your class labels (must match training order)
CLASS_NAMES = ["miner", "nodisease", "phoma", "rust"]

IMG_SIZE = (128, 128)  # same size used in training

def preprocess_image(img_path):
    """
    Loads and preprocesses image for prediction
    """
    try:
        if not os.path.exists(img_path):
            raise FileNotFoundError(f"Image file not found: {img_path}")
        
        img = image.load_img(img_path, target_size=IMG_SIZE)
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    except Exception as e:
        raise RuntimeError(f"Failed to preprocess image {img_path}: {e}")

def predict_image(img_path, confidence_threshold=0.7):
    """
    Predicts disease from a single coffee leaf image
    """
    try:
        img_array = preprocess_image(img_path)

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

        return result
    except Exception as e:
        raise RuntimeError(f"Prediction failed: {e}")