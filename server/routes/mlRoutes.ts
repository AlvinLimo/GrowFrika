import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { authenticateToken } from "../middleware/jwtauth";
import { Conversation } from "../models/Conversations"
import { Message } from "../models/Messages";

Conversation.hasMany(Message, {
    foreignKey: 'convo_id',
    as: 'messages',
    onDelete: 'CASCADE'
});

Message.belongsTo(Conversation, {
    foreignKey: 'convo_id',
    as: 'conversation'
});

const router = express.Router();

// Multer setup
const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Store conversation histories temporarily (still needed for ML context)
const conversationHistories = new Map<string, Array<{role: string, content: string}>>();

// ====== POST /api/ml/predict (Image Upload) ======
router.post("/predict", authenticateToken, upload.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Received prediction request");
    
    if (!req.file) {
      res.status(400).json({ error: "No image uploaded" });
      return;
    }

    const user_id = req.user?.user_id;
    if(!user_id){
      res.status(401).json({ error: "User not authenticated" });
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

    pythonProcess.on("close", async (code: number) => {
      try {
        if (code !== 0) {
          throw new Error(`Python process failed: ${errorData}`);
        }
        
        const result = JSON.parse(resultData);
        
        console.log("🐍 Python result:", result); // Debug log
        
        // Extract the LLM response from the result
        const llmResponse = result.llm_response || result.advice || "Analysis complete";
        
        console.log("💬 LLM Response:", llmResponse); // Debug log
        
        // Determine conversation title based on status
        let conversationTitle = "";
        if (result.status === "invalid_image") {
          conversationTitle = "Invalid Image Upload";
        } else if (result.status === "low_quality_prediction") {
          conversationTitle = `${result.predicted_class} (Low Confidence)`;
        } else if (result.status === "success") {
          conversationTitle = `${result.predicted_class} Diagnosis`;
        } else {
          conversationTitle = "Image Analysis";
        }

        // Create a new conversation in the database
        const conversation = await Conversation.create({
          user_id,
          title: conversationTitle,
          category: 'plant-disease',
          last_message_at: new Date()
        });

        const convo_id = conversation.getDataValue('convo_id');
        
        // Save the image URL
        const imageUrl = `/uploads/${req.file!.filename}`;

        // Save user's initial message (the image)
        const userMessage = await Message.create({
          convo_id,
          role: 'user',
          content: `Uploaded image for plant disease diagnosis`,
          image_urls: [imageUrl],
          metadata: {
            original_filename: req.file!.originalname,
            file_size: req.file!.size
          }
        });

        // Prepare assistant message metadata based on status
        let assistantMetadata: any = {
          predicted_class: result.predicted_class,
          confidence: result.confidence,
          model_used: 'plant-disease-detection',
          diagnosis_timestamp: new Date(),
          status: result.status || 'success'
        };

        // Add validation details for invalid images
        if (result.validation_details) {
          assistantMetadata.validation_details = result.validation_details;
        }
        
        if (result.validation_score !== undefined) {
          assistantMetadata.validation_score = result.validation_score;
        }

        // Add warning for low quality predictions
        if (result.warning) {
          assistantMetadata.warning = result.warning;
        }

        // Add reason for invalid images
        if (result.reason) {
          assistantMetadata.reason = result.reason;
        }
        
        // Add all probabilities if available
        if (result.all_probabilities) {
          assistantMetadata.all_probabilities = result.all_probabilities;
        }

        // ✅ Save AI's diagnosis response - USE llmResponse here!
        const assistantMessage = await Message.create({
          convo_id,
          role: 'assistant',
          content: llmResponse, // ✅ This is the key fix
          metadata: assistantMetadata
        });

        // Initialize conversation history for ML context
        let systemContextMessage = "";
        
        if (result.status === "invalid_image") {
          systemContextMessage = `The user uploaded an image that was not identified as a coffee plant leaf. The system said: "${llmResponse}". Help them understand they need to upload a proper coffee leaf image for diagnosis.`;
        } else if (result.status === "low_quality_prediction") {
          systemContextMessage = `You are an expert coffee plant agronomist. The user received a low-confidence diagnosis: ${result.predicted_class} with ${(result.confidence * 100).toFixed(2)}% confidence. The image quality may be poor or it may not be a coffee leaf. Previous advice: ${llmResponse}. Help the user get a better diagnosis or answer their questions about coffee plant care.`;
        } else {
          systemContextMessage = `You are an expert coffee plant agronomist. The user just received a diagnosis: ${result.predicted_class} with ${(result.confidence * 100).toFixed(2)}% confidence. Previous advice: ${llmResponse}. Continue helping the user with follow-up questions about this diagnosis or coffee plant care in general.`;
        }

        const initialContext = {
          role: "system",
          content: systemContextMessage
        };
        
        conversationHistories.set(convo_id, [initialContext]);
        
        console.log("✅ Prediction completed and saved to database");
        console.log("   Conversation ID:", convo_id);
        console.log("   Status:", result.status);
        console.log("   User Message ID:", userMessage.message_id);
        console.log("   Assistant Message ID:", assistantMessage.message_id);
        console.log("   Assistant Content:", llmResponse); // Debug log
        
        // Return consistent structure
        res.json({ 
          success: true,
          conversation: {
            convo_id: convo_id,
            title: conversation.title
          },
          userMessage: {
            message_id: userMessage.message_id,
            content: userMessage.content,
            image_urls: userMessage.image_urls,
            created_at: userMessage.created_at,
            metadata: userMessage.metadata
          },
          assistantMessage: {
            message_id: assistantMessage.message_id,
            content: llmResponse, // ✅ Send the actual LLM response
            created_at: assistantMessage.created_at,
            metadata: assistantMetadata
          },
          // Include prediction data for backward compatibility
          prediction: {
            predicted_class: result.predicted_class,
            confidence: result.confidence,
            status: result.status,
            conversationId: convo_id,
            llm_response: llmResponse // ✅ Include here too for fallback
          }
        });
      } catch (err) {
        console.error("❌ Processing Error:", err);
        res.status(500).json({ 
          error: "Failed to process prediction",
          details: err instanceof Error ? err.message : "Unknown error"
        });
      }

      // Clean up uploaded file
      fs.unlink(imgPath, () => {});
    });

  } catch (err) {
    console.error("❌ Route error:", err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

// ====== POST /api/ml/chat (Text Chat) ======
router.post("/chat", authenticateToken, express.json(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const user_id = req.user?.user_id; // or req.user.id depending on your middleware
    const { convo_id } = req.body;

    console.log("=== CHAT REQUEST ===");
    console.log("Message:", message);
    console.log("ConversationId:", convo_id);

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (!convo_id) {
      res.status(400).json({ error: "Conversation ID is required" });
      return;
    }

    // ===== DATABASE INTEGRATION: Verify conversation belongs to user =====
    const conversation = await Conversation.findOne({
      where: { convo_id: convo_id, user_id }
    });

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // ===== Save user's message to database =====
    const userMessage = await Message.create({
      convo_id: convo_id,
      role: 'user',
      content: message,
      image_urls: []
    });

    // Get or create conversation history for ML context
    let conversationHistory = conversationHistories.get(convo_id) || [
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

      const pythonProcess = spawn(
        "python", 
        [scriptPath, tempFilePath],
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

      pythonProcess.on("close", async (code: number) => {
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

          // ===== DATABASE INTEGRATION: Save AI's response =====
          const assistantMessage = await Message.create({
            convo_id: convo_id,
            role: 'assistant',
            content: result.response,
            metadata: {
              model_used: 'ml-chat-model',
              response_timestamp: new Date()
            }
          });

          // Update conversation's last_message_at
          conversation.last_message_at = new Date();
          await conversation.save();

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
          
          conversationHistories.set(convo_id, conversationHistory);
          console.log("✅ Chat completed and saved to database");

          res.json({
            response: result.response,
            conversationId: convo_id,
            userMessage: {
              message_id: userMessage.message_id,
              content: userMessage.content,
              created_at: userMessage.created_at
            },
            assistantMessage: {
              message_id: assistantMessage.message_id,
              content: assistantMessage.content,
              created_at: assistantMessage.created_at
            },
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

// Get all conversations for authenticated user
router.get("/conversations", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user_id from authenticated request
    const user_id = req.user?.user_id;

    console.log('Fetching conversations for user_id:', user_id);

    if (!user_id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { limit = 50, offset = 0 } = req.query;

    const conversations = await Conversation.findAll({
      where: { 
        user_id, 
        is_archived: false 
      },
      order: [['last_message_at', 'DESC']],
      limit: Number(limit),
      offset: Number(offset),
      include: [{
        model: Message,
        as: 'messages',
        limit: 1,
        order: [['created_at', 'DESC']],
        attributes: ['message_id', 'content', 'role', 'created_at'],
        separate: true
      }]
    });

    console.log(`Found ${conversations.length} conversations for user ${user_id}`);

    res.json({
      conversations,
      total: conversations.length,
      success: true
    });
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ 
      error: "Failed to fetch conversations",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Get a specific conversation with all messages
router.get("/conversations/:convo_id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;
    const { convo_id } = req.params;

    if (!user_id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const conversation = await Conversation.findOne({
      where: { 
        convo_id, 
        user_id 
      },
      include: [{
        model: Message,
        as: 'messages',
        order: [['created_at', 'ASC']],
        attributes: ['message_id', 'content', 'role', 'image_urls', 'metadata', 'created_at']
      }]
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json({
      conversation,
      success: true
    });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ 
      error: "Failed to fetch conversation",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Delete a conversation
router.delete("/conversation/:convo_id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;
    const { convo_id } = req.params;

    if (!user_id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const conversation = await Conversation.findOne({
      where: { 
        convo_id, 
        user_id 
      }
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Delete the conversation (will cascade delete messages)
    await conversation.destroy();

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (err) {
    console.error("Error deleting conversation:", err);
    res.status(500).json({ 
      error: "Failed to delete conversation",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Archive a conversation
router.patch("/conversation/:convo_id/archive", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;
    const { convo_id } = req.params;

    if (!user_id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const conversation = await Conversation.findOne({
      where: { 
        convo_id, 
        user_id 
      }
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    conversation.is_archived = true;
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation archived successfully'
    });
  } catch (err) {
    console.error("Error archiving conversation:", err);
    res.status(500).json({ 
      error: "Failed to archive conversation",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;