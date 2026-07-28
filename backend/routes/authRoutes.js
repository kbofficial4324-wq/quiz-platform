import express from "express";

import {
  register,
  login,
  getProfile,
} from "../controllers/authController.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Profile
router.get("/profile", getProfile);

export default router;