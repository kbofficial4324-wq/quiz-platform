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
  // ==========================================
  // STATE
  // ==========================================

  const [stats, setStats] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  const [pdf, setPdf] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async () => {
    try {
      console.log("Loading dashboard...");

      const res = await API.get("/dashboard");

      console.log("Dashboard response:", res.data);

      setStats(res.data);
    } catch (err) {
      console.error("Dashboard Error:", err);

      console.error(
        "Dashboard Server Response:",
        err.response?.data
      );
    }
  };

  // ==========================================
  // LOAD LEADERBOARD
  // ==========================================

  const loadLeaderboard = async () => {
    try {
      console.log("Loading leaderboard...");

      const res = await API.get("/leaderboard");

      console.log(
        "Leaderboard response:",
        res.data
      );

      setLeaderboard(
        Array.isArray(res.data)
          ? res.data
          : res.data?.leaderboard || []
      );
    } catch (err) {
      console.error("Leaderboard Error:", err);

      console.error(
        "Leaderboard Server Response:",
        err.response?.data
      );

      setLeaderboard([]);
    }
  };

  // ==========================================
  // INITIAL LOAD
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
  // SELECT PDF
  // ==========================================

  const handlePDFChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setPdf(null);
      return;
    }

    console.log("Selected file:", selectedFile);
    console.log("File name:", selectedFile.name);
    console.log("File type:", selectedFile.type);
    console.log("File size:", selectedFile.size);

    // Check extension
    const fileName =
      selectedFile.name.toLowerCase();

    if (!fileName.endsWith(".pdf")) {
      alert("Please select a PDF file only.");

      e.target.value = "";
      setPdf(null);

      return;
    }

    setPdf(selectedFile);
  };

  // ==========================================
  // UPLOAD PDF
  // ==========================================

  const uploadPDF = async () => {
    if (!pdf) {
      alert("Please select a PDF.");
      return;
    }

    console.log("================================");
    console.log("📄 STARTING PDF UPLOAD");
    console.log("File name:", pdf.name);
    console.log("File type:", pdf.type);
    console.log("File size:", pdf.size);
    console.log(
      "API Base URL:",
      API.defaults.baseURL
    );
    console.log("================================");

    // ========================================
    // Create FormData
    // ========================================

    const formData = new FormData();

    formData.append("pdf", pdf);

    // Check FormData
    console.log(
      "FormData PDF:",
      formData.get("pdf")
    );

    try {
      setUploading(true);

      // ======================================
      // Send PDF to Render Backend
      // ======================================

      const res = await API.post(
        "/pdf/upload",
        formData
      );

      console.log("================================");
      console.log("✅ PDF UPLOAD SUCCESSFUL");
      console.log("Server response:", res.data);
      console.log("================================");

      alert(
        res.data?.message ||
          "PDF uploaded successfully!"
      );

      // ======================================
      // Clear selected file
      // ======================================

      setPdf(null);

      const fileInput =
        document.getElementById("pdfUpload");

      if (fileInput) {
        fileInput.value = "";
      }

      // ======================================
      // Reload dashboard
      // ======================================

      await loadDashboard();

      await loadLeaderboard();

    } catch (err) {
      // ======================================
      // ERROR DETAILS
      // ======================================

      console.error("================================");
      console.error("❌ PDF UPLOAD FAILED");
      console.error("================================");

      console.error("Error:", err);

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Response:",
        err.response?.data
      );

      console.error(
        "Request URL:",
        err.config?.url
      );

      console.error(
        "Base URL:",
        err.config?.baseURL
      );

      console.error(
        "Full URL:",
        `${err.config?.baseURL || ""}${
          err.config?.url || ""
        }`
      );

      console.error("================================");

      // ======================================
      // User-friendly error
      // ======================================

      if (err.response) {
        alert(
          err.response.data?.message ||
            `Upload failed. Server returned ${err.response.status}.`
        );
      } else if (err.request) {
        alert(
          "Upload failed. The backend server could not be reached."
        );
      } else {
        alert(
          err.message ||
            "PDF Upload Failed."
        );
      }

    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // PIE CHART
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
  // BAR CHART
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
  // LOADING SCREEN
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
  // ADMIN DASHBOARD
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
            PDF UPLOAD CARD
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

            {/* FILE SELECT */}

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

            {/* FILE INPUT */}

            <input
              id="pdfUpload"
              type="file"
              accept=".pdf,application/pdf"
              hidden
              onChange={handlePDFChange}
            />

            {/* UPLOAD BUTTON */}

            <button
              type="button"
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

          {/* TOTAL QUIZZES */}

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

          {/* TOTAL STUDENTS */}

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

          {/* TOTAL QUESTIONS */}

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

          {/* AVERAGE SCORE */}

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

          {/* PIE */}

          <div className="col-lg-6 mb-4">

            <div className="chart-card">

              <h4 className="text-center mb-4">
                Pass vs Fail
              </h4>

              <Pie
                data={pieData}
              />

            </div>

          </div>

          {/* BAR */}

          <div className="col-lg-6 mb-4">

            <div className="chart-card">

              <h4 className="text-center mb-4">
                Score Analysis
              </h4>

              <Bar
                data={barData}
              />

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
                            student.studentName ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            student.studentEmail ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            student.score ??
                            0
                          }
                        </td>

                        <td>
                          {
                            student.percentage ??
                            0
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