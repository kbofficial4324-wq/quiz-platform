import express from "express";
import {
  register,
  login,
  getProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logged-in User Profile (Protected)
router.get("/profile", protect, getProfile);

export default router;