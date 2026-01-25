import React, { createContext, useState, useEffect, useContext, useRef } from 'react';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  // 🔁 Restore session on refresh
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    setLoading(false);
    return;
  }

  // ✅ Skip backend call for admin token
  if (token === "admin-token") {
    setUser({
      email: process.env.REACT_APP_ADMIN_EMAIL,
      role: "admin",
      name: "Admin",
    });
    setAccessToken(token);
    setLoading(false);
    return;
  }

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Invalid token");

      const data = await res.json();
      setAccessToken(token);
      setUser(data.user);
    } catch {
      localStorage.clear();
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  fetchMe();
}, [API_URL]);


  const login = ({ accessToken, user }) => {
    setAccessToken(accessToken);
    setUser(user);
    localStorage.setItem("token", accessToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
