import os
# Suppress TensorFlow messages BEFORE importing tensorflow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import sys
import json
import numpy as np
from PIL import Image
from openai import OpenAI
from model import predict_image  # Ensure this import is correct
import tensorflow as tf

# 🔹 Setup OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def validate_leaf_image(img_path):
    """
    Validates if the image looks like a plant leaf using multiple checks:
    1. Color analysis (green content)
    2. Edge detection (leaf texture)
    3. Aspect ratio check
    """
    try:
        img = Image.open(img_path)
        img_array = np.array(img.convert('RGB'))
        
        # Check 1: Green content analysis
        # Leaves typically have dominant green color
        red = img_array[:, :, 0]
        green = img_array[:, :, 1]
        blue = img_array[:, :, 2]
        
        # Calculate green dominance
        green_mask = (green > red) & (green > blue) & (green > 50)
        green_percentage = np.sum(green_mask) / (img_array.shape[0] * img_array.shape[1])
        
        # Check 2: Overall color variance (leaves aren't uniform)
        color_std = np.std(green)
        
        # Check 3: Brightness check (not too dark or too bright)
        brightness = np.mean(img_array)
        
        # Validation thresholds
        is_greenish = green_percentage > 0.15  # At least 15% green pixels
        has_texture = color_std > 15  # Reasonable color variance
        proper_brightness = 30 < brightness < 230  # Not too dark/bright
        
        validation_score = sum([is_greenish, has_texture, proper_brightness])
        
        return {
            "is_valid": validation_score >= 2,  # At least 2 out of 3 checks pass
            "green_percentage": float(green_percentage),
            "color_variance": float(color_std),
            "brightness": float(brightness),
            "checks_passed": validation_score
        }
        
    except Exception as e:
        return {
            "is_valid": False,
            "error": str(e)
        }


def validate_with_confidence_threshold(prediction, min_confidence=0.35):
    """
    Additional validation based on model confidence.
    If confidence is too low, the image might not be a coffee leaf.
    """
    if prediction.get("status") == "success":
        confidence = prediction.get("confidence", 0)
        if confidence < min_confidence:
            return {
                "is_valid": False,
                "reason": "low_confidence",
                "confidence": confidence
            }
    return {"is_valid": True}

def get_disease_description(disease_class):
    """
    Returns a brief, friendly description of the disease without treatment info
    """
    descriptions = {
        "rust": "coffee leaf rust, a fungal disease that causes orange-yellow powdery spots on the underside of leaves",
        "miner": "coffee leaf miner, where tiny larvae tunnel through the leaf creating winding trails",
        "phoma": "Phoma leaf spot, a fungal infection causing dark brown spots with yellowish borders on the leaves",
        "nodisease": "a healthy coffee leaf with no visible disease symptoms"
    }
    return descriptions.get(disease_class, disease_class)

def get_llm_response(prediction):
    try:
        if prediction.get("status") == "invalid_image":
            # Directly return a clear message without LLM
            error_reason = prediction.get('reason', 'Image validation failed')
            suggestion = prediction.get('suggestion', 'Please upload a clear image of a coffee leaf')
            
            prediction["llm_response"] = (
                f"⚠️ **Unable to Analyze Image**\n\n"
                f"{error_reason}\n\n"
                f"**What to do:**\n"
                f"{suggestion}\n\n"
                f"Please upload a clear photo of a coffee plant leaf so I can help diagnose any potential diseases."
            )
            return prediction
            
        elif prediction.get("status") == "low_quality_prediction":
            confidence = prediction.get('confidence', 0)
            predicted_class = prediction.get('predicted_class', 'unknown')
            
            if confidence < 0.35:  # Very low confidence
                prediction["llm_response"] = (
                    f"⚠️ **Unable to Provide Reliable Diagnosis**\n\n"
                    f"The image quality is too poor or doesn't clearly show a coffee leaf. "
                    f"The system detected '{predicted_class}' but with very low confidence ({confidence:.1%}).\n\n"
                    f"**Please upload:**\n"
                    f"- A clear, well-lit photo of a single coffee leaf\n"
                    f"- Make sure the leaf fills most of the frame\n"
                    f"- Avoid blurry or dark images"
                )
                return prediction
            
            # Otherwise use LLM for moderate confidence cases
            prompt = (
                f"The system detected {predicted_class} "
                f"but with low confidence ({confidence:.1%}). "
                "This might not be a coffee leaf or the image quality is poor. "
                "In 2-3 sentences, advise the user to take a clearer photo of a coffee leaf for better results. "
                "Be friendly but clear that the current result may not be accurate."
            )
            
        elif prediction.get("status") == "success":
            disease_class = prediction['predicted_class']
            confidence = prediction['confidence']
            disease_desc = get_disease_description(disease_class)
            
            if disease_class == "nodisease":
                prompt = (
                    f"The coffee leaf appears healthy with {confidence:.1%} confidence. "
                    "Congratulate the user briefly and encourage them to keep up the good work with their coffee plants. "
                    "Keep it cheerful, friendly, and SHORT - just 2-3 sentences maximum. "
                    "DO NOT give any care tips unless asked."
                )
            else:
                prompt = (
                    f"The system detected {disease_desc} with {confidence:.1%} confidence. "
                    "Provide a brief, friendly acknowledgment of the diagnosis. "
                    "Explain what this disease is in 2-3 sentences maximum. "
                    "DO NOT provide treatment steps, prevention methods, or any advice yet. "
                    "Just describe what the disease is and acknowledge the situation. "
                    "Keep it empathetic but SHORT. "
                    "Let the user know they can ask follow-up questions for treatment advice."
                )
        else:
            prompt = (
                f"System could not confidently classify the image. "
                f"Reason: {prediction.get('error', prediction.get('warning', 'Unknown'))}. "
                "Kindly suggest uploading a clearer coffee leaf image. Keep it brief and friendly."
            )

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an agronomy assistant for coffee plants. Provide detailed, friendly, and practical advice to coffee farmers based on system diagnoses. Make responses human-like and lively."
                },
                {"role": "user", "content": prompt}
            ]
        )

        prediction["llm_response"] = completion.choices[0].message.content
        return prediction

    except Exception as e:
        prediction["llm_response"] = f"Error getting LLM response: {str(e)}"
        return prediction


