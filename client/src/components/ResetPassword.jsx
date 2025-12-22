import React, { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, replace, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo3.png";
import { AuthContext } from "../context/AuthContext";
import { Box, useTheme, useMediaQuery } from "@mui/material";


const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  const handleSubmit = async (e) => {
    e.preventDefault();

    // If Admin
   if (user.role === "admin") {
    // Update only resettable password
    localStorage.setItem("admin_reset_password", password);
    toast.success("Admin resettable password updated!", {
      onClose: () => navigate("/admin/dashboard", { replace: true }),
      autoClose: 1200,
    });
    return;
  }

    // Client API call
    try {
      const res = await fetch(`${DEFAULT_API}/api/users/update-password/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password updated successfully!", {
       onClose: () => navigate("/client/dashboard", { replace: true }),
      autoClose: 1200
       });
} else {
  toast.error(data.message || "Error updating password");
}


    } catch (error) {
      console.log("User object:", user);
      console.log("User ID:", user?._id);
   
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="auth-wrapper">
      <ToastContainer autoClose={2000} />
      <div className="auth-card">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h3 className="auth-title mt-2">Reset Password</h3>
          <p className="auth-subtext">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="fw-semibold mb-1">New Password</label>
          <input
            type="password"
            className="form-control mb-4"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn auth-btn w-100">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
