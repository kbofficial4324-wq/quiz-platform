import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import { useNavigate, useParams } from "react-router-dom";

import API from "../services/api";

import "./Quiz.css";

function Quiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  // ==============================
  // STATES
  // ==============================

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const QUESTION_TIME = 20;

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);

  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==============================
  // LOAD QUESTIONS
  // ==============================

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "Loading questions for quiz:",
          quizId
        );

        // IMPORTANT:
        // Uses deployed backend through API service
        const response = await API.get(
          `/questions/${quizId}`
        );

        console.log(
          "Questions API response:",
          response.data
        );

        // ==============================
        // HANDLE RESPONSE
        // ==============================

        let loadedQuestions = response.data;

        // If backend returns:
        // { questions: [...] }

        if (response.data?.questions) {
          loadedQuestions = response.data.questions;
        }

        // ==============================
        // VALIDATE RESPONSE
        // ==============================

        if (!Array.isArray(loadedQuestions)) {
          throw new Error(
            "Invalid questions response from server"
          );
        }

        if (loadedQuestions.length === 0) {
          setQuestions([]);
          setError(
            "No questions found for this quiz."
          );
          return;
        }

        setQuestions(loadedQuestions);

        // Reset quiz state
        setCurrentQuestion(0);
        setAnswers({});
        setTimeLeft(QUESTION_TIME);
      } catch (err) {
        console.error(
          "Question loading error:",
          err
        );

        if (err.response) {
          console.error(
            "Status:",
            err.response.status
          );

          console.error(
            "Response:",
            err.response.data
          );

          setError(
            err.response.data?.message ||
              `Server error: ${err.response.status}`
          );
        } else if (err.request) {
          setError(
            "Cannot connect to the backend server. Please make sure the deployed backend is running."
          );
        } else {
          setError(
            err.message ||
              "Failed to load questions."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      loadQuestions();
    } else {
      setLoading(false);
      setError("Quiz ID is missing.");
    }
  }, [quizId]);

  // ==============================
  // SAVE ANSWER
  // ==============================

  const handleOptionChange = (
    questionId,
    option
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // ==============================
  // SUBMIT QUIZ
  // ==============================

  const handleSubmit = useCallback(async () => {
    if (submitted) {
      return;
    }

    if (questions.length === 0) {
      alert(
        "There are no questions to submit."
      );
      return;
    }

    setSubmitted(true);

    let score = 0;

    const review = questions.map((q) => {
      const studentAnswer =
        answers[q._id] || "Not Answered";

      const isCorrect =
        studentAnswer === q.answer;

      if (isCorrect) {
        score++;
      }

      return {
        question: q.question,

        studentAnswer,

        correctAnswer: q.answer,

        isCorrect,
      };
    });

    try {
      console.log(
        "Submitting result..."
      );

      console.log({
        studentName: "Demo Student",
        quizId,
        score,
        totalQuestions: questions.length,
        answers: review,
      });

      // IMPORTANT:
      // Uses deployed backend through API service
      await API.post(
        "/results",
        {
          studentName: "Demo Student",

          quizId,

          score,

          totalQuestions:
            questions.length,

          answers: review,
        }
      );

      console.log(
        "Result saved successfully."
      );

      // ==============================
      // GO TO RESULT PAGE
      // ==============================

      navigate("/result", {
        state: {
          score,

          total: questions.length,

          review,
        },
      });
    } catch (err) {
      console.error(
        "Result save error:",
        err
      );

      if (err.response) {
        console.error(
          "Result status:",
          err.response.status
        );

        console.error(
          "Result response:",
          err.response.data
        );
      }

      alert(
        err.response?.data?.message ||
          "Failed to save result."
      );

      setSubmitted(false);
    }
  }, [
    submitted,
    questions,
    answers,
    quizId,
    navigate,
  ]);

  // ==============================
  // TIMER
  // ==============================

  useEffect(() => {
    if (
      submitted ||
      loading ||
      questions.length === 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // ==============================
        // TIME EXPIRED
        // ==============================

        if (prev <= 1) {
          clearInterval(timer);

          // Last question
          if (
            currentQuestion ===
            questions.length - 1
          ) {
            handleSubmit();
          } else {
            // Go to next question
            setCurrentQuestion(
              (old) => old + 1
            );
          }

          return QUESTION_TIME;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    currentQuestion,
    questions,
    submitted,
    handleSubmit,
    loading,
  ]);

  // ==============================
  // RESET TIMER
  // ==============================

  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
  }, [currentQuestion]);

  // ==============================
  // LOADING SCREEN
  // ==============================

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-box">
          <div className="spinner-border"></div>

          <h2>
            Loading Questions...
          </h2>

          <p>
            Please wait while the quiz
            is loading.
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // ERROR SCREEN
  // ==============================

  if (error) {
    return (
      <div className="loading-page">
        <div className="loading-box">
          <h2>
            Unable to Load Quiz
          </h2>

          <p>{error}</p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="next-btn"
            style={{
              marginTop: "20px",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==============================
  // NO QUESTIONS
  // ==============================

  if (questions.length === 0) {
    return (
      <div className="loading-page">
        <div className="loading-box">
          <h2>
            No Questions Found
          </h2>

          <p>
            This quiz does not contain
            any questions.
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // CURRENT QUESTION
  // ==============================

  const question =
    questions[currentQuestion];

  // ==============================
  // TIMER STATUS
  // ==============================

  const timerClass =
    timeLeft <= 5
      ? "danger"
      : timeLeft <= 10
      ? "warning"
      : "safe";

  // ==============================
  // PROGRESS
  // ==============================

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  // ==============================
  // MAIN UI
  // ==============================

  return (
    <div className="quiz-page">

      <div className="quiz-container">

        {/* ==========================
            TECHNICAL HEADER
        ========================== */}

        <div className="quiz-header">

          <div className="quiz-header-left">

            <div className="technical-label">
              QUIZ // SYSTEM ACTIVE
            </div>

            <h1 className="quiz-title">
              Think Smart Quiz
            </h1>

            <p className="quiz-subtitle">
              Answer every question before
              the timer expires
            </p>

          </div>

          {/* ==========================
              TIMER
          ========================== */}

          <div
            className={`timer-circle ${timerClass}`}
          >
            <span>
              {timeLeft}
            </span>

            <small>
              SEC
            </small>
          </div>

        </div>

        {/* ==========================
            QUESTION INFORMATION
        ========================== */}

        <div className="question-info">

          <div className="question-counter">

            QUESTION{" "}

            {String(
              currentQuestion + 1
            ).padStart(2, "0")}

            {" / "}

            {String(
              questions.length
            ).padStart(2, "0")}

          </div>

          <div className="answered-counter">

            ANSWERED{" "}

            {
              Object.keys(
                answers
              ).length
            }

            {" / "}

            {questions.length}

          </div>

        </div>

        {/* ==========================
            PROGRESS
        ========================== */}

        <div className="progress-wrapper">

          <div className="progress-text">

            <span>
              Question{" "}
              {currentQuestion + 1}
            </span>

            <span>
              {Math.round(progress)}%
            </span>

          </div>

          <div className="progress">

            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        {/* ==========================
            QUESTION CARD
        ========================== */}

        <div className="question-card">

          <div className="question-top">

            <div className="question-number">

              Q
              {String(
                currentQuestion + 1
              ).padStart(2, "0")}

            </div>

            <div className="question-tag">
              MULTIPLE CHOICE
            </div>

          </div>

          <h2 className="question-title">
            {question.question}
          </h2>

          {/* ==========================
              OPTIONS
          ========================== */}

          <div className="options">

            {Array.isArray(
              question.options
            ) &&
              question.options.map(
                (option, index) => {

                  const isSelected =
                    answers[
                      question._id
                    ] === option;

                  return (
                    <label
                      key={index}
                      className={`option-card ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                    >

                      <input
                        type="radio"
                        name={
                          question._id
                        }
                        value={option}
                        checked={
                          isSelected
                        }
                        onChange={(e) =>
                          handleOptionChange(
                            question._id,
                            e.target.value
                          )
                        }
                      />

                      <span className="option-letter">
                        {String.fromCharCode(
                          65 + index
                        )}
                      </span>

                      <span className="option-text">
                        {option}
                      </span>

                      {isSelected && (
                        <span className="option-check">
                          ✓
                        </span>
                      )}

                    </label>
                  );
                }
              )}

          </div>

        </div>

        {/* ==========================
            QUESTION NAVIGATOR
        ========================== */}

        <div className="question-navigator">

          <div className="navigator-header">

            <span>
              QUESTION INDEX
            </span>

            <span>
              {questions.length} ITEMS
            </span>

          </div>

          <div className="question-nav">

            {questions.map(
              (q, index) => (

                <button
                  key={
                    q._id || index
                  }
                  type="button"
                  className={`nav-btn ${
                    index ===
                    currentQuestion
                      ? "current"
                      : answers[
                          q._id
                        ]
                      ? "answered"
                      : ""
                  }`}
                  onClick={() => {

                    if (
                      !submitted
                    ) {
                      setCurrentQuestion(
                        index
                      );
                    }

                  }}
                >
                  {String(
                    index + 1
                  ).padStart(2, "0")}

                </button>

              )
            )}

          </div>

        </div>

        {/* ==========================
            NAVIGATION BUTTONS
        ========================== */}

        <div className="navigation-buttons">

          {/* PREVIOUS */}

          <button
            type="button"
            className="previous-btn"
            disabled={
              currentQuestion === 0 ||
              submitted
            }
            onClick={() => {

              if (
                currentQuestion > 0
              ) {
                setCurrentQuestion(
                  currentQuestion - 1
                );
              }

            }}
          >
            <span>
              ◀
            </span>

            Previous

          </button>

          {/* NEXT / SUBMIT */}

          {currentQuestion ===
          questions.length - 1 ? (

            <button
              type="button"
              className="submit-btn"
              disabled={submitted}
              onClick={handleSubmit}
            >

              {submitted
                ? "Submitting..."
                : "Submit Quiz →"}

            </button>

          ) : (

            <button
              type="button"
              className="next-btn"
              disabled={submitted}
              onClick={() =>
                setCurrentQuestion(
                  currentQuestion + 1
                )
              }
            >

              Next

              <span>
                ▶
              </span>

            </button>

          )}

        </div>

        {/* ==========================
            FOOTER STATUS
        ========================== */}

        <div className="quiz-footer">

          <span>
            ● SECURE QUIZ SESSION
          </span>

          <span>
            TIMER:{" "}
            {timeLeft <= 5
              ? "CRITICAL"
              : timeLeft <= 10
              ? "WARNING"
              : "NORMAL"}
          </span>

        </div>

      </div>

    </div>
  );
}

export default Quiz;