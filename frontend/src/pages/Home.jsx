import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">

      <div className="container">

        {/* Hero Section */}

        <div className="hero-section">

          <div className="hero-content">

            <h1 className="hero-title">
              🧠 Think Smart Quiz Platform
            </h1>

            <p className="hero-subtitle">
              Smart Work is Greater Than Hard Work
            </p>

            <p className="hero-description">
              Practice quizzes, improve your knowledge,
              track your progress, and become a smarter learner.
            </p>

            <div className="hero-buttons">

              <Link
                to="/login"
                className="hero-btn login-btn"
              >
                🎓 Student Login
              </Link>

              <Link
                to="/register"
                className="hero-btn register-btn"
              >
                📝 Register
              </Link>

              <Link
                to="/admin"
                className="hero-btn admin-btn"
              >
                🔐 Admin Login
              </Link>

            </div>

          </div>

        </div>

        {/* Features */}

        <div className="row mt-5">

          <div className="col-md-4 mb-4">

            <div className="feature-card">

              <div className="feature-icon">
                📚
              </div>

              <h3>Practice Quiz</h3>

              <p>
                Solve quizzes uploaded by the administrator
                and improve your knowledge.
              </p>

            </div>

          </div>

          <div className="col-md-4 mb-4">

            <div className="feature-card">

              <div className="feature-icon">
                📊
              </div>

              <h3>Track Progress</h3>

              <p>
                View scores, analyze performance,
                and improve every day.
              </p>

            </div>

          </div>

          <div className="col-md-4 mb-4">

            <div className="feature-card">

              <div className="feature-icon">
                ☁️
              </div>

              <h3>PDF Quiz Upload</h3>

              <p>
                Admins can upload quiz questions
                directly from PDF documents.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;