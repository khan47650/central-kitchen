import React, { useState } from 'react';
import {
  Drawer, List, ListItemButton, ListItemText, ListItemIcon,
  Collapse, Toolbar, Typography, Divider
} from '@mui/material';
import {
  ExpandLess, ExpandMore, Event, Person, Settings,
  CalendarMonth, Group, PendingActions, LockClock, HowToReg, Block
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockReset } from '@mui/icons-material';

const drawerWidth = 240;

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openAppointment, setOpenAppointment] = useState(true);
  const [openUser, setOpenUser] = useState(true);

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

  const subItemStyle = {
    pl: 4,
    color: 'white',
    '&.Mui-selected': {
      backgroundColor: '#fc8c03ff',
      fontWeight: 'bold',
    },
    '&:hover': {
      backgroundColor: '#ef8529ff',
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

      <List aria-label="Main navigation">
        {/* Schedule */}
        <ListItemButton
          sx={itemStyle}
          selected={isActive('/admin/schedule')}
          onClick={() => navigate('/admin/schedule')}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <CalendarMonth />
          </ListItemIcon>
          <ListItemText primary="Schedule" />
        </ListItemButton>

        {/* Appointments */}
        <ListItemButton sx={itemStyle} onClick={() => setOpenAppointment((prev) => !prev)}>
          <ListItemIcon sx={{ color: 'white' }}>
            <Event />
          </ListItemIcon>
          <ListItemText primary="Appointments" />
          {openAppointment ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openAppointment} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={subItemStyle}
              selected={isActive('/admin/appointments')}
              onClick={() => navigate('/admin/appointments')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <Group />
              </ListItemIcon>
              <ListItemText primary="All Appointments" />
            </ListItemButton>
            <ListItemButton
              sx={subItemStyle}
              selected={isActive('/admin/appointments/future')}
              onClick={() => navigate('/admin/appointments/future')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <LockClock />
              </ListItemIcon>
              <ListItemText primary="Future Appointments" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Users */}
        <ListItemButton sx={itemStyle} onClick={() => setOpenUser((prev) => !prev)}>
          <ListItemIcon sx={{ color: 'white' }}>
            <Person />
          </ListItemIcon>
          <ListItemText primary="Users" />
          {openUser ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openUser} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={subItemStyle}
              selected={isActive('/admin/users')}
              onClick={() => navigate('/admin/users')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <Group />
              </ListItemIcon>
              <ListItemText primary="All Users" />
            </ListItemButton>
            <ListItemButton
              sx={subItemStyle}
              selected={isActive('/admin/users/pending')}
              onClick={() => navigate('/admin/users/pending')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <PendingActions />
              </ListItemIcon>
              <ListItemText primary="Pending Approval" />
            </ListItemButton>
            <ListItemButton
              sx={subItemStyle}
              selected={isActive('/admin/users/awaiting')}
              onClick={() => navigate('/admin/users/awaiting')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <HowToReg />
              </ListItemIcon>
              <ListItemText primary="Awaiting Confirmation" />
            </ListItemButton>
            <ListItemButton
              sx={subItemStyle}
              selected={isActive('/admin/users/frozen')}
              onClick={() => navigate('/admin/users/frozen')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <Block />
              </ListItemIcon>
              <ListItemText primary="Frozen Users" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Settings */}
        <ListItemButton
          sx={itemStyle}
          selected={isActive('/admin/dashboard')}
          onClick={() => navigate('/admin/dashboard')}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>

        {/* Reset Password */}
        <ListItemButton
          sx={itemStyle}
          selected={isActive('/admin/reset-password')} 
          onClick={() => navigate('/admin/reset-password')}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <LockReset />
          </ListItemIcon>
          <ListItemText primary="Reset Password" />
        </ListItemButton>



      </List>
    </Drawer>
  );
};

export default AdminSidebar;