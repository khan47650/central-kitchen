import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/Login.css";
import logo from "../assets/img/logo3.png";
import { AuthContext } from "../context/AuthContext";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
const ADMIN_PERM_PASSWORD = process.env.REACT_APP_ADMIN_PERMANENT_PASSWORD;

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    // Admin check
     if (formData.email === ADMIN_EMAIL) {
    // Get resettable password from localStorage
    const resettable = localStorage.getItem("admin_reset_password") || process.env.REACT_APP_ADMIN_RESETTABLE_PASSWORD;

    if (formData.password === ADMIN_PERM_PASSWORD || formData.password === resettable) {
      login({
        accessToken: "admin-token",
        user: {
          email: formData.email,
          role: "admin",
          name: "Admin User",
        },
      });
      toast.success("Admin Login Successful!");
      navigate("/admin/dashboard", { replace: true });
      return;
    } else {
      toast.error("Invalid admin password!");
      return;
    }
  }

    // Client login via backend API
    try {
      const res = await fetch(`${DEFAULT_API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      // Save client login in context
      login({
        accessToken: data.token,
        user: data.user,
      });

      toast.success("Login Successful!");
      navigate("/client/dashboard",{replace:true});
      setFormData({ email: "", password: "" });

    } catch (err) {
      console.error("Login error:", err);
      toast.error("Server error. Try again later.");
    }
  }

  return (
    <div className="auth-wrapper">
      <ToastContainer autoClose={2000} />
      <div className="auth-card">
        <div className="text-center mb-4">
          <img src={logo} alt="EliteMart Logo" className="auth-logo" />
          <h3 className="auth-title mt-2">Welcome Back</h3>
          <p className="auth-subtext">Login to continue </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="fw-semibold mb-1">Email Address</label>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Enter email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <label className="fw-semibold mb-1">Password</label>
          <input
            type="password"
            className="form-control mb-4"
            placeholder="Enter password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <button type="submit" className="btn auth-btn w-100">Login</button>
        </form>

        <p className="auth-bottom-text text-center">
          Do not have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
