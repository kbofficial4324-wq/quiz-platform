import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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
      await API.post("/auth/register", form);

      alert("🎉 Registration Successful!");

      navigate("/login");

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Registration Failed"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="register-icon">
          📝
        </div>

        <h2 className="register-title">
          Create Account
        </h2>

        <p className="register-subtitle">
          Join the Think Smart Quiz Platform
        </p>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">

            <input
              type="text"
              className="form-control custom-input"
              placeholder="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

          </div>

          <div className="mb-3">

            <input
              type="email"
              className="form-control custom-input"
              placeholder="Email Address"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="mb-4 position-relative">

            <input
              type={showPassword ? "text" : "password"}
              className="form-control custom-input"
              placeholder="Password"
              name="password"
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
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <div className="login-link">

          Already have an account?

          <Link to="/login">
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;