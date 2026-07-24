import express from "express";
import { getQuestionsByQuiz } from "../controllers/questionController.js";

const router = express.Router();

router.get("/:quizId", getQuestionsByQuiz);

export default router;