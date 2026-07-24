import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar-custom">
      <div className="nav-container">

        <Link className="navbar-brand brand-logo" to="/">

  <span className="brand-icon">
    🎯
</span>

  <div>

    <span className="brand-title">
      Think Smart
    </span>

    <small className="brand-subtitle">
      Quiz Platform
    </small>

  </div>

</Link>

        <div className="nav-buttons">

          <Link
            className="nav-btn admin-btn"
            to="/admin"
          >
            Admin
          </Link>


          <Link
            className="nav-btn student-btn"
            to="/login"
          >
            Student Login
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;