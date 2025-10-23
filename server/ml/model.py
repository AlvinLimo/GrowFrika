# Enhanced model.py with image validation

import os
# Suppress TensorFlow messages BEFORE importing tensorflow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import sys
import traceback
import cv2
import numpy as np
from PIL import Image

try:
    import tensorflow as tf
    
    # Try different import paths for different TensorFlow versions
    try:
        from tensorflow.keras.utils import image # pyright: ignore[reportMissingImports]
        print("Using tensorflow.keras.utils.image", file=sys.stderr)
    except ImportError:
        try:
            from tensorflow.keras.preprocessing import image # pyright: ignore[reportMissingImports]
            print("Using tensorflow.keras.preprocessing.image", file=sys.stderr)
        except ImportError:
            from keras.utils import image_utils as image
            print("Using keras.utils.image_utils", file=sys.stderr)
    
    print("TensorFlow imports successful", file=sys.stderr)
except ImportError as e:
    print(f"Missing required packages: {e}", file=sys.stderr)
    print("Run: pip install tensorflow numpy Pillow opencv-python", file=sys.stderr)
    sys.exit(1)

# ====== Load Model Once (Global) ======
MODEL_PATH = os.path.join(os.path.dirname(__file__), "coffee_disease_final.keras")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully", file=sys.stderr)
except Exception as e:
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {e}")

# Define your class labels
CLASS_NAMES = ["miner", "nodisease", "phoma", "rust"]
IMG_SIZE = (128, 128)

def validate_image_content(img_path):
    """
    Validates if the image contains a coffee leaf using multiple approaches
    Returns: dict with validation results
    """
    try:
        # Load image
        img = cv2.imread(img_path)
        if img is None:
            return {
                "is_valid": False,
                "reason": "Could not load image file",
                "suggestion": "Please upload a valid image file (JPG, PNG, etc.)"
            }
        
        # Convert to RGB for analysis
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # 1. Check if image is mostly green (leaf-like)
        green_score = check_green_content(img_rgb)
        
        # 2. Check for leaf-like shapes/edges
        shape_score = check_leaf_shapes(img)
        
        # 3. Check image complexity (not too simple/not too complex)
        complexity_score = check_image_complexity(img)
        
        # 4. Check size and aspect ratio
        size_check = check_image_dimensions(img)
        
        print(f"Validation scores - Green: {green_score:.2f}, Shape: {shape_score:.2f}, Complexity: {complexity_score:.2f}", file=sys.stderr)
        
        # Combine scores to make decision
        total_score = (green_score * 0.4) + (shape_score * 0.3) + (complexity_score * 0.2) + (size_check * 0.1)
        
        if total_score < 0.3:  # Threshold for rejection
            if green_score < 0.2:
                return {
                    "is_valid": False,
                    "reason": "Image doesn't appear to contain plant/leaf material",
                    "suggestion": "Please upload a clear photo of a coffee leaf"
                }
            elif shape_score < 0.2:
                return {
                    "is_valid": False,
                    "reason": "Image appears to show the whole plant or multiple leaves",
                    "suggestion": "Please upload a photo focusing on a single coffee leaf for better accuracy"
                }
            else:
                return {
                    "is_valid": False,
                    "reason": "Image quality or content not suitable for analysis",
                    "suggestion": "Please upload a clear, well-lit photo of a single coffee leaf"
                }
        
        return {
            "is_valid": True,
            "confidence": total_score,
            "reason": "Image appears to contain a suitable coffee leaf"
        }
        
    except Exception as e:
        print(f"Error in image validation: {e}", file=sys.stderr)
        return {
            "is_valid": True,  # Default to allowing if validation fails
            "reason": "Could not validate image, proceeding with prediction"
        }

def check_green_content(img_rgb):
    """
    Check if image has sufficient green content (indicating plant material)
    """
    try:
        # Convert to HSV for better color analysis
        img_hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
        
        # Define green color range in HSV
        lower_green1 = np.array([35, 40, 40])
        upper_green1 = np.array([85, 255, 255])
        
        # Create mask for green pixels
        green_mask = cv2.inRange(img_hsv, lower_green1, upper_green1)
        
        # Calculate percentage of green pixels
        green_pixels = np.sum(green_mask > 0)
        total_pixels = img_rgb.shape[0] * img_rgb.shape[1]
        green_percentage = green_pixels / total_pixels
        
        # Score based on green content (0.2-0.8 is good range for leaves)
        if green_percentage < 0.1:
            return 0.0  # Too little green
        elif green_percentage > 0.8:
            return 0.3  # Maybe too much green (whole plant?)
        else:
            return min(1.0, green_percentage * 2)  # Good green content
            
    except:
        return 0.5  # Default if analysis fails

