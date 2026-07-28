import fs from "fs";
import PDFParser from "pdf2json";

import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

export const uploadPDF = async (req, res) => {
  try {
    // ==========================================
    // Check PDF
    // ==========================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF uploaded",
      });
    }

    console.log("====================================");
    console.log("📄 PDF Upload Started");
    console.log("File:", req.file.originalname);

    const pdfParser = new PDFParser();

    // ==========================================
    // PDF Parsing Error
    // ==========================================

    pdfParser.on("pdfParser_dataError", (err) => {
      console.error("❌ PDF Parser Error:", err);

      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        success: false,
        message: "Failed to parse PDF",
      });
    });

    // ==========================================
    // PDF Successfully Parsed
    // ==========================================

    pdfParser.on("pdfParser_dataReady", async (pdfData) => {
      try {
        let text = "";

        // ==========================================
        // Extract text from PDF
        // ==========================================

        pdfData.Pages.forEach((page) => {
          page.Texts.forEach((item) => {
            item.R.forEach((r) => {
              try {
                text += decodeURIComponent(r.T) + "\n";
              } catch (error) {
                text += r.T + "\n";
              }
            });
          });
        });

        console.log("====================================");
        console.log("📄 Extracted PDF Text:");
        console.log(text);
        console.log("====================================");

        // ==========================================
        // Convert PDF text into lines
        // ==========================================

        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        console.log("Total extracted lines:", lines.length);

        // ==========================================
        // Create Quiz
        // ==========================================

        const quiz = await Quiz.create({
          title: req.file.originalname,
          pdfFile: req.file.filename,
          totalQuestions: 0,
        });

        console.log("✅ Quiz Created:", quiz._id);

        // ==========================================
        // Question Parser
        // ==========================================

        let currentQuestion = null;

        const questionsToSave = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // ------------------------------------------
          // QUESTION
          // Example:
          // 1. What does AI stand for?
          // ------------------------------------------

          if (/^\d+\.\s*/.test(line)) {
            // Save previous question into array
            if (
              currentQuestion &&
              currentQuestion.question &&
              currentQuestion.options.length > 0 &&
              currentQuestion.answer
            ) {
              questionsToSave.push(currentQuestion);
            }

            currentQuestion = {
              quizId: quiz._id,
              question: line.replace(/^\d+\.\s*/, "").trim(),
              options: [],
              answer: "",
            };

            continue;
          }

          // ------------------------------------------
          // OPTIONS
          // A) Artificial Intelligence
          // B) Machine Learning
          // C) Internet
          // D) Computer
          // ------------------------------------------

          if (
            currentQuestion &&
            /^[A-D][\)\.]\s*/i.test(line)
          ) {
            const option = line
              .replace(/^[A-D][\)\.]\s*/i, "")
              .trim();

            currentQuestion.options.push(option);

            continue;
          }

          // ------------------------------------------
          // ANSWER
          // Answer: B
          // Answer: B) Artificial Intelligence
          // ------------------------------------------

          if (
            currentQuestion &&
            /^Answer\s*:/i.test(line)
          ) {
            const answerText = line
              .replace(/^Answer\s*:\s*/i, "")
              .trim();

            // Example: B
            const letterMatch = answerText.match(
              /^([A-D])/i
            );

            if (letterMatch) {
              const letter =
                letterMatch[1].toUpperCase();

              const index =
                ["A", "B", "C", "D"].indexOf(letter);

              if (
                index >= 0 &&
                currentQuestion.options[index]
              ) {
                currentQuestion.answer =
                  currentQuestion.options[index];
              }
            }

            continue;
          }
        }

        // ==========================================
        // Save last question
        // ==========================================

        if (
          currentQuestion &&
          currentQuestion.question &&
          currentQuestion.options.length > 0 &&
          currentQuestion.answer
        ) {
          questionsToSave.push(currentQuestion);
        }

        // ==========================================
        // Debug information
        // ==========================================

        console.log(
          "Questions successfully parsed:",
          questionsToSave.length
        );

        questionsToSave.forEach((q, index) => {
          console.log(
            `Question ${index + 1}:`,
            q.question
          );

          console.log(
            "Options:",
            q.options
          );

          console.log(
            "Answer:",
            q.answer
          );
        });

        // ==========================================
        // No questions found
        // ==========================================

        if (questionsToSave.length === 0) {
          await Quiz.findByIdAndDelete(quiz._id);

          if (
            req.file?.path &&
            fs.existsSync(req.file.path)
          ) {
            fs.unlinkSync(req.file.path);
          }

          return res.status(400).json({
            success: false,
            message:
              "No valid questions were found in the PDF. Check the PDF format.",
          });
        }

        // ==========================================
        // Save questions to MongoDB Atlas
        // ==========================================

        const savedQuestions =
          await Question.insertMany(
            questionsToSave
          );

        console.log(
          "✅ Questions saved:",
          savedQuestions.length
        );

        // ==========================================
        // Update Quiz Question Count
        // ==========================================

        quiz.totalQuestions =
          savedQuestions.length;

        await quiz.save();

        console.log(
          "✅ Quiz updated with question count:",
          quiz.totalQuestions
        );

        // ==========================================
        // Delete uploaded PDF from server
        // ==========================================

        if (
          req.file?.path &&
          fs.existsSync(req.file.path)
        ) {
          fs.unlinkSync(req.file.path);
        }

        // ==========================================
        // Success
        // ==========================================

        console.log("🎉 PDF Import Successful");
        console.log("Quiz ID:", quiz._id);
        console.log(
          "Total Questions:",
          savedQuestions.length
        );
        console.log("====================================");

        return res.status(201).json({
          success: true,
          message: "Quiz imported successfully",
          quizId: quiz._id,
          totalQuestions: savedQuestions.length,
        });
      } catch (error) {
        console.error(
          "❌ PDF Processing Error:",
          error
        );

        if (
          req.file?.path &&
          fs.existsSync(req.file.path)
        ) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // ==========================================
    // Start PDF Parsing
    // ==========================================

    pdfParser.loadPDF(req.file.path);
  } catch (error) {
    console.error(
      "❌ Upload PDF Error:",
      error
    );

    if (
      req.file?.path &&
      fs.existsSync(req.file.path)
    ) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};