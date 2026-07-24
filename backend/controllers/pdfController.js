import fs from "fs";
import PDFParser from "pdf2json";

import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No PDF uploaded",
      });
    }

    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => {
      console.error(err);

      return res.status(500).json({
        message: "Failed to parse PDF",
      });
    });

    pdfParser.on("pdfParser_dataReady", async (pdfData) => {
      try {
        let text = "";

        pdfData.Pages.forEach((page) => {
          page.Texts.forEach((item) => {
            item.R.forEach((r) => {
              text += decodeURIComponent(r.T) + "\n";
            });
          });
        });

        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l !== "");

        const quiz = await Quiz.create({
          title: req.file.originalname,
          pdfFile: req.file.filename,
        });

        let currentQuestion = null;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (/^\d+\./.test(line)) {
            if (currentQuestion) {
              await Question.create(currentQuestion);
            }

            currentQuestion = {
              quizId: quiz._id,
              question: line.replace(/^\d+\.\s*/, ""),
              options: [],
              answer: "",
            };
          }

          else if (/^[A-D]\)/.test(line)) {
            currentQuestion.options.push(
              line.substring(3).trim()
            );
          }

  else if (/^Answer\s*:/.test(line)) {

  const match = line.match(/^Answer\s*:\s*([A-D])/i);

  if (match) {

    const letter = match[1].toUpperCase();

    const index = ["A", "B", "C", "D"].indexOf(letter);

    if (
      index >= 0 &&
      currentQuestion.options[index]
    ) {
      currentQuestion.answer =
        currentQuestion.options[index];
    }

  }

}
        }

       if (currentQuestion) {

  if (!currentQuestion.answer) {
    console.log("Missing answer:", currentQuestion.question);
    console.log(currentQuestion.options);
  } else {
    await Question.create(currentQuestion);
  }

}

        quiz.totalQuestions = await Question.countDocuments({
          quizId: quiz._id,
        });

        await quiz.save();

        fs.unlinkSync(req.file.path);

        res.json({
          message: "Quiz imported successfully",
          quizId: quiz._id,
          totalQuestions: quiz.totalQuestions,
        });

      } catch (err) {
        console.error(err);

        res.status(500).json({
          message: err.message,
        });
      }
    });

    pdfParser.loadPDF(req.file.path);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};