def check_leaf_shapes(img):
    """
    Check for leaf-like shapes and edges
    """
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply edge detection
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return 0.1
        
        # Analyze largest contours (potential leaves)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]
        
        leaf_scores = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < 100:  # Too small
                continue
                
            # Calculate aspect ratio and solidity
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = float(w) / h
            
            hull = cv2.convexHull(contour)
            hull_area = cv2.contourArea(hull)
            solidity = float(area) / hull_area if hull_area > 0 else 0
            
            # Leaf-like characteristics: reasonable aspect ratio and solidity
            if 0.3 <= aspect_ratio <= 3.0 and 0.5 <= solidity <= 0.95:
                leaf_scores.append(min(1.0, solidity + (1 - abs(1 - aspect_ratio))))
        
        return max(leaf_scores) if leaf_scores else 0.2
        
    except:
        return 0.5

def check_image_complexity(img):
    """
    Check if image has appropriate complexity (not too simple, not too busy)
    """
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Calculate image variance (measure of complexity)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Normalize variance to 0-1 scale
        # Good leaf images typically have variance between 100-2000
        if variance < 50:
            return 0.1  # Too simple/blurry
        elif variance > 3000:
            return 0.3  # Too complex/noisy
        else:
            return min(1.0, variance / 1500)
            
    except:
        return 0.5

def check_image_dimensions(img):
    """
    Check if image dimensions are reasonable
    """
    try:
        height, width = img.shape[:2]
        
        # Check minimum size
        if height < 50 or width < 50:
            return 0.0
        
        # Check aspect ratio (shouldn't be too extreme)
        aspect_ratio = max(width, height) / min(width, height)
        if aspect_ratio > 5:  # Too elongated
            return 0.2
        
        return 1.0
        
    except:
        return 0.5

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
    Predicts disease from a coffee leaf image with validation
    """
    try:
        print("Starting image validation...", file=sys.stderr)
        
        # First validate the image content
        validation_result = validate_image_content(img_path)
        
        if not validation_result["is_valid"]:
            return {
                "status": "invalid_image",
                "error": validation_result["reason"],
                "suggestion": validation_result["suggestion"],
                "advice": validation_result["suggestion"],
                "predicted_class": None,
                "confidence": 0.0
            }
        
        print("Image validation passed, proceeding with prediction...", file=sys.stderr)
        
        # Proceed with normal prediction
        img_array = preprocess_image(img_path)
        preds = model.predict(img_array, verbose=0)
        class_idx = np.argmax(preds[0])
        confidence = float(preds[0][class_idx])
        
        # Additional confidence check - if model is too confident on potentially wrong images
        if confidence > 0.95 and validation_result.get("confidence", 1.0) < 0.5:
            return {
                "status": "low_quality_prediction",
                "predicted_class": CLASS_NAMES[class_idx],
                "confidence": confidence,
                "warning": "Prediction confidence is high but image quality is questionable",
                "suggestion": "For better accuracy, please upload a clearer photo of a single coffee leaf",
                "advice": "Prediction is uncertain. " + 
                      "Try uploading a sharper photo of just one coffee leaf.",
                "all_probabilities": {
                    CLASS_NAMES[i]: float(preds[0][i]) for i in range(len(CLASS_NAMES))
                }
            }
        
        result = {
            "status": "success",
            "predicted_class": CLASS_NAMES[class_idx],
            "confidence": confidence,
            "all_probabilities": {
                CLASS_NAMES[i]: float(preds[0][i]) for i in range(len(CLASS_NAMES))
            },
            "reliable": confidence >= confidence_threshold,
            "image_quality": validation_result.get("confidence", 1.0),
            "advice": f"The leaf is classified as **{CLASS_NAMES[class_idx]}** "
                  f"with {confidence:.1%} confidence."
        }

        return result
        
    except Exception as e:
        raise RuntimeError(f"Prediction failed: {e}")