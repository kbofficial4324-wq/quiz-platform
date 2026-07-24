import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import axios from "axios";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

function Quiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  // 20 seconds for every question
  const [timeLeft, setTimeLeft] = useState(20);

  const [submitted, setSubmitted] =
    useState(false);

  // ==========================
  // Load Questions
  // ==========================

  useEffect(() => {
    axios
      .get(
        `http://localhost:5000/api/questions/${quizId}`
      )
      .then((res) => {
        setQuestions(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [quizId]);

  // ==========================
  // Save Selected Answer
  // ==========================

  const handleOptionChange = (
    questionId,
    option
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // ==========================
  // Submit Quiz
  // ==========================

  const handleSubmit = useCallback(async () => {
    if (submitted) return;

    setSubmitted(true);

    let score = 0;

    const review = questions.map((q) => {
      const studentAnswer =
        answers[q._id] || "Not Answered";

      const isCorrect =
        studentAnswer === q.answer;

      if (isCorrect) score++;

      return {
        question: q.question,
        studentAnswer,
        correctAnswer: q.answer,
        isCorrect,
      };
    });

    try {
      await axios.post(
        "http://localhost:5000/api/results",
        {
          studentName: "Demo Student",
          quizId,
          score,
          totalQuestions: questions.length,
        }
      );

      navigate("/result", {
        state: {
          score,
          total: questions.length,
          review,
        },
      });
    } catch (err) {
      console.log(err);
      alert("Failed to save result.");
      setSubmitted(false);
    }
  }, [
    submitted,
    questions,
    answers,
    quizId,
    navigate,
  ]);
    // ==========================
  // Timer
  // ==========================

  useEffect(() => {
    if (submitted || questions.length === 0) return;

    if (timeLeft === 0) {

      if (currentQuestion === questions.length - 1) {
        handleSubmit();
      } else {
        setCurrentQuestion((prev) => prev + 1);
        setTimeLeft(20);
      }

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);

  }, [
    timeLeft,
    currentQuestion,
    submitted,
    questions,
    handleSubmit,
  ]);

  // Reset timer when question changes

  useEffect(() => {
    setTimeLeft(20);
  }, [currentQuestion]);

  if (questions.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h2>Loading Questions...</h2>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (

    <div className="container mt-5">

      {/* Timer */}

      <div
        className={`alert ${
          timeLeft <= 5
            ? "alert-danger"
            : "alert-primary"
        } text-center`}
      >
        <h3>
          ⏰ Time Left : {timeLeft} sec
        </h3>
      </div>

      {/* Progress */}

      <div className="progress mb-4">

        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          style={{
            width: `${
              ((currentQuestion + 1) /
                questions.length) *
              100
            }%`,
          }}
        >
          {currentQuestion + 1} / {questions.length}
        </div>

      </div>

      {/* Question Card */}

      <div className="card shadow-lg">

        <div className="card-body">

          <h5 className="text-primary mb-3">
            Question {currentQuestion + 1}
          </h5>

          <h4 className="mb-4">
            {question.question}
          </h4>

          {question.options.map((option, index) => (

            <div
              className="form-check mb-3"
              key={index}
            >

              <input
                type="radio"
                className="form-check-input"
                id={`option-${index}`}
                name={`question-${question._id}`}
                value={option}
                checked={
                  answers[question._id] === option
                }
                onChange={(e) =>
                  handleOptionChange(
                    question._id,
                    e.target.value
                  )
                }
              />

              <label
                className="form-check-label"
                htmlFor={`option-${index}`}
                style={{
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                {option}
              </label>

            </div>

          ))}
                {/* Question Navigator */}

      <div className="d-flex justify-content-center flex-wrap mt-4 mb-4">

        {questions.map((q, index) => (

          <button
            key={q._id}
            className={`btn m-1 ${
              index === currentQuestion
                ? "btn-primary"
                : answers[q._id]
                ? "btn-success"
                : "btn-outline-secondary"
            }`}
            onClick={() => setCurrentQuestion(index)}
          >
            {index + 1}
          </button>

        ))}

      </div>

      {/* Navigation Buttons */}

      <div className="d-flex justify-content-between mt-4">

        <button
          className="btn btn-secondary"
          disabled={currentQuestion === 0}
          onClick={() =>
            setCurrentQuestion((prev) => prev - 1)
          }
        >
          ◀ Previous
        </button>

        {currentQuestion === questions.length - 1 ? (

          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={submitted}
          >
            {submitted
              ? "Submitting..."
              : "Submit Quiz"}
          </button>

        ) : (

          <button
            className="btn btn-primary"
            onClick={() =>
              setCurrentQuestion((prev) => prev + 1)
            }
          >
            Next ▶
          </button>

        )}

      </div>

    </div>

  </div>
          </div>

  );
}

export default Quiz;