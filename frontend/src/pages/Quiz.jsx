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

import "./Quiz.css";

function Quiz() {

  const navigate = useNavigate();

  const { quizId } = useParams();

  // ==========================
  // STATES
  // ==========================

  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({});

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const QUESTION_TIME = 20;

  const [timeLeft, setTimeLeft] =
    useState(QUESTION_TIME);

  const [submitted, setSubmitted] =
    useState(false);

  // ==========================
  // LOAD QUESTIONS
  // ==========================

  useEffect(() => {

    axios
      .get(`http://localhost:5000/api/questions/${quizId}`)

      .then((res) => {

        setQuestions(res.data);

      })

      .catch((err) => {

        console.log(err);

      });

  }, [quizId]);

  // ==========================
  // SAVE ANSWERS
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
  // SUBMIT QUIZ
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
  // TIMER
  // ==========================

  useEffect(() => {

    if (
      submitted ||
      questions.length === 0
    )
      return;

    const timer = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev <= 1) {

          clearInterval(timer);

          if (
            currentQuestion ===
            questions.length - 1
          ) {

            handleSubmit();

          } else {

            setCurrentQuestion(
              (old) => old + 1
            );

          }

          return QUESTION_TIME;

        }

        return prev - 1;

      });

    }, 1000);

    return () => clearInterval(timer);

  }, [
    currentQuestion,
    questions,
    submitted,
    handleSubmit,
  ]);

  // Reset Timer

  useEffect(() => {

    setTimeLeft(QUESTION_TIME);

  }, [currentQuestion]);

  // ==========================
  // LOADING
  // ==========================

  if (questions.length === 0) {

    return (

      <div className="loading-page">

        <h2>Loading Questions...</h2>

      </div>

    );

  }

  const question =
    questions[currentQuestion];
      return (

    <div className="quiz-page">

      <div className="quiz-container">

        {/* ==========================
            HEADER
        ========================== */}

        <div className="quiz-header">

          <div>

            <h1 className="quiz-title">

              Think Smart Quiz

            </h1>

            <p className="quiz-subtitle">

              Answer every question before the timer expires

            </p>

          </div>

          {/* Timer */}

          <div
            className={`timer-circle

            ${timeLeft<=5

              ? "danger"

              : timeLeft<=10

              ? "warning"

              : "safe"

            }`}
          >

            <span>

              {timeLeft}

            </span>

            <small>SEC</small>

          </div>

        </div>

        {/* ==========================
            PROGRESS
        ========================== */}

        <div className="progress-wrapper">

          <div className="progress-text">

            <span>

              Question {currentQuestion + 1}

            </span>

            <span>

              {questions.length}

            </span>

          </div>

          <div className="progress">

            <div

              className="progress-fill"

              style={{

                width: `${((currentQuestion + 1) / questions.length) * 100}%`

              }}

            />

          </div>

        </div>

        {/* ==========================
            QUESTION CARD
        ========================== */}

        <div className="question-card">

          <div className="question-number">

            Q{currentQuestion + 1}

          </div>

          <h2 className="question-title">

            {question.question}

          </h2>

          {/* ==========================
              OPTIONS
          ========================== */}

          <div className="options">

            {question.options.map((option,index)=>(

              <label

                key={index}

                className={`option-card

                ${answers[question._id]===option

                ? "selected"

                : ""

                }`}

              >

                <input

                  type="radio"

                  name={question._id}

                  value={option}

                  checked={answers[question._id]===option}

                  onChange={(e)=>

                    handleOptionChange(

                      question._id,

                      e.target.value

                    )

                  }

                />

                <span>

                  {option}

                </span>

              </label>

            ))}

          </div>

        </div>

        {/* ==========================
            QUESTION NAVIGATOR
        ========================== */}

        <div className="question-nav">

          {questions.map((q,index)=>(

            <button

              key={q._id}

              className={`nav-btn

              ${index===currentQuestion

                ? "current"

                : answers[q._id]

                ? "answered"

                : ""

              }`}

              onClick={()=>

                setCurrentQuestion(index)

              }

            >

              {index+1}

            </button>

          ))}

        </div>
                {/* ==========================
            NAVIGATION BUTTONS
        ========================== */}

        <div className="navigation-buttons">

          <button

            className="previous-btn"

            disabled={currentQuestion===0}

            onClick={()=>

              setCurrentQuestion(

                currentQuestion-1

              )

            }

          >

            ◀ Previous

          </button>

          {

            currentQuestion===questions.length-1

            ?

            (

              <button

                className="submit-btn"

                disabled={submitted}

                onClick={handleSubmit}

              >

                {

                  submitted

                  ?

                  "Submitting..."

                  :

                  "Submit Quiz"

                }

              </button>

            )

            :

            (

              <button

                className="next-btn"

                onClick={()=>

                  setCurrentQuestion(

                    currentQuestion+1

                  )

                }

              >

                Next ▶

              </button>

            )

          }

        </div>

      </div>

    </div>

  );

}

export default Quiz;