import fs from "fs";
import PDFParser from "pdf2json";

import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

// ==========================================
// Upload PDF
// ==========================================

export const uploadPDF = async (req, res) => {
  console.log("================================");
  console.log("📄 PDF UPLOAD REQUEST RECEIVED");
  console.log("================================");

  try {
    // --------------------------------------
    // Check file
    // --------------------------------------

    if (!req.file) {
      console.log("❌ No file received");

      return res.status(400).json({
        success: false,
        message: "No PDF uploaded",
      });
    }

    console.log("📄 Original file:", req.file.originalname);
    console.log("📄 Saved file:", req.file.path);
    console.log("📄 File size:", req.file.size);

    // --------------------------------------
    // Check that file actually exists
    // --------------------------------------

    if (!fs.existsSync(req.file.path)) {
      console.log(
        "❌ Uploaded file does not exist:",
        req.file.path
      );

      return res.status(500).json({
        success: false,
        message: "Uploaded PDF file was not found on server",
      });
    }

    // --------------------------------------
    // Create PDF parser
    // --------------------------------------

    const pdfParser = new PDFParser();

    // --------------------------------------
    // PDF parsing error
    // --------------------------------------

    pdfParser.on(
      "pdfParser_dataError",
      (error) => {
        console.error(
          "❌ PDF Parser Error:",
          error
        );

        return res.status(500).json({
          success: false,
          message: "Failed to parse PDF",
        });
      }
    );

    // --------------------------------------
    // PDF ready
    // --------------------------------------

    pdfParser.on(
      "pdfParser_dataReady",
      async (pdfData) => {
        try {
          console.log(
            "✅ PDF parsed successfully"
          );

          let text = "";

          // ----------------------------------
          // Extract PDF text
          // ----------------------------------

          pdfData.Pages.forEach((page) => {
            page.Texts.forEach((item) => {
              item.R.forEach((r) => {
                try {
                  text +=
                    decodeURIComponent(r.T) +
                    "\n";
                } catch (error) {
                  text += r.T + "\n";
                }
              });
            });
          });

          console.log(
            "📄 Extracted text length:",
            text.length
          );

          // ----------------------------------
          // Convert text into lines
          // ----------------------------------

          const lines = text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

          console.log(
            "📄 Total lines:",
            lines.length
          );

          // ----------------------------------
          // Create Quiz
          // ----------------------------------

          const quiz = await Quiz.create({
            title: req.file.originalname,
            pdfFile: req.file.filename,
            totalQuestions: 0,
          });

          console.log(
            "✅ Quiz created:",
            quiz._id
          );

          // ----------------------------------
          // Parse questions
          // ----------------------------------

          let currentQuestion = null;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // ================================
            // Question
            // ================================

            if (/^\d+\./.test(line)) {
              // Save previous question
              if (
                currentQuestion &&
                currentQuestion.question &&
                currentQuestion.options.length > 0 &&
                currentQuestion.answer
              ) {
                await Question.create(
                  currentQuestion
                );

                console.log(
                  "✅ Question saved:",
                  currentQuestion.question
                );
              }

              currentQuestion = {
                quizId: quiz._id,

                question: line.replace(
                  /^\d+\.\s*/,
                  ""
                ),

                options: [],

                answer: "",
              };

              continue;
            }

            // ================================
            // Options
            // ================================

            if (
              currentQuestion &&
              /^[A-D]\)/i.test(line)
            ) {
              const option = line
                .replace(
                  /^[A-D]\)\s*/i,
                  ""
                )
                .trim();

              currentQuestion.options.push(
                option
              );

              continue;
            }

            // ================================
            // Answer
            // ================================

            if (
              currentQuestion &&
              /^Answer\s*:/i.test(line)
            ) {
              const match = line.match(
                /^Answer\s*:\s*([A-D])/i
              );

              if (match) {
                const letter =
                  match[1].toUpperCase();

                const index = [
                  "A",
                  "B",
                  "C",
                  "D",
                ].indexOf(letter);

                if (
                  index >= 0 &&
                  currentQuestion.options[
                    index
                  ]
                ) {
                  currentQuestion.answer =
                    currentQuestion.options[
                      index
                    ];

                  console.log(
                    "✅ Answer:",
                    currentQuestion.answer
                  );
                }
              }

              continue;
            }
          }

          // ----------------------------------
          // Save final question
          // ----------------------------------

          if (
            currentQuestion &&
            currentQuestion.question &&
            currentQuestion.options.length > 0 &&
            currentQuestion.answer
          ) {
            await Question.create(
              currentQuestion
            );

            console.log(
              "✅ Final question saved:",
              currentQuestion.question
            );
          }

          // ----------------------------------
          // Count questions
          // ----------------------------------

          const totalQuestions =
            await Question.countDocuments({
              quizId: quiz._id,
            });

          console.log(
            "📊 Total questions saved:",
            totalQuestions
          );

          // ----------------------------------
          // Update quiz
          // ----------------------------------

          quiz.totalQuestions =
            totalQuestions;

          await quiz.save();

          console.log(
            "✅ Quiz updated successfully"
          );

          // ----------------------------------
          // Delete temporary PDF
          // ----------------------------------

          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);

            console.log(
              "🗑️ Temporary PDF deleted"
            );
          }

          // ----------------------------------
          // Response
          // ----------------------------------

          return res.status(200).json({
            success: true,

            message:
              "Quiz PDF imported successfully",

            quizId: quiz._id,

            totalQuestions,
          });
        } catch (error) {
          console.error(
            "❌ PDF PROCESSING ERROR:",
            error
          );

          // Delete temporary file
          if (
            req.file &&
            req.file.path &&
            fs.existsSync(req.file.path)
          ) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (deleteError) {
              console.error(
                "Delete error:",
                deleteError
              );
            }
          }

          return res.status(500).json({
            success: false,
            message:
              error.message ||
              "Failed to process PDF",
          });
        }
      }
    );

    // --------------------------------------
    // Start parsing
    // --------------------------------------

    console.log(
      "🔄 Starting PDF parser..."
    );

    pdfParser.loadPDF(req.file.path);
  } catch (error) {
    console.error(
      "❌ UPLOAD PDF ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
};