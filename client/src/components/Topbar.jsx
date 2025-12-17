import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import '../Styles/topbar.css'; 

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout(); 
  };

  const drawerWidth = 240;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={(theme) => ({
        backgroundColor: '#fff',
        color: 'primary.main',
        borderBottom: '1px solid #eee',
        paddingX: { xs: 2, md: 4 },
        zIndex: theme.zIndex.drawer + 1,
        left: { md: `${drawerWidth}px`, xs: 0 },
        width: { md: `calc(100% - ${drawerWidth}px)`, xs: '100%' },
      })}
      className="topbar"
    >
      <Toolbar className="topbar" sx={{ minHeight: { xs: 56, sm: 64, md: 64 } }}>
        <Typography className="topbar-title">
          Central Kitchen Dashboard
        </Typography>

        <Box className="topbar-right">
          <Typography className="topbar-greeting">
            Hello, {user?.name || user?.role || 'guest'}!
          </Typography>

          <button className="topbar-logout" onClick={handleLogout}>
            Logout
          </button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
