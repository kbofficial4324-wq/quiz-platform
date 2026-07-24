import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

function StudentDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizRes = await API.get("/quiz");

        setQuizzes(quizRes.data);

       const leaderboardRes = await API.get("/leaderboard");

        setLeaderboard(leaderboardRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="student-page">
      <div className="container py-5">

        {/* Dashboard Header */}

        <div className="dashboard-header">
          <h1>🎓 Student Dashboard</h1>
          <p>
            Choose a quiz and test your knowledge.
          </p>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="text-center mt-5">
            <div
              className="spinner-border text-light"
              style={{
                width: "4rem",
                height: "4rem",
              }}
            />

            <h3 className="text-white mt-3">
              Loading...
            </h3>
          </div>
        ) : (
          <>
            {/* Quiz Cards */}

            {quizzes.length === 0 ? (
              <div className="empty-card">
                <h3>
                  📭 No quizzes available
                </h3>

                <p>
                  Please check again later.
                </p>
              </div>
            ) : (
              <div className="row">
                {quizzes.map((quiz) => (
                  <div
                    className="col-lg-4 col-md-6 mb-4"
                    key={quiz._id}
                  >
                    <div className="quiz-card">

                      <div className="quiz-icon">
                        📘
                      </div>

                      <h3>{quiz.title}</h3>

                      <p>
                        Total Questions
                        <span>
                          {" "}
                          {quiz.totalQuestions}
                        </span>
                      </p>

                      <button
                        className="start-btn"
                        onClick={() =>
                          navigate(
                            `/quiz/${quiz._id}`
                          )
                        }
                      >
                        🚀 Start Quiz
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Leaderboard */}

            <div className="leaderboard-card mt-5">

              <h2 className="leaderboard-title">
                🏆 Student Leaderboard
              </h2>

              <div className="table-responsive">

                <table className="table leaderboard-table">

                  <thead>

                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Score</th>
                      <th>Percentage</th>
                    </tr>

                  </thead>

                  <tbody>

                    {leaderboard.length > 0 ? (
                      leaderboard.map(
                        (student, index) => (
                          <tr key={student._id}>

                            <td>
                              {index === 0
                                ? "🥇"
                                : index === 1
                                ? "🥈"
                                : index === 2
                                ? "🥉"
                                : index + 1}
                            </td>

                            <td>
                              {student.studentName}
                            </td>

                            <td>
                              {student.score}
                            </td>

                            <td>
                              {student.percentage}%
                            </td>

                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center"
                        >
                          No student results
                          available.
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;