import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      alert("Login Successful!");

      if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student");
      }

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="student-icon">
          🎓
        </div>

        <h2 className="login-title">
          Student Login
        </h2>

        <p className="login-subtitle">
          Welcome back! Login to continue your quizzes.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">

            <input
              type="email"
              name="email"
              className="form-control custom-input"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="mb-4 position-relative">

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control custom-input"
              placeholder="Enter Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <span
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "🙈" : "👁"}
            </span>

          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <div className="register-link">

          Don't have an account?

          <Link to="/register">
            Register Here
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;