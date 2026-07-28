import React, { useEffect, useState } from "react";

import API from "../services/api";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

import "./AdminDashboard.css";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [pdf, setPdf] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // Load Dashboard
  // ==========================================

  const loadDashboard = async () => {
    try {
      const res = await API.get("/dashboard");

      setStats(res.data);
    } catch (err) {
      console.error(
        "Dashboard Error:",
        err
      );
    }
  };

  // ==========================================
  // Load Leaderboard
  // ==========================================

  const loadLeaderboard = async () => {
    try {
      const res = await API.get(
        "/leaderboard"
      );

      setLeaderboard(res.data);
    } catch (err) {
      console.error(
        "Leaderboard Error:",
        err
      );
    }
  };

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      await Promise.all([
        loadDashboard(),
        loadLeaderboard(),
      ]);

      setLoading(false);
    };

    fetchData();
  }, []);

  // ==========================================
  // Upload PDF
  // ==========================================

  const uploadPDF = async () => {
    if (!pdf) {
      alert("Please select a PDF.");
      return;
    }

    // Make sure selected file is PDF
    if (pdf.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    const formData = new FormData();

    formData.append("pdf", pdf);

    try {
      setUploading(true);

      console.log(
        "Uploading PDF:",
        pdf.name
      );

      const res = await API.post(
        "/pdf/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      console.log(
        "PDF Upload Response:",
        res.data
      );

      alert(
        res.data.message ||
          "PDF uploaded successfully!"
      );

      // Clear selected PDF
      setPdf(null);

      const fileInput =
        document.getElementById(
          "pdfUpload"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      // Reload dashboard statistics
      await loadDashboard();

      await loadLeaderboard();
    } catch (err) {
      console.error(
        "PDF Upload Error:",
        err
      );

      console.error(
        "Server Response:",
        err.response?.data
      );

      alert(
        err.response?.data?.message ||
          "PDF Upload Failed"
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // Pie Chart
  // ==========================================

  const pieData = {
    labels: [
      "Pass",
      "Fail",
    ],

    datasets: [
      {
        data: [
          stats.passCount || 0,
          stats.failCount || 0,
        ],

        backgroundColor: [
          "#22c55e",
          "#ef4444",
        ],
      },
    ],
  };

  // ==========================================
  // Bar Chart
  // ==========================================

  const barData = {
    labels: [
      "Average",
      "Highest",
      "Lowest",
    ],

    datasets: [
      {
        label: "Score %",

        data: [
          stats.averageScore || 0,
          stats.highestScore || 0,
          stats.lowestScore || 0,
        ],

        backgroundColor: [
          "#2563eb",
          "#16a34a",
          "#f59e0b",
        ],
      },
    ],
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="text-center mt-5">
        <h2>
          Loading Dashboard...
        </h2>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-dashboard">
      <div className="container py-5">

        {/* =====================================
            HEADER
        ===================================== */}

        <h1 className="dashboard-title">
          📊 Admin Dashboard
        </h1>

        <p className="dashboard-subtitle">
          Upload quiz PDFs, monitor student
          performance and analyze results.
        </p>

        {/* =====================================
            PDF UPLOAD
        ===================================== */}

        <div className="upload-card">

          <div className="upload-title">

            <div className="upload-title-icon">
              📄
            </div>

            <div>

              <h2 className="upload-heading">
                Upload Quiz PDF
              </h2>

              <p className="upload-subtitle">
                Upload quiz questions in PDF
                format.
              </p>

            </div>

          </div>

          <div className="upload-container">

            <label
              htmlFor="pdfUpload"
              className="upload-box"
            >

              <div className="upload-icon">
                📄
              </div>

              <h4>
                Click to Select PDF
              </h4>

              <p>
                Only PDF files are allowed
              </p>

              {pdf && (
                <div className="selected-file">
                  ✅ {pdf.name}
                </div>
              )}

            </label>

            <input
              id="pdfUpload"
              type="file"
              accept=".pdf,application/pdf"
              hidden
              onChange={(e) => {
                const selectedFile =
                  e.target.files?.[0];

                if (
                  selectedFile &&
                  selectedFile.type !==
                    "application/pdf"
                ) {
                  alert(
                    "Please select a PDF file."
                  );

                  e.target.value = "";
                  setPdf(null);

                  return;
                }

                setPdf(selectedFile || null);
              }}
            />

            <button
              className="upload-btn"
              onClick={uploadPDF}
              disabled={uploading}
            >

              {uploading
                ? "⏳ Uploading..."
                : "🚀 Upload PDF"}

            </button>

          </div>

        </div>

        {/* =====================================
            STATISTICS
        ===================================== */}

        <div className="row mt-5">

          <div className="col-lg-3 col-md-6 mb-4">

            <div className="stat-card bg-primary text-white">

              <h5>
                Total Quizzes
              </h5>

              <h2>
                {stats.totalQuizzes || 0}
              </h2>

            </div>

          </div>

          <div className="col-lg-3 col-md-6 mb-4">

            <div className="stat-card bg-success text-white">

              <h5>
                Total Students
              </h5>

              <h2>
                {stats.totalStudents || 0}
              </h2>

            </div>

          </div>

          <div className="col-lg-3 col-md-6 mb-4">

            <div className="stat-card bg-warning">

              <h5>
                Total Questions
              </h5>

              <h2>
                {stats.totalQuestions || 0}
              </h2>

            </div>

          </div>

          <div className="col-lg-3 col-md-6 mb-4">

            <div className="stat-card bg-danger text-white">

              <h5>
                Average Score
              </h5>

              <h2>
                {stats.averageScore || 0}%
              </h2>

            </div>

          </div>

        </div>

        {/* =====================================
            CHARTS
        ===================================== */}

        <div className="row mt-4">

          <div className="col-lg-6 mb-4">

            <div className="chart-card">

              <h4 className="text-center mb-4">
                Pass vs Fail
              </h4>

              <Pie data={pieData} />

            </div>

          </div>

          <div className="col-lg-6 mb-4">

            <div className="chart-card">

              <h4 className="text-center mb-4">
                Score Analysis
              </h4>

              <Bar data={barData} />

            </div>

          </div>

        </div>

        {/* =====================================
            LEADERBOARD
        ===================================== */}

        <div className="leaderboard-card mt-5">

          <h2 className="text-center mb-4">
            🏆 Student Leaderboard
          </h2>

          <div className="table-responsive">

            <table className="table table-striped table-hover">

              <thead className="table-dark">

                <tr>

                  <th>
                    Rank
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Score
                  </th>

                  <th>
                    Percentage
                  </th>

                </tr>

              </thead>

              <tbody>

                {leaderboard.length > 0 ? (

                  leaderboard.map(
                    (student, index) => (

                      <tr
                        key={
                          student._id ||
                          index
                        }
                      >

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
                          {
                            student.studentName
                          }
                        </td>

                        <td>
                          {
                            student.studentEmail ||
                            "-"
                          }
                        </td>

                        <td>
                          {student.score}
                        </td>

                        <td>
                          {
                            student.percentage
                          }%
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
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

      </div>
    </div>
  );
}

export default AdminDashboard;