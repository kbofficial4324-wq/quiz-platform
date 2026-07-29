import express from "express";
import {
  saveResult,
  getResults,
} from "../controllers/resultController.js";

const router = express.Router();

// Save quiz result
router.post("/submit", saveResult);

// Get all results
router.get("/", getResults);

export default router;