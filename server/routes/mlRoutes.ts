import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

const router = express.Router();

// Multer setup
const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Store conversation histories (in production, use a database)
const conversationHistories = new Map<string, Array<{role: string, content: string}>>();

// ====== POST /api/ml/predict (Image Upload) ======
router.post("/predict", upload.single("image"), (req: Request, res: Response): void => {
  try {
    console.log("Received prediction request");
    
    if (!req.file) {
      res.status(400).json({ error: "No image uploaded" });
      return;
    }

    const imgPath = path.resolve(req.file.path);
    const scriptPath = path.join(process.cwd(), "ml", "predict.py");

    if (!fs.existsSync(scriptPath)) {
      res.status(500).json({ error: "Prediction script not found" });
      return;
    }

    const pythonProcess = spawn("python", [scriptPath, imgPath], { shell: true });

    let resultData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data: Buffer) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data: Buffer) => {
      errorData += data.toString();
    });

    pythonProcess.on("close", (code: number) => {
      try {
        if (code !== 0) {
          throw new Error(`Python process failed: ${errorData}`);
        }
        
        const result = JSON.parse(resultData);
        
        // Generate a conversation ID
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Initialize conversation history with the diagnosis context
        const initialContext = {
          role: "system",
          content: `You are an expert coffee plant agronomist. The user just received a diagnosis: ${result.predicted_class} with ${(result.confidence * 100).toFixed(2)}% confidence. Previous advice: ${result.llm_response || result.advice}. Continue helping the user with follow-up questions about this diagnosis or coffee plant care in general.`
        };
        
        conversationHistories.set(conversationId, [initialContext]);
        
        // Add conversationId to the response
        result.conversationId = conversationId;
        
        res.json({ prediction: result, success: true });
      } catch (err) {
        console.error("Processing Error:", err);
        res.status(500).json({ 
          error: "Failed to process prediction",
          details: err instanceof Error ? err.message : "Unknown error"
        });
      }

      // Clean up
      fs.unlink(imgPath, () => {});
    });

  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

// ====== POST /api/ml/chat (Text Chat) - PROPERLY FIXED ======
router.post("/chat", express.json(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, conversation_id } = req.body;

    console.log("=== CHAT REQUEST ===");
    console.log("Message:", message);
    console.log("ConversationId:", conversation_id);

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Get or create conversation history
    let conversationHistory = conversationHistories.get(conversation_id) || [
      {
        role: "system",
        content: "You are an expert coffee plant agronomist assistant. Help users with coffee plant diseases, care, and cultivation advice. Be more human and friendly in a way that the user feels as if they are talking to someone that is empathetic and also well educated in the field."
      }
    ];

    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: message
    });

    // ✅ Create a temporary file to store the conversation
    const tempFileName = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.json`;
    const tempFilePath = path.join(process.cwd(), "uploads", tempFileName);

    try {
      // Write conversation history to temp file
      fs.writeFileSync(tempFilePath, JSON.stringify(conversationHistory), 'utf-8');
      console.log("Created temp file:", tempFilePath);

      const scriptPath = path.join(process.cwd(), "ml", "chat.py");
      
      if (!fs.existsSync(scriptPath)) {
        console.error("Chat script not found at:", scriptPath);
        res.status(500).json({ error: "Chat script not found" });
        return;
      }

      // ✅ Pass the FILE PATH to Python, not the JSON string
      const pythonProcess = spawn(
        "python", 
        [scriptPath, tempFilePath], // Pass file path, not JSON
        { shell: true }
      );

      let resultData = "";
      let errorData = "";

      pythonProcess.stdout.on("data", (data: Buffer) => {
        resultData += data.toString();
      });

      pythonProcess.stderr.on("data", (data: Buffer) => {
        errorData += data.toString();
      });

      pythonProcess.on("close", (code: number) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFilePath);
          console.log("Deleted temp file");
        } catch (err) {
          console.error("Failed to delete temp file:", err);
        }

        try {
          if (code !== 0) {
            throw new Error(`Chat process failed: ${errorData}`);
          }

          if (!resultData.trim()) {
            throw new Error("No output from Python script");
          }

          console.log("Python response:", resultData);
          const result = JSON.parse(resultData);

          // Check for errors from Python
          if (result.error) {
            throw new Error(result.error);
          }

          // Add assistant response to history
          conversationHistory.push({
            role: "assistant",
            content: result.response
          });

          // Update stored history (keep last 20 messages)
          if (conversationHistory.length > 20) {
            conversationHistory = [
              conversationHistory[0],
              ...conversationHistory.slice(-19)
            ];
          }
          
          conversationHistories.set(conversation_id, conversationHistory);
          console.log("✅ Chat completed successfully");

          res.json({
            response: result.response,
            conversationId: conversation_id,
            success: true
          });

        } catch (err) {
          console.error("❌ Chat processing error:", err);
          res.status(500).json({
            error: "Failed to process chat",
            details: err instanceof Error ? err.message : "Unknown error",
            pythonOutput: resultData,
            pythonError: errorData
          });
        }
      });

    } catch (fileErr) {
      console.error("❌ Failed to write temp file:", fileErr);
      res.status(500).json({ error: "Failed to create temporary file" });
    }

  } catch (err) {
    console.error("❌ Chat route error:", err);
    res.status(500).json({ error: "Chat request failed" });
  }
});

// ====== DELETE /api/ml/conversation/:id (Clear History) ======
router.delete("/conversation/:id", (req: Request, res: Response): void => {
  const { id } = req.params;
  conversationHistories.delete(id);
  res.json({ success: true, message: "Conversation cleared" });
});

export default router;