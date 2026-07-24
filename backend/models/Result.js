import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },

    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    score: Number,

    totalQuestions: Number,

    answers: [
      {
        question: String,

        studentAnswer: String,

        correctAnswer: String,

        isCorrect: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Result", resultSchema);