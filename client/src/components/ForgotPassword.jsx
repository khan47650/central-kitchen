import React, { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logo3.png";
import { AuthContext } from "../context/AuthContext";
import {useTheme, useMediaQuery } from "@mui/material";
import axios from "axios"

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading,setLoading]=useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email) {
      toast.error("Email is required");
      return;
    }
     
    setLoading(true);
    try {
      const res = await axios.post( `${DEFAULT_API}/api/users/forgot-password`,{ email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(res.data.message || "New password sent to your email");

      setTimeout(() => {
        navigate("/login",{replace:true});
      }, 2000);

    } catch (err) {
      if (err.response) {
        // backend error
        toast.error(err.response.data.message || "Something went wrong");
      } else {
        // server / network issue
        toast.error("Server error");
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <ToastContainer autoClose={2000} />
      <div className="auth-card">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h3 className="auth-title mt-2">Forgot Password</h3>
          <p className="auth-subtext">Enter your registered email below</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="fw-semibold mb-1">Registered Email</label>
          <input
            type="email"
            className="form-control mb-4"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="btn auth-btn w-100" disabled={loading}>
           {loading ? "Sending..." : "Send"} 
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
