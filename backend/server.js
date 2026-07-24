import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import quizRoutes from "./routes/quizRoutes.js";

import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";


dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Quiz Platform API");
});

app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
