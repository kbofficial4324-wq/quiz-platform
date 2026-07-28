import Question from "../models/Question.js";
import mongoose from "mongoose";

export const getQuestionsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    console.log("================================");
    console.log("GET QUESTIONS REQUEST");
    console.log("Quiz ID received:", quizId);

    // Validate Quiz ID
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      console.log("❌ Invalid Quiz ID");

      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const questions = await Question.find({
      quizId: new mongoose.Types.ObjectId(quizId),
    }).lean();

    console.log("Questions Found:", questions.length);

    if (questions.length === 0) {
      console.log("❌ No questions found for quiz:", quizId);

      return res.status(200).json([]);
    }

    console.log("✅ Questions loaded successfully");

    return res.status(200).json(questions);
  } catch (err) {
    console.error("❌ Get Questions Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};