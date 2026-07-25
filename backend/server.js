import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/database.js";

import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// =========================
// Middleware
// =========================

app.use(
  cors({
    origin: [
      "https://quiz-platform-frontend-tjbw.onrender.com",
      "https://quiz-platform-five-omega.vercel.app",
      "https://quiz-platform-mauve-theta.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// Test Routes
// =========================

app.get("/", (req, res) => {
  res.send("Quiz Platform Backend Running 🚀");
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Quiz Platform API is Working",
  });
});

// =========================
// API Routes
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// =========================
// 404 Route
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// =========================
// Start Server
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});