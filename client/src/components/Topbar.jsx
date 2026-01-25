import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import '../Styles/topbar.css'; 

const Topbar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout, loading } = useContext(AuthContext); 
  const drawerWidth = 240;

  const handleLogout = () => {
    logout(); 
  };

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
        {/* Hamburger icon for mobile */}
        <IconButton
          color="inherit"
          edge="start"
          sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 2 }}
          onClick={() => setMobileOpen(prev => !prev)} // toggle sidebar
        >
          <MenuIcon />
        </IconButton>

        <Typography className="topbar-title">
          Central Kitchen Dashboard
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box className="topbar-right">
          <Typography className="topbar-greeting">
            {loading ? "Loading..." : `Hello, ${user?.fullName  || user?.role || 'Guest'}!`}
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