def main():
    try:
        if len(sys.argv) < 2:
            result = {"error": "No image path provided", "status": "error"}
            print(json.dumps(result))
            return

        img_path = sys.argv[1]

        # Check if image file exists
        if not os.path.exists(img_path):
            result = {"error": f"Image file not found: {img_path}", "status": "error"}
            print(json.dumps(result))
            return

        # Run prediction (validation is now inside predict_image function in model.py)
        result = predict_image(img_path)

        # Add LLM response based on status
        result = get_llm_response(result)

        print(json.dumps(result))

    except Exception as e:
        error_info = {
            "error": "Prediction failed",
            "details": str(e),
            "type": str(type(e).__name__),
            "status": "error"
        }
        print(json.dumps(error_info))

    # Force flush and exit
    sys.stdout.flush()
    sys.exit(0)

def main():
    try:
        if len(sys.argv) < 2:
            result = {"error": "No image path provided", "status": "error"}
            print(json.dumps(result))
            return

        img_path = sys.argv[1]

        # Check if image file exists
        if not os.path.exists(img_path):
            result = {"error": f"Image file not found: {img_path}", "status": "error"}
            print(json.dumps(result))
            return

        # 🔹 Step 1: Validate if image looks like a leaf
        validation = validate_leaf_image(img_path)
        
        if not validation["is_valid"]:
            result = {
                "status": "invalid_image",
                "predicted_class": "Not a Coffee Leaf",
                "confidence": 0.0,
                "reason": "The uploaded image doesn't appear to be a plant leaf. Please upload a clear image of a coffee leaf.",
                "validation_details": {
                    "green_percentage": validation.get("green_percentage", 0),
                    "checks_passed": validation.get("checks_passed", 0)
                },
                "advice": "Please upload a clear, well-lit image of a coffee plant leaf for accurate disease detection."
            }
            result = get_llm_response(result)
            print(json.dumps(result))
            return

        # 🔹 Step 2: Run prediction on validated image
        result = predict_image(img_path)

        # 🔹 Step 3: Additional confidence-based validation
        confidence_check = validate_with_confidence_threshold(result, min_confidence=0.35)
        
        if not confidence_check["is_valid"]:
            result["status"] = "low_quality_prediction"
            result["original_confidence"] = result.get("confidence", 0)
            result["warning"] = "Low confidence prediction - image may not be a coffee leaf or quality is poor"
            result["advice"] = "Try uploading a clearer, well-lit image of a coffee leaf for better results."

        # 🔹 Step 4: Add LLM response based on final status
        result = get_llm_response(result)

        print(json.dumps(result))

    except Exception as e:
        error_info = {
            "error": "Prediction failed",
            "details": str(e),
            "type": str(type(e).__name__),
            "status": "error"
        }
        print(json.dumps(error_info))

    # Force flush and exit
    sys.stdout.flush()
    sys.exit(0)


if __name__ == "__main__":
    main()