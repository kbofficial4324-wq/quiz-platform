import express from "express";
import { saveResult, getResults } from "../controllers/resultController.js";

const router = express.Router();

router.post("/", saveResult);
router.get("/", getResults);

export default router;