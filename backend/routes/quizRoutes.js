import express from "express";
import upload from "../middleware/upload.js";
import { uploadQuiz, getAllQuizzes } from "../controllers/quizController.js";

const router = express.Router();

router.post("/upload", upload.single("pdf"), uploadQuiz);

router.get("/", getAllQuizzes);

export default router;
