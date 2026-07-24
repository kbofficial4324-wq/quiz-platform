import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminResults() {
  const [results, setResults] =useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/results")
      .then((res) => {
        setResults(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="container mt-5">

      <h2 className="text-center mb-4">
        📊 Student Quiz Results
      </h2>

      {results.length === 0 ? (
        <div className="alert alert-info">
          No Results Found
        </div>
      ) : (
        results.map((result, index) => (
          <div
            className="card shadow mb-5"
            key={result._id}
          >
            <div className="card-header bg-dark text-white">

              <h4>Student #{index + 1}</h4>

            </div>

            <div className="card-body">

              <table className="table table-bordered">

                <tbody>

                  <tr>
                    <th width="220">Student Name</th>
                    <td>{result.studentName}</td>
                  </tr>

                  <tr>
                    <th>Quiz</th>
                    <td>
                      {result.quizId?.title || "Quiz"}
                    </td>
                  </tr>

                  <tr>
                    <th>Score</th>
                    <td>
                      {result.score} / {result.totalQuestions}
                    </td>
                  </tr>

                  <tr>
                    <th>Percentage</th>
                    <td>
                      {(
                        (result.score /
                          result.totalQuestions) *
                        100
                      ).toFixed(2)}
                      %
                    </td>
                  </tr>

                </tbody>

              </table>

              <h4 className="mt-4">
                Student Answers
              </h4>

              {result.answers &&
              result.answers.length > 0 ? (

                <table className="table table-striped table-bordered">

                  <thead className="table-primary">

                    <tr>
                      <th>No</th>
                      <th>Question</th>
                      <th>Student Answer</th>
                      <th>Correct Answer</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {result.answers.map((ans, i) => (
                      <tr key={i}>

                        <td>{i + 1}</td>

                        <td>{ans.question}</td>

                        <td>{ans.studentAnswer}</td>

                        <td>{ans.correctAnswer}</td>

                        <td>
                          {ans.isCorrect ? (
                            <span className="badge bg-success">
                              Correct
                            </span>
                          ) : (
                            <span className="badge bg-danger">
                              Wrong
                            </span>
                          )}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              ) : (

                <div className="alert alert-warning">
                  This result was saved before answer
                  review was implemented.
                </div>

              )}

            </div>
          </div>
        ))
      )}

    </div>
  );
}

export default AdminResults;