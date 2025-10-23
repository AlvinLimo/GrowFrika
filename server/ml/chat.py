import os
import sys
import json
from openai import OpenAI

# Setup OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_chat_response(conversation_history):
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=conversation_history,
            temperature=0.7,
            max_tokens=500
        )
        
        response = completion.choices[0].message.content
        return {"response": response, "success": True}
    
    except Exception as e:
        return {"error": str(e), "success": False}

def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No file path provided"}))
            return
        
        # ✅ Read from FILE, not from command argument
        file_path = sys.argv[1]
        
        print(f"Reading from file: {file_path}", file=sys.stderr)
        
        if not os.path.exists(file_path):
            print(json.dumps({"error": f"File not found: {file_path}"}))
            return
            
        with open(file_path, 'r', encoding='utf-8') as f:
            conversation_history = json.load(f)
        
        print(f"Loaded {len(conversation_history)} messages", file=sys.stderr)
        
        # Get response
        result = get_chat_response(conversation_history)
        print(json.dumps(result))
    
    except Exception as e:
        print(json.dumps({
            "error": "Chat failed",
            "details": str(e)
        }))
    
    sys.stdout.flush()
    sys.exit(0)

if __name__ == "__main__":
    main()