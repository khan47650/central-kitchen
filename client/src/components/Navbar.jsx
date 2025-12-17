import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/Navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/img/logo3.png"; // ✅ Import your logo

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navigate = useNavigate();

  const handleNavLinkClick = () => {
    if (window.innerWidth < 992) setIsNavCollapsed(true);
  };

  const goToDashboard = () => {
    navigate("/dashboard");
    setIsNavCollapsed(true);
  };

  return (
    <div className="navbar-wrapper d-flex justify-content-center mt-3">
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow curved-navbar px-4 py-2">
        <div className="container-fluid justify-content-center">
          {/* ✅ Logo + Title */}
          <Link
            className="navbar-brand d-flex align-items-center fw-bold mx-3"
            to="/"
            onClick={handleNavLinkClick}
          >
            <img
              src={logo}
              alt="Central Kitchen Logo"
              className="me-2"
              style={{ width: "45px", height: "45px", objectFit: "contain" }}
            />
            <span>Central Kitchen</span>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Links */}
          <div
            className={`collapse navbar-collapse text-center ${
              isNavCollapsed ? "" : "show"
            }`}
            id="navbarContent"
          >
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-3">
              <li className="nav-item">
                <Link
                  className="nav-link fw-semibold"
                  to="/"
                  onClick={handleNavLinkClick}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link fw-semibold"
                  to="/about"
                  onClick={handleNavLinkClick}
                >
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link fw-semibold"
                  to="/contact"
                  onClick={handleNavLinkClick}
                >
                  Contact
                </Link>
              </li>
            </ul>

            {/* ✅ Auth Section */}
            <div className="auth-section d-flex align-items-center justify-content-center gap-2">
              {user ? (
                <>
                  <button
                    className="btn btn-outline-primary dashboard-btn"
                    onClick={goToDashboard}
                  >
                    {user.fullName || user.name || user.email}
                  </button>
                  <button
                    className="btn btn-outline-primary logout-btn"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-outline-primary login-btn"
                    onClick={handleNavLinkClick}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-outline-primary signup-btn"
                    onClick={handleNavLinkClick}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
