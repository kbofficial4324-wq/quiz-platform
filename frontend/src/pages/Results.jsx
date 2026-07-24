import React, { useEffect, useState } from "react";
import axios from "axios";

function Results() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/results")
      .then((res) => setResults(res.data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Student Results</h1>

      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>Student</th>
            <th>Quiz</th>
            <th>Score</th>
            <th>Percentage</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {results.map((result) => (
            <tr key={result._id}>
              <td>{result.studentName}</td>

              <td>{result.quizId?.title}</td>

              <td>
                {result.score} / {result.totalQuestions}
              </td>

              <td>
                {(
                  (result.score / result.totalQuestions) *
                  100
                ).toFixed(2)}
                %
              </td>

              <td>
                {new Date(result.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Results;