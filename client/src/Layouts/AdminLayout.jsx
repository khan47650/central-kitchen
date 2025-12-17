import React, { useContext } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Topbar from '../components/Topbar';
import { Box, Toolbar } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user } = useContext(AuthContext);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
  {/* Topbar (only for admin users) */}
  {user?.role === 'admin' && <Topbar />}
  {user?.role === 'admin' && <Toolbar />}

        {/* Scrollable content */}
        <Box sx={{ flexGrow: 1, padding: 3, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;