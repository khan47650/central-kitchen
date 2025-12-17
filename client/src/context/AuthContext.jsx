import React, { createContext, useState, useEffect, useContext, useRef } from 'react';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const tryRefresh = async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken'); // ✅ Get stored refresh token
        if (!refreshToken) throw new Error('No refresh token found');

        // ✅ Step 1: Refresh access token
        const res = await fetch(`${API_URL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token: refreshToken })
        });

        if (!res.ok) throw new Error('Refresh token failed');

        const { accessToken: newAccessToken } = await res.json();
        setAccessToken(newAccessToken);
        localStorage.setItem('token', newAccessToken);

        // ✅ Step 2: Fetch user info
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${newAccessToken}` },
          credentials: 'include',
        });

        if (!meRes.ok) throw new Error('Failed to fetch user');

        const { user: fetchedUser } = await meRes.json();
        setUser(fetchedUser || null);
      } catch (err) {
        console.error('AuthContext error:', err.message);
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    tryRefresh();
  }, [API_URL]);

  const login = ({ accessToken, refreshToken, user }) => {
    setAccessToken(accessToken);
    setUser(user);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken); // ✅ Store refresh token
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const isAuthenticated = !!accessToken && !!user;

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, loading, isAuthenticated }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};