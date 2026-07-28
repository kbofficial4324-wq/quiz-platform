import express from "express";
import upload from "../middleware/upload.js";
import { uploadPDF } from "../controllers/pdfController.js";

const router = express.Router();

router.post(
  "/upload",
  (req, res, next) => {
    console.log("================================");
    console.log("🚀 PDF UPLOAD ROUTE STARTED");
    console.log("================================");

    next();
  },
  upload.single("pdf"),
  (req, res, next) => {
    console.log("================================");
    console.log("✅ MULTER FINISHED");
    console.log("File:", req.file);
    console.log("================================");

    next();
  },
  uploadPDF
);

export default router;