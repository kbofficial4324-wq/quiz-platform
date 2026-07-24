import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    pdfFile: {
      type: String,
      default: "",
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    uploadedBy: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Quiz", quizSchema);