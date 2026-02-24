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
    Multi-layered validation to detect if image is a coffee leaf
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
        
        # Convert to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Run all validation checks
        checks = {
            "green_content": check_green_content(img_rgb),
            "leaf_shape": check_leaf_shapes(img),
            "texture": check_texture_features(img),
            "color_distribution": check_color_distribution(img_rgb),
            "size_quality": check_image_dimensions(img)
        }
        
        print(f"Validation scores: {checks}", file=sys.stderr)
        
        # Calculate weighted score with STRICTER weights for green content
        total_score = (
            checks["green_content"] * 0.35 +  # Increased from 0.35
            checks["leaf_shape"] * 0.25 +
            checks["texture"] * 0.20 +  # Reduced from 0.20
            checks["color_distribution"] * 0.15 +  # Reduced from 0.15
            checks["size_quality"] * 0.05
        )
        
        print(f"Total validation score: {total_score:.3f}", file=sys.stderr)
        
        # STRICTER threshold - require higher score to pass
        if total_score < 0.25:  # Changed from 0.25
            if checks["green_content"] < 0.15:  # Changed from 0.15
                return {
                    "is_valid": False,
                    "reason": "No plant material detected - image appears to be a non-plant object",
                    "suggestion": "Please upload a photo of a coffee plant leaf",
                    "validation_score": total_score
                }
            elif checks["leaf_shape"] < 0.2:  # Changed from 0.2
                return {
                    "is_valid": False,
                    "reason": "No leaf-like structure detected in the image",
                    "suggestion": "Please upload a clear photo focusing on a single coffee leaf",
                    "validation_score": total_score
                }
            else:
                return {
                    "is_valid": False,
                    "reason": "Image content not suitable for coffee leaf analysis",
                    "suggestion": "Please upload a clear, well-lit photo of a coffee leaf against a simple background",
                    "validation_score": total_score
                }
        
        # Additional check: Even if total score passes, green content MUST be reasonable
        if checks["green_content"] < 0.2:  # NEW CHECK
            return {
                "is_valid": False,
                "reason": "Insufficient plant material detected in the image",
                "suggestion": "Please ensure the image clearly shows a coffee leaf with visible green color",
                "validation_score": total_score
            }
        
        return {
            "is_valid": True,
            "confidence": total_score,
            "reason": "Image appears to contain a coffee leaf",
            "validation_score": total_score
        }
        
    except Exception as e:
        print(f"Error in image validation: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        # On validation error, be CONSERVATIVE and reject
        return {
            "is_valid": False,
            "reason": "Could not properly analyze the image",
            "suggestion": "Please upload a clear photo of a coffee leaf",
            "validation_score": 0.0
        }
    
def check_green_content(img_rgb):
    """
    Enhanced green content detection for plant material - STRICTER VERSION
    """
    try:
        # Convert to HSV for better color analysis
        img_hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
        
        # Multiple green ranges to catch different shades
        # Healthy green leaves
        lower_green1 = np.array([30, 30, 30])
        upper_green1 = np.array([90, 255, 255])
        
        # Yellowish green (diseased leaves)
        lower_green2 = np.array([20, 20, 20])
        upper_green2 = np.array([40, 255, 255])
        
        # Create masks
        mask1 = cv2.inRange(img_hsv, lower_green1, upper_green1)
        mask2 = cv2.inRange(img_hsv, lower_green2, upper_green2)
        green_mask = cv2.bitwise_or(mask1, mask2)
        
        # Calculate green percentage
        green_pixels = np.sum(green_mask > 0)
        total_pixels = img_rgb.shape[0] * img_rgb.shape[1]
        green_percentage = green_pixels / total_pixels
        
        print(f"Green content: {green_percentage:.2%}", file=sys.stderr)
        
        # STRICTER Scoring logic
        if green_percentage < 0.12:  # Changed from 0.08 - Too little green
            return 0.0
        elif green_percentage < 0.20:  # Changed from 0.15 - Minimal green
            return 0.2  # Changed from 0.3
        elif green_percentage < 0.30:  # Changed from 0.25 - Low green
            return 0.5
        elif green_percentage < 0.70:  # Good green content
            return min(1.0, green_percentage * 1.5)
        else:  # Too much uniform green
            return 0.4
            
    except Exception as e:
        print(f"Error in green content check: {e}", file=sys.stderr)
        return 0.0  # Changed from 0.5 - fail on error


def check_leaf_shapes(img):
    """
    Detect leaf-like shapes using contour analysis
    """
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply bilateral filter to reduce noise while keeping edges
        filtered = cv2.bilateralFilter(gray, 9, 75, 75)
        
        # Edge detection
        edges = cv2.Canny(filtered, 30, 100)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return 0.1
        
        # Analyze largest contours
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
        
        image_area = img.shape[0] * img.shape[1]
        best_score = 0.0
        
        for contour in contours:
            area = cv2.contourArea(contour)
            
            # Skip too small or too large contours
            if area < (image_area * 0.02) or area > (image_area * 0.95):
                continue
            
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = float(w) / h if h > 0 else 0
            
            # Calculate circularity and solidity
            perimeter = cv2.arcLength(contour, True)
            circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter > 0 else 0
            
            hull = cv2.convexHull(contour)
            hull_area = cv2.contourArea(hull)
            solidity = float(area) / hull_area if hull_area > 0 else 0
            
            # Leaf characteristics:
            # - Aspect ratio: 0.4 to 2.5 (leaves are somewhat elongated)
            # - Circularity: 0.3 to 0.8 (not perfect circle, not too irregular)
            # - Solidity: 0.6 to 0.95 (some concavity but not too much)
            score = 0.0
            
            if 0.4 <= aspect_ratio <= 2.5:
                score += 0.35
            if 0.3 <= circularity <= 0.8:
                score += 0.35
            if 0.6 <= solidity <= 0.95:
                score += 0.3
            
            best_score = max(best_score, score)
        
        print(f"Leaf shape score: {best_score:.2f}", file=sys.stderr)
        return best_score
        
    except Exception as e:
        print(f"Error in leaf shape check: {e}", file=sys.stderr)
        return 0.5

def check_texture_features(img):
    """
    Analyze texture to distinguish leaves from other objects
    """
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Calculate variance (texture complexity)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Calculate gradient magnitude (edge strength)
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(sobelx**2 + sobely**2).mean()
        
        # Leaves typically have moderate texture (not too smooth, not too busy)
        texture_score = 0.0
        
        # Laplacian variance scoring
        if 100 < laplacian_var < 2000:
            texture_score += 0.5
        elif 50 < laplacian_var <= 100 or 2000 <= laplacian_var < 3000:
            texture_score += 0.3
        else:
            texture_score += 0.1
        
        # Gradient magnitude scoring
        if 10 < gradient_magnitude < 50:
            texture_score += 0.5
        elif 5 < gradient_magnitude <= 10 or 50 <= gradient_magnitude < 80:
            texture_score += 0.3
        else:
            texture_score += 0.1
        
        print(f"Texture score: {texture_score:.2f} (Laplacian: {laplacian_var:.1f}, Gradient: {gradient_magnitude:.1f})", file=sys.stderr)
        return texture_score
        
    except Exception as e:
        print(f"Error in texture check: {e}", file=sys.stderr)
        return 0.5

def check_color_distribution(img_rgb):
    """
    Check if color distribution matches leaf patterns
    """
    try:
        # Calculate color histogram
        hist_r = cv2.calcHist([img_rgb], [0], None, [256], [0, 256])
        hist_g = cv2.calcHist([img_rgb], [1], None, [256], [0, 256])
        hist_b = cv2.calcHist([img_rgb], [2], None, [256], [0, 256])
        
        # Normalize
        hist_r = hist_r.flatten() / hist_r.sum()
        hist_g = hist_g.flatten() / hist_g.sum()
        hist_b = hist_b.flatten() / hist_b.sum()
        
        # Check if green channel is dominant
        green_dominance = np.sum(hist_g[50:150]) / np.sum(hist_r[50:150] + hist_b[50:150] + 0.001)
        
        # Calculate color variance (diverse colors suggest leaf with spots/disease)
        color_std = np.std([np.std(img_rgb[:,:,0]), np.std(img_rgb[:,:,1]), np.std(img_rgb[:,:,2])])
        
        score = 0.0
        
        # Green should be somewhat dominant
        if green_dominance > 1.2:
            score += 0.5
        elif green_dominance > 0.8:
            score += 0.3
        else:
            score += 0.1
        
        # Should have some color variation (disease spots, veins)
        if 20 < color_std < 60:
            score += 0.5
        elif 10 < color_std <= 20 or 60 <= color_std < 80:
            score += 0.3
        else:
            score += 0.1
        
        print(f"Color distribution score: {score:.2f} (Green dominance: {green_dominance:.2f})", file=sys.stderr)
        return score
        
    except Exception as e:
        print(f"Error in color distribution check: {e}", file=sys.stderr)
        return 0.5

def check_image_dimensions(img):
    """
    Check if image dimensions and quality are reasonable
    """
    try:
        height, width = img.shape[:2]
        
        # Check minimum size
        if height < 64 or width < 64:
            return 0.0
        
        # Check aspect ratio
        aspect_ratio = max(width, height) / min(width, height)
        if aspect_ratio > 4:  # Too elongated
            return 0.2
        elif aspect_ratio > 3:
            return 0.5
        else:
            return 1.0
        
    except Exception as e:
        print(f"Error in dimension check: {e}", file=sys.stderr)
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

def predict_image(img_path, confidence_threshold=0.50):  # Increased from 0.45
    """
    Predicts disease from a coffee leaf image with comprehensive validation
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
                "predicted_class": "Not a Coffee Leaf",
                "confidence": 0.0,
                "validation_score": validation_result.get("validation_score", 0.0)
            }
        
        print(f"Image validation passed (score: {validation_result['confidence']:.3f}), proceeding with prediction...", file=sys.stderr)
        
        # Proceed with normal prediction
        img_array = preprocess_image(img_path)
        preds = model.predict(img_array, verbose=0)
        class_idx = np.argmax(preds[0])
        confidence = float(preds[0][class_idx])
        
        # Calculate prediction entropy (lower = more confident)
        entropy = -np.sum(preds[0] * np.log(preds[0] + 1e-10))
        
        print(f"Prediction: {CLASS_NAMES[class_idx]} ({confidence:.2%}), Entropy: {entropy:.3f}", file=sys.stderr)
        
        # Cross-validate with image quality
        validation_score = validation_result.get("confidence", 1.0)
        
        # STRICTER check: If validation score is low, reject even with high model confidence
        if validation_score < 0.3:  # Changed from 0.4
            return {
                "status": "invalid_image",
                "predicted_class": "Not a Coffee Leaf",
                "confidence": confidence,
                "validation_score": validation_score,
                "error": "Image does not appear to be a coffee leaf",
                "suggestion": "Please upload a clear photo of a single coffee leaf with good lighting",
                "advice": "The uploaded image doesn't meet the criteria for a coffee leaf. Please upload a clear photo of a coffee plant leaf.",
                "all_probabilities": {
                    CLASS_NAMES[i]: float(preds[0][i]) for i in range(len(CLASS_NAMES))
                }
            }
        
        # If model confidence is low
        if confidence < confidence_threshold:
            return {
                "status": "low_quality_prediction",
                "predicted_class": CLASS_NAMES[class_idx],
                "confidence": confidence,
                "validation_score": validation_score,
                "warning": "Prediction confidence is too low",
                "suggestion": "Please upload a clearer, well-lit image focusing on a single coffee leaf",
                "advice": f"Detected {CLASS_NAMES[class_idx]} but with low confidence ({confidence:.1%}). Please upload a clearer image for accurate diagnosis.",
                "all_probabilities": {
                    CLASS_NAMES[i]: float(preds[0][i]) for i in range(len(CLASS_NAMES))
                }
            }
        
        # High entropy means uncertain prediction
        if entropy > 1.0:
            return {
                "status": "low_quality_prediction",
                "predicted_class": CLASS_NAMES[class_idx],
                "confidence": confidence,
                "validation_score": validation_score,
                "warning": "Model is uncertain about this prediction",
                "suggestion": "Try uploading a different angle or better quality image",
                "advice": f"Detected {CLASS_NAMES[class_idx]} but the model is uncertain. Consider uploading another image for verification.",
                "all_probabilities": {
                    CLASS_NAMES[i]: float(preds[0][i]) for i in range(len(CLASS_NAMES))
                }
            }
        
        # Successful prediction
        result = {
            "status": "success",
            "predicted_class": CLASS_NAMES[class_idx],
            "confidence": confidence,
            "validation_score": validation_score,
            "all_probabilities": {
                CLASS_NAMES[i]: float(preds[0][i]) for i in range(len(CLASS_NAMES))
            },
            "reliable": True,
            "advice": f"The leaf is classified as **{CLASS_NAMES[class_idx]}** "
                  f"with {confidence:.1%} confidence."
        }

        return result
        
    except Exception as e:
        print(f"Prediction error: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        raise RuntimeError(f"Prediction failed: {e}")