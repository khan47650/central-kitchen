// src/components/PrivateRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!user) return <Navigate to="/" replace />; 

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />; 

  return children;
};

export default PrivateRoute;
