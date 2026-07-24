import Result from "../models/Result.js";

// ===============================
// Get Student Leaderboard
// ===============================
export const getLeaderboard = async (req, res) => {
  try {
    // Get all quiz results sorted by highest score
    const leaderboard = await Result.find()
      .sort({ score: -1, createdAt: 1 })
      .lean();

    // Calculate percentage for each student
    const formattedLeaderboard = leaderboard.map((student) => ({
      _id: student._id,
      studentName: student.studentName,
      score: student.score,
      totalQuestions: student.totalQuestions,
      percentage:
        student.totalQuestions > 0
          ? Number(
              (
                (student.score / student.totalQuestions) *
                100
              ).toFixed(2)
            )
          : 0,
      submittedAt: student.createdAt,
    }));

    res.status(200).json(formattedLeaderboard);
  } catch (error) {
    console.error("Leaderboard Error:", error);

    res.status(500).json({
      message: "Failed to load leaderboard.",
      error: error.message,
    });
  }
};