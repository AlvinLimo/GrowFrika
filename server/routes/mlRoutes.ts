import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

const router = express.Router();

// Multer setup for image upload
const upload = multer({ dest: "uploads/" });

// ====== POST /api/ml/predict ======
router.post("/predict", upload.any(), (req: Request, res: Response): void => {
  try {
    if (!req.files || !(req.files as Express.Multer.File[]).length) {
      res.status(400).json({ error: "No image uploaded" });
      return;
    }

    const file = (req.files as Express.Multer.File[])[0];
    const imgPath = path.resolve(file.path);

    // Spawn Python process
    const pythonProcess = spawn("python3", ["ml/predict.py", imgPath]);

    let resultData = "";

    pythonProcess.stdout.on("data", (data: Buffer) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data: Buffer) => {
      console.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on("close", (code: number) => {
      try {
        const result = JSON.parse(resultData);
        res.json(result);
      } catch (err) {
        console.error("JSON Parse Error:", err);
        res.status(500).json({ error: "Failed to parse prediction output" });
      }

      // Clean up uploaded file
      fs.unlink(imgPath, (unlinkErr) => {
        if (unlinkErr) console.error("Failed to delete uploaded image:", unlinkErr);
      });
    });

  } catch (err) {
    console.error("Prediction route error:", err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

export default router;