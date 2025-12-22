import React, { useContext, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Topbar from '../components/Topbar';
import { Box, Toolbar } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const drawerWidth = 250; 

const AdminLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: `${drawerWidth}px` },  
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Topbar */}
        {user?.role === 'admin' && <Topbar setMobileOpen={setMobileOpen} />}
        {user?.role === 'admin' && <Toolbar />}

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            px: { xs: 1, sm: 2, md: 3 },
            py: 2,
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
