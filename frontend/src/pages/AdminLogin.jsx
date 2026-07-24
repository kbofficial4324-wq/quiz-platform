import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./AdminLogin.css";

function AdminLogin() {
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

    try {
      setLoading(true);

      const res = await API.post("/auth/login", form);

      if (res.data.user.role !== "admin") {
        alert("Only Admin can access this page.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/admin/dashboard");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Invalid Admin Login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="login-card">

        <div className="login-logo">
          🔐
        </div>

        <h2 className="login-title">
          Admin Login
        </h2>

        <p className="login-subtitle">
          Welcome back! Login to manage quizzes.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">

            <input
              type="email"
              className="form-control custom-input"
              placeholder="Admin Email"
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
              className="show-password"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "🙈" : "👁"}
            </span>

          </div>

          <button
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Login as Admin"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AdminLogin;