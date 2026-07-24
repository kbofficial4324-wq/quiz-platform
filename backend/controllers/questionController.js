import Question from "../models/Question.js";
import mongoose from "mongoose";

export const getQuestionsByQuiz = async (req, res) => {
  try {
    const quizId = new mongoose.Types.ObjectId(req.params.quizId);

    const questions = await Question.find({ quizId });

    console.log("Quiz ID:", quizId);
    console.log("Questions Found:", questions.length);

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
};