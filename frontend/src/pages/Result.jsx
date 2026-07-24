import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Result.css";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const score = location.state?.score || 0;
  const total = location.state?.total || 0;
  const review = location.state?.review || [];

  const percentage =
    total > 0 ? ((score / total) * 100).toFixed(2) : 0;

  const passed = percentage >= 50;

  return (
    <div className="result-page">

      <div className="container py-5">

        {/* Result Card */}

        <div className="result-card">

          <div className="trophy">
            🏆
          </div>

          <h1 className="result-title">
            Quiz Completed Successfully
          </h1>

          <p className="result-subtitle">
            Great Job! Here is your performance.
          </p>


          <div className="score-circle">

            <h1>{score}</h1>

            <span>/ {total}</span>

          </div>


          <h3 className="mt-4">
            Percentage
          </h3>


          <h2 className="percentage">
            {percentage}%
          </h2>


          <div
            className={
              passed
                ? "status success"
                : "status fail"
            }
          >
            {passed
              ? "🎉 PASS"
              : "❌ FAIL"}
          </div>

        </div>



        {/* Review Section */}


        <div className="review-section">


          <h2 className="review-title">
            📖 Review Your Answers
          </h2>



          {
            review.map((item, index) => (

              <div
                className="answer-card"
                key={index}
              >

                <div className="card-body">


                  <div className="question-number">

                    Question {index + 1}

                  </div>



                  <h4 className="question-text">

                    {item.question}

                  </h4>



                  <div className="answer-box">


                    <p className="mb-3">

                      <strong>
                        Your Answer :
                      </strong>{" "}


                      <span
                        className={
                          item.isCorrect
                            ? "text-success fw-bold"
                            : "text-danger fw-bold"
                        }
                      >

                        {item.studentAnswer}

                      </span>


                    </p>



                    <p className="mb-3">

                      <strong>
                        Correct Answer :
                      </strong>{" "}


                      <span className="text-success fw-bold">

                        {item.correctAnswer}

                      </span>


                    </p>



                    <div className="mt-4">


                      {
                        item.isCorrect ? (

                          <span className="badge bg-success fs-6 px-3 py-2">

                            ✔ Correct Answer

                          </span>

                        ) : (

                          <span className="badge bg-danger fs-6 px-3 py-2">

                            ✖ Wrong Answer

                          </span>

                        )
                      }


                    </div>


                  </div>


                </div>


              </div>


            ))
          }


        </div>




        {/* Bottom Buttons */}


        <div className="action-buttons text-center mt-5">


          <button
            className="btn btn-primary btn-lg me-3 action-btn"
            onClick={() => navigate("/student")}
          >

            📚 Take Another Quiz

          </button>



          <button
            className="btn btn-success btn-lg action-btn"
            onClick={() => navigate("/")}
          >

            🏠 Back to Home

          </button>


        </div>



      </div>


    </div>
  );
}

export default Result;