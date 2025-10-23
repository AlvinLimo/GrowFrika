import os
# Suppress TensorFlow messages BEFORE importing tensorflow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import sys
import json
from openai import OpenAI
from model import predict_image  # Ensure this import is correct

# 🔹 Setup OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_llm_response(prediction):
    try:
        if prediction.get("status") == "success":
            prompt = (
                f"The system detected {prediction['predicted_class']} "
                f"with {prediction['confidence']:.1%} confidence. "
                f"Advice: {prediction['advice']}. "
                "Give the user detailed next steps for treating or preventing this disease in coffee plants. Make it practical and easy to follow. Also make it quite friendly and lively. Make it considerably short" \
                " but informative."
            )
        else:
            prompt = (
                f"System could not confidently classify the image. "
                f"Reason: {prediction.get('error', prediction.get('warning', 'Unknown'))}. "
                f"Advice: {prediction.get('advice', 'Try uploading a clear coffee leaf image')}."
            )

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an agronomy assistant for coffee plants. You should provide detailed, friendly, and practical advice to coffee farmers based on system diagnoses. Make the responses as human like as possible and lively as possible."},
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
            result = {"error": "No image path provided"}
            print(json.dumps(result))
            return

        img_path = sys.argv[1]

        # Check if image file exists
        if not os.path.exists(img_path):
            result = {"error": f"Image file not found: {img_path}"}
            print(json.dumps(result))
            return

        # 🔹 Run prediction
        result = predict_image(img_path)

        # 🔹 Add LLM response
        result = get_llm_response(result)

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
