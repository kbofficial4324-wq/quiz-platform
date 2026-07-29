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

  // 20 seconds for each question
  const [timeLeft, setTimeLeft] = useState(20);

  // ----------------------------
  // Load Quiz Questions
  // ----------------------------

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/questions/${quizId}`);

      console.log("Questions Loaded:", res.data);

      setQuestions(res.data);

      setLoading(false);
    } catch (err) {
      console.log(err);

      alert("Unable to Load Quiz");

      navigate("/student");
    }
  };

  // ----------------------------
  // Timer
  // ----------------------------

  useEffect(() => {
    if (loading) return;

    if (questions.length === 0) return;

    if (submitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {

        if (prev === 1) {

          if (currentQuestion < questions.length - 1) {

            setCurrentQuestion((old) => old + 1);

            return 20;
          }

          submitQuiz();

          return 0;
        }

        return prev - 1;

      });
    }, 1000);

    return () => clearInterval(timer);

  }, [loading, currentQuestion, questions, submitting]);

  // Reset timer when moving to another question

  useEffect(() => {
    setTimeLeft(20);
  }, [currentQuestion]);

  // ----------------------------
  // Time Format
  // ----------------------------

  const formatTime = () => {

    const min = Math.floor(timeLeft / 60);

    const sec = timeLeft % 60;

    return `${min}:${sec.toString().padStart(2, "0")}`;

  };
    // ----------------------------
  // Select Answer
  // ----------------------------

  const selectAnswer = (option) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion]._id]: option,
    }));
  };

  // ----------------------------
  // Next Question
  // ----------------------------

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // ----------------------------
  // Previous Question
  // ----------------------------

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // ----------------------------
  // Submit Quiz
  // ----------------------------

  const submitQuiz = async () => {
    try {
      setSubmitting(true);

      const user = JSON.parse(localStorage.getItem("user"));

      let score = 0;

      const review = questions.map((q) => {
        const studentAnswer = answers[q._id] || "Not Answered";

        const isCorrect = studentAnswer === q.answer;

        if (isCorrect) score++;

        return {
          question: q.question,
          studentAnswer,
          correctAnswer: q.answer,
          isCorrect,
        };
      });

      const payload = {
        studentName: user?.name || "Student",
        quizId,
        score,
        totalQuestions: questions.length,
        answers: review,
      };

      console.log("================================");
      console.log("Submitting Result");
      console.log(payload);
      console.log("================================");

      await API.post("/results", payload);

      navigate("/result", {
        state: {
          studentName: user?.name || "Student",
          score,
          totalQuestions: questions.length,
          answers: review,
        },
      });

    } catch (err) {
      console.log(err);
      console.log(err.response?.data);

      alert(
        err.response?.data?.message ||
        "Submission Failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------
  // Loading Screen
  // ----------------------------

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
      <span></span>
      <span></span>
    </div>

    <div className="quiz-container">

      {/* Header */}

      <div className="quiz-header">

        <div>
          <h1>📝 Quiz Platform</h1>
          <p>Answer every question carefully.</p>
        </div>

        <div className="timer-box">
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

      {/* Question Card */}

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
              : "Submit Quiz ✅"}
          </button>

        ) : (

          <button
            className="next-btn"
            onClick={nextQuestion}
          >
            Next Question →
          </button>

        )}

      </div>

    </div>

  </div>
);

}

export default Quiz;  