import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import Signup from './components/Signup';
import Login from './components/Login';
import SuccessPage from './components/SuccessPage';
import SuccessPassword from './components/SuccessPassword';
import ResetPassword from './components/ResetPassword';

import AdminLayout from './Layouts/AdminLayout';
import ClientLayout from './Layouts/ClientLayout';

import AdminDashboard from './pages/admin/Dashboard';
import Calendar from './pages/admin/Calendar';
import AllAppointments from './pages/admin/AllAppointments';
import FutureAppointments from './pages/admin/FutureAppointments';
import AllUsers from './pages/admin/Users/AllUsers';
import PendingApproval from './pages/admin/Users/PendingApproval';
import AwaitingConfirmation from './pages/admin/Users/AwaitingConfirmation';
import FrozenUsers from './pages/admin/Users/FrozenUsers';

import ClientDashboard from './pages/client/Dashboard';
import ClientAppointments from './pages/client/ClientAppointments';
import MyAppointments from './pages/client/MyAppointments';

import { AuthProvider, AuthContext } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

function AppWithAuth() {
  const { user, justLoggedIn, setJustLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && justLoggedIn) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'client') navigate('/client/dashboard');
      setJustLoggedIn(false);
    }
  }, [user, justLoggedIn, navigate, setJustLoggedIn]);

  return <AppRoutes />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/successPassword" element={<SuccessPassword />} />

      {/* ADMIN PROTECTED */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/schedule"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout><Calendar /></AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout><AllAppointments /></AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/appointments/future"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout><FutureAppointments /></AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout><AllUsers /></AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users/pending"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout><PendingApproval /></AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users/awaiting"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout><AwaitingConfirmation /></AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users/frozen"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout><FrozenUsers /></AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/reset-password"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout><ResetPassword /></AdminLayout>
          </PrivateRoute>
        }
      />

      {/* CLIENT PROTECTED */}
      <Route
        path="/client/dashboard"
        element={
          <PrivateRoute roles={['client']}>
            <ClientLayout><ClientDashboard /></ClientLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/client/schedule"
        element={
          <PrivateRoute roles={['client']}>
            <ClientLayout><Calendar /></ClientLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/client/appointments"
        element={
          <PrivateRoute roles={['client']}>
            <ClientLayout><ClientAppointments /></ClientLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/client/my-appointments"
        element={
          <PrivateRoute roles={['client']}>
            <ClientLayout><MyAppointments /></ClientLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/client/reset-password"
        element={
          <PrivateRoute roles={['client']}>
            <ClientLayout><ResetPassword /></ClientLayout>
          </PrivateRoute>
        }
      />

      {/* CATCH-ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
