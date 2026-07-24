import Result from "../models/Result.js";

// Save Result
export const saveResult = async (req, res) => {
  try {
    const result = await Result.create(req.body);

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get All Results
export const getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("quizId")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};