import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import Result from "../models/Result.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalQuizzes = await Quiz.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalResults = await Result.countDocuments();

    const results = await Result.find();

    let totalScore = 0;
    let totalPossible = 0;
    let highestScore = 0;
    let lowestScore = 100;

    results.forEach((r) => {
      totalScore += r.score;
      totalPossible += r.totalQuestions;

      const percentage = (r.score / r.totalQuestions) * 100;

      if (percentage > highestScore) highestScore = percentage;
      if (percentage < lowestScore) lowestScore = percentage;
    });

    const averageScore =
      totalResults > 0
        ? ((totalScore / totalPossible) * 100).toFixed(2)
        : 0;

    const passCount = results.filter(
      (r) => (r.score / r.totalQuestions) * 100 >= 50
    ).length;

    const failCount = totalResults - passCount;

    res.json({
      totalQuizzes,
      totalQuestions,
      totalStudents: totalResults,
      averageScore,
      highestScore: highestScore.toFixed(2),
      lowestScore: totalResults ? lowestScore.toFixed(2) : 0,
      passCount,
      failCount,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};