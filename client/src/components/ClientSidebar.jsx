import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Typography,
  Divider
} from '@mui/material';
import {
  CalendarMonth,
  EventAvailable,
  AssignmentTurnedIn,
  LockReset,
   Settings
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const ClientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: 'Schedule', path: '/client/schedule', icon: <CalendarMonth /> },
    { label: 'All Appointments', path: '/client/appointments', icon: <EventAvailable /> },
    { label: 'My Appointments', path: '/client/my-appointments', icon: <AssignmentTurnedIn /> },
    { label: 'Settings', path: '/client/dashboard', icon: <Settings /> },
    { label: 'Reset Password', path: '/client/reset-password', icon: <LockReset /> },
  ];

  const isActive = (path) => location.pathname === path;

  const itemStyle = {
    color: 'white',
    '&.Mui-selected': {
      backgroundColor: '#f5970cff',
      fontWeight: 'bold',
    },
    '&:hover': {
      backgroundColor: '#ef7707ff',
    },
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#006232',
          color: 'white',
          minHeight: '100vh',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ paddingLeft: 2 }}>
          Central Kitchen
        </Typography>
      </Toolbar>

      <Divider />

      <List aria-label="Client navigation">
        {links.map((link) => (
          <ListItemButton
            key={link.label}
            onClick={() => navigate(link.path)}
            selected={isActive(link.path)}
            sx={itemStyle}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {link.icon}
            </ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default ClientSidebar;