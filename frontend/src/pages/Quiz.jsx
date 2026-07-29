import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "./Quiz.css";

function Quiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [timeLeft, setTimeLeft] = useState(1200); //20 mins

  // -----------------------------
  // Load Questions
  // -----------------------------

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/questions/${quizId}`);

      setQuestions(res.data);

      setLoading(false);
    } catch (err) {
      console.log(err);

      alert("Unable to Load Quiz");

      navigate("/student");
    }
  };

  // -----------------------------
  // Timer
  // -----------------------------

  useEffect(() => {
    if (loading) return;

    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);

  }, [timeLeft, loading]);

  // -----------------------------
  // Time Format
  // -----------------------------

  const formatTime = () => {

    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

  };

  // -----------------------------
  // Select Answer
  // -----------------------------

  const selectAnswer = (option) => {

    setAnswers({
      ...answers,
      [questions[currentQuestion]._id]: option,
    });

  };

  // -----------------------------
  // Next Question
  // -----------------------------

  const nextQuestion = () => {

    if (currentQuestion < questions.length - 1) {

      setCurrentQuestion(currentQuestion + 1);

    }

  };

  // -----------------------------
  // Previous Question
  // -----------------------------

  const previousQuestion = () => {

    if (currentQuestion > 0) {

      setCurrentQuestion(currentQuestion - 1);

    }

  };

  // -----------------------------
  // Jump Question
  // -----------------------------

  const jumpQuestion = (index) => {

    setCurrentQuestion(index);

  };

  // -----------------------------
  // Submit Quiz
  // -----------------------------

  const submitQuiz = async () => {

    try {

      setSubmitting(true);

      const payload = {

        quizId,

        answers,

      };

      const res = await API.post(
        "/results/submit",
        payload
      );

      navigate("/result", {
        state: res.data,
      });

    } catch (err) {

      console.log(err);

      alert("Submission Failed");

    } finally {

      setSubmitting(false);

    }

  };

  if (loading) {

    return (

      <div className="quiz-loading">

        <div className="loader"></div>

        <h2>Loading Quiz...</h2>

      </div>

    );

  }

  const question = questions[currentQuestion];
    return (
    <div className="quiz-page">

      {/* Animated Background */}
      <div className="bg-animation">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="quiz-container">

        {/* Header */}

        <div className="quiz-header">

          <h1>Quiz Platform</h1>

          <div className="timer">
            ⏱ {formatTime()}
          </div>

        </div>

        {/* Progress */}

        <div className="progress-section">

          <div className="progress-top">

            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>

            <span>
              {Math.round(
                ((currentQuestion + 1) /
                  questions.length) *
                  100
              )}
              %
            </span>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    questions.length) *
                  100
                }%`,
              }}
            ></div>

          </div>

        </div>

        {/* Question */}

        <div className="question-card">

          <h2>{question.question}</h2>

          <div className="options">

            {question.options.map(
              (option, index) => (
                <div
                  key={index}
                  className={`option ${
                    answers[question._id] === option
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    selectAnswer(option)
                  }
                >
                  <div className="option-letter">
                    {String.fromCharCode(
                      65 + index
                    )}
                  </div>

                  <div className="option-text">
                    {option}
                  </div>
                </div>
              )
            )}

          </div>

        </div>

        {/* Navigation */}

        <div className="navigation">

          <button
            className="prev-btn"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {currentQuestion ===
          questions.length - 1 ? (
            <button
              className="submit-btn"
              onClick={submitQuiz}
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Quiz"}
            </button>
          ) : (
            <button
              className="next-btn"
              onClick={nextQuestion}
            >
              Next →
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default Quiz;