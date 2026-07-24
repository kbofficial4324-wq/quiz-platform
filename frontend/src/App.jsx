import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import AdminResults from "./pages/AdminResults";

import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminLogin />} />


        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />


        <Route
          path="/results"
          element={
            <AdminRoute>
              <AdminResults />
            </AdminRoute>
          }
        />


        <Route path="/student" element={<StudentDashboard />} />

        <Route path="/quiz/:quizId" element={<Quiz />} />

        <Route path="/result" element={<Result />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;