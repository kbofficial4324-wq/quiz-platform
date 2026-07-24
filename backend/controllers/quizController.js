import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import { extractQuestionsFromPDF } from "../services/pdfService.js";

// Upload Quiz
export const uploadQuiz = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF",
      });
    }

    const quiz = new Quiz({
      title: req.file.originalname.replace(".pdf", ""),
      pdfFile: req.file.filename,
      uploadedBy: "Admin",
    });

    await quiz.save();

    const questions = await extractQuestionsFromPDF(req.file.path);

    console.log("Questions Found:", questions.length);
    console.log(questions);

    for (const q of questions) {
      await Question.create({
        quizId: quiz._id,
        question: q.question,
        options: q.options,
        answer: q.answer,
      });
    }

    res.status(201).json({
      message: "Quiz uploaded successfully",
      quiz,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });

    res.json(quizzes);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};