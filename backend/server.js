import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ==============================
// Database
// ==============================

import connectDB from "./config/database.js";

// ==============================
// Routes
// ==============================

import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

// ==============================
// Load Environment Variables
// ==============================

dotenv.config();

// ==============================
// Connect MongoDB
// ==============================

connectDB();

// ==============================
// Create Express App
// ==============================

const app = express();

// ==============================
// CORS
// ==============================

const allowedOrigins = [
  "http://localhost:5173",

  "https://quiz-platform-frontend-tjbw.onrender.com",

  "https://quiz-platform-five-omega.vercel.app",

  "https://quiz-platform-mauve-theta.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // such as Postman/server requests

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(
        "⚠️ CORS blocked origin:",
        origin
      );

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ==============================
// Body Parser
// ==============================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==============================
// Request Logger
// ==============================

app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.originalUrl}`
  );

  next();
});

// ==============================
// Test Route
// ==============================

app.get("/", (req, res) => {
  res.status(200).send(
    "Quiz Platform Backend Running 🚀"
  );
});

// ==============================
// API Test
// ==============================

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Quiz Platform API is Working 🚀",
  });
});

// ==============================
// Authentication Routes
// ==============================

app.use(
  "/api/auth",
  authRoutes
);

// ==============================
// Quiz Routes
// ==============================

app.use(
  "/api/quiz",
  quizRoutes
);

// ==============================
// Question Routes
// ==============================

app.use(
  "/api/questions",
  questionRoutes
);

// ==============================
// Result Routes
// ==============================

app.use(
  "/api/results",
  resultRoutes
);

// ==============================
// Dashboard Routes
// ==============================

app.use(
  "/api/dashboard",
  dashboardRoutes
);

// ==============================
// PDF Routes
// ==============================

app.use(
  "/api/pdf",
  pdfRoutes
);

// ==============================
// Leaderboard Routes
// ==============================

app.use(
  "/api/leaderboard",
  leaderboardRoutes
);

// ==============================
// 404 Route
// ==============================

app.use((req, res) => {
  console.log(
    "❌ Route Not Found:",
    req.method,
    req.originalUrl
  );

  res.status(404).json({
    success: false,
    message: "Route Not Found",
    path: req.originalUrl,
  });
});

// ==============================
// GLOBAL ERROR HANDLER
// ==============================

app.use(
  (err, req, res, next) => {
    console.error(
      "================================"
    );

    console.error(
      "❌ GLOBAL SERVER ERROR"
    );

    console.error(
      "Method:",
      req.method
    );

    console.error(
      "URL:",
      req.originalUrl
    );

    console.error(
      "Message:",
      err.message
    );

    console.error(
      "Error:",
      err
    );

    console.error(
      "================================"
    );

    // Multer file size error

    if (
      err.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "PDF file is too large. Maximum size is 10 MB.",
      });
    }

    // Multer unexpected file error

    if (
      err.code ===
      "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unexpected file field. Please upload using the pdf field.",
      });
    }

    // File type / custom upload error

    if (
      err.message ===
      "Only PDF files are allowed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only PDF files are allowed.",
      });
    }

    // CORS error

    if (
      err.message ===
      "Not allowed by CORS"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "CORS blocked this request.",
      });
    }

    // General error

    return res.status(500).json({
      success: false,

      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

// ==============================
// Start Server
// ==============================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    "================================"
  );

  console.log(
    `🚀 Server running on port ${PORT}`
  );

  console.log(
    "================================"
  );
});