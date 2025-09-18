import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

const router = express.Router();

// Multer setup - specify field name and file limits
const upload = multer({ 
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ====== POST /api/ml/predict ======
router.post("/predict", upload.single("image"), (req: Request, res: Response): void => {
  try {
    console.log("Received prediction request");
    
    if (!req.file) {
      console.log("No file uploaded");
      res.status(400).json({ error: "No image uploaded" });
      return;
    }

    console.log("File received:", req.file.filename, req.file.mimetype);
    const imgPath = path.resolve(req.file.path);

    // Check if Python script exists
const scriptPath = path.join(process.cwd(), "ml", "predict.py");
    if (!fs.existsSync(scriptPath)) {
      console.error("Python script not found:", scriptPath);
      res.status(500).json({ error: "Prediction script not found" });
      return;
    }

    console.log("Spawning Python process...");
    // Try python3 first, then python
    const pythonProcess = spawn("python", [scriptPath, imgPath]);

    let resultData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data: Buffer) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data: Buffer) => {
      const errorMsg = data.toString();
      console.error(`Python Error: ${errorMsg}`);
      errorData += errorMsg;
    });

    pythonProcess.on("error", (error) => {
      console.error("Failed to start Python process:", error);
      res.status(500).json({ 
        error: "Failed to start prediction process",
        details: error.message 
      });
      
      // Clean up
      fs.unlink(imgPath, () => {});
    });

    pythonProcess.on("close", (code: number) => {
      console.log(`Python process exited with code ${code}`);
      
      try {
        if (code !== 0) {
          throw new Error(`Python process failed with code ${code}: ${errorData}`);
        }
        
        if (!resultData.trim()) {
          throw new Error("No output from Python script");
        }
        
        const result = JSON.parse(resultData);
        console.log("Prediction result:", result);
        res.json({
          prediction: result, // Wrap in prediction object for frontend compatibility
          success: true
        });
      } catch (err) {
        console.error("Processing Error:", err);
        res.status(500).json({ 
          error: "Failed to process prediction",
          details: err instanceof Error ? err.message : "Unknown error",
          pythonOutput: resultData,
          pythonError: errorData
        });
      }

      // Clean up uploaded file
      fs.unlink(imgPath, (unlinkErr) => {
        if (unlinkErr) console.error("Failed to delete uploaded image:", unlinkErr);
      });
    });

  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ 
      error: "Prediction failed",
      details: err instanceof Error ? err.message : "Unknown error"
    });
  }
});

export default router;