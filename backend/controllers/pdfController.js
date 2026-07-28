import fs from "fs";
import PDFParser from "pdf2json";

import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

// ==========================================
// UPLOAD PDF
// ==========================================

export const uploadPDF = async (req, res) => {
  console.log("====================================");
  console.log("📄 PDF UPLOAD REQUEST RECEIVED");
  console.log("====================================");

  try {
    // ========================================
    // Check uploaded file
    // ========================================

    if (!req.file) {
      console.log("❌ No PDF file received");

      return res.status(400).json({
        success: false,
        message: "No PDF uploaded",
      });
    }

    console.log("📄 File name:", req.file.originalname);
    console.log("📄 File path:", req.file.path);
    console.log("📄 File size:", req.file.size);
    console.log("📄 File type:", req.file.mimetype);

    // ========================================
    // Check file exists
    // ========================================

    if (!fs.existsSync(req.file.path)) {
      console.log(
        "❌ Uploaded file does not exist:",
        req.file.path
      );

      return res.status(500).json({
        success: false,
        message: "Uploaded PDF file could not be found",
      });
    }

    // ========================================
    // Create PDF parser
    // ========================================

    const pdfParser = new PDFParser();

    // ========================================
    // PDF ERROR
    // ========================================

    pdfParser.on(
      "pdfParser_dataError",
      async (error) => {
        console.error(
          "===================================="
        );

        console.error(
          "❌ PDF PARSER ERROR"
        );

        console.error(error);

        console.error(
          "===================================="
        );

        // Delete temporary file
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (deleteError) {
          console.error(
            "File deletion error:",
            deleteError
          );
        }

        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to parse PDF",
            error:
              error?.parserError ||
              error?.message ||
              String(error),
          });
        }
      }
    );

    // ========================================
    // PDF READY
    // ========================================

    pdfParser.on(
      "pdfParser_dataReady",
      async (pdfData) => {
        try {
          console.log(
            "✅ PDF successfully parsed"
          );

          // ====================================
          // Extract text
          // ====================================

          let text = "";

          if (
            !pdfData.Pages ||
            !Array.isArray(pdfData.Pages)
          ) {
            throw new Error(
              "PDF contains no readable pages"
            );
          }

          pdfData.Pages.forEach(
            (page, pageIndex) => {
              console.log(
                `📄 Processing page ${
                  pageIndex + 1
                }`
              );

              if (
                !page.Texts ||
                !Array.isArray(page.Texts)
              ) {
                return;
              }

              page.Texts.forEach(
                (item) => {
                  if (
                    !item.R ||
                    !Array.isArray(item.R)
                  ) {
                    return;
                  }

                  item.R.forEach((r) => {
                    if (r.T) {
                      try {
                        text +=
                          decodeURIComponent(
                            r.T
                          ) + "\n";
                      } catch (decodeError) {
                        console.error(
                          "Decode error:",
                          decodeError
                        );

                        text +=
                          r.T + "\n";
                      }
                    }
                  });
                }
              );
            }
          );

          console.log(
            "===================================="
          );

          console.log(
            "📄 EXTRACTED PDF TEXT"
          );

          console.log(text);

          console.log(
            "===================================="
          );

          // ====================================
          // Split lines
          // ====================================

          const lines = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(
              (line) => line.length > 0
            );

          console.log(
            "📄 Total extracted lines:",
            lines.length
          );

          // ====================================
          // Create Quiz
          // ====================================

          const quiz = await Quiz.create({
            title: req.file.originalname,
            pdfFile: req.file.filename,
          });

          console.log(
            "✅ Quiz created:",
            quiz._id
          );

          // ====================================
          // Parse questions
          // ====================================

          let currentQuestion = null;

          const questionsToSave = [];

          for (
            let i = 0;
            i < lines.length;
            i++
          ) {
            const line = lines[i];

            console.log(
              `LINE ${i + 1}:`,
              line
            );

            // ==================================
            // QUESTION
            // Supports:
            // 1. Question
            // 1) Question
            // ==================================

            const questionMatch =
              line.match(
                /^(\d+)[.)]\s*(.+)$/
              );

            if (questionMatch) {
              // Save previous question
              if (currentQuestion) {
                if (
                  currentQuestion.question &&
                  currentQuestion.options.length >=
                    2 &&
                  currentQuestion.answer
                ) {
                  questionsToSave.push(
                    currentQuestion
                  );
                } else {
                  console.log(
                    "⚠️ Skipping incomplete question:",
                    currentQuestion
                      .question
                  );

                  console.log(
                    "Options:",
                    currentQuestion.options
                  );

                  console.log(
                    "Answer:",
                    currentQuestion.answer
                  );
                }
              }

              currentQuestion = {
                quizId: quiz._id,

                question:
                  questionMatch[2].trim(),

                options: [],

                answer: "",
              };

              console.log(
                "📝 New question:",
                currentQuestion.question
              );

              continue;
            }

            // ==================================
            // OPTIONS
            // A) Option
            // B) Option
            // C) Option
            // D) Option
            //
            // Also supports:
            // A. Option
            // ==================================

            const optionMatch =
              line.match(
                /^([A-D])[.)]\s*(.+)$/i
              );

            if (
              optionMatch &&
              currentQuestion
            ) {
              const option =
                optionMatch[2].trim();

              currentQuestion.options.push(
                option
              );

              console.log(
                "Option:",
                option
              );

              continue;
            }

            // ==================================
            // ANSWER
            //
            // Answer: B
            // Answer: B) Something
            // Answer: B. Something
            // ==================================

            const answerMatch =
              line.match(
                /^Answer\s*:\s*([A-D])/i
              );

            if (
              answerMatch &&
              currentQuestion
            ) {
              const letter =
                answerMatch[1].toUpperCase();

              const answerIndex =
                ["A", "B", "C", "D"].indexOf(
                  letter
                );

              if (
                answerIndex >= 0 &&
                currentQuestion.options[
                  answerIndex
                ]
              ) {
                currentQuestion.answer =
                  currentQuestion.options[
                    answerIndex
                  ];

                console.log(
                  "✅ Answer:",
                  currentQuestion.answer
                );
              }

              continue;
            }
          }

          // ====================================
          // Save final question
          // ====================================

          if (currentQuestion) {
            if (
              currentQuestion.question &&
              currentQuestion.options.length >=
                2 &&
              currentQuestion.answer
            ) {
              questionsToSave.push(
                currentQuestion
              );
            } else {
              console.log(
                "⚠️ Final question incomplete:",
                currentQuestion.question
              );

              console.log(
                "Options:",
                currentQuestion.options
              );

              console.log(
                "Answer:",
                currentQuestion.answer
              );
            }
          }

          console.log(
            "===================================="
          );

          console.log(
            "📊 QUESTIONS READY TO SAVE:",
            questionsToSave.length
          );

          console.log(
            "===================================="
          );

          // ====================================
          // If no questions found
          // ====================================

          if (
            questionsToSave.length === 0
          ) {
            // Remove empty quiz
            await Quiz.findByIdAndDelete(
              quiz._id
            );

            try {
              if (
                fs.existsSync(
                  req.file.path
                )
              ) {
                fs.unlinkSync(
                  req.file.path
                );
              }
            } catch (deleteError) {
              console.error(
                "File delete error:",
                deleteError
              );
            }

            return res.status(400).json({
              success: false,

              message:
                "PDF uploaded, but no valid questions were found. Check the PDF format.",

              extractedLines:
                lines.length,

              questionsFound:
                questionsToSave.length,
            });
          }

          // ====================================
          // Save questions
          // ====================================

          const savedQuestions =
            await Question.insertMany(
              questionsToSave
            );

          console.log(
            "✅ QUESTIONS SAVED:",
            savedQuestions.length
          );

          // ====================================
          // Update quiz count
          // ====================================

          quiz.totalQuestions =
            savedQuestions.length;

          await quiz.save();

          console.log(
            "✅ Quiz updated:"
          );

          console.log(
            "Quiz ID:",
            quiz._id
          );

          console.log(
            "Total Questions:",
            quiz.totalQuestions
          );

          // ====================================
          // Delete temporary PDF
          // ====================================

          try {
            if (
              fs.existsSync(
                req.file.path
              )
            ) {
              fs.unlinkSync(
                req.file.path
              );

              console.log(
                "🗑️ Temporary PDF deleted"
              );
            }
          } catch (deleteError) {
            console.error(
              "PDF deletion error:",
              deleteError
            );
          }

          // ====================================
          // SUCCESS
          // ====================================

          console.log(
            "===================================="
          );

          console.log(
            "🎉 PDF IMPORT SUCCESSFUL"
          );

          console.log(
            "Quiz ID:",
            quiz._id
          );

          console.log(
            "Questions:",
            savedQuestions.length
          );

          console.log(
            "===================================="
          );

          return res.status(200).json({
            success: true,

            message:
              "Quiz PDF imported successfully",

            quizId: quiz._id,

            totalQuestions:
              savedQuestions.length,
          });

        } catch (error) {
          console.error(
            "===================================="
          );

          console.error(
            "❌ PDF PROCESSING ERROR"
          );

          console.error(error);

          console.error(
            "Message:",
            error.message
          );

          console.error(
            "Stack:",
            error.stack
          );

          console.error(
            "===================================="
          );

          // Delete temporary file
          try {
            if (
              fs.existsSync(
                req.file.path
              )
            ) {
              fs.unlinkSync(
                req.file.path
              );
            }
          } catch (deleteError) {
            console.error(
              "Delete error:",
              deleteError
            );
          }

          if (!res.headersSent) {
            return res.status(500).json({
              success: false,

              message:
                "PDF processing failed",

              error:
                error.message,
            });
          }
        }
      }
    );

    // ========================================
    // LOAD PDF
    // ========================================

    console.log(
      "📂 Loading PDF:"
    );

    console.log(
      req.file.path
    );

    pdfParser.loadPDF(
      req.file.path
    );

  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "❌ UPLOAD CONTROLLER ERROR"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,

        message:
          "PDF upload failed",

        error:
          error.message,
      });
    }
  }
};