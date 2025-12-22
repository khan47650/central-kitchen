import React from 'react';
import {
  Drawer, List, ListItemButton, ListItemText, ListItemIcon,
  Collapse, Toolbar, Typography, Divider
} from '@mui/material';
import {
  ExpandLess, ExpandMore, Event, Person, Settings,
  CalendarMonth, Group, PendingActions, LockClock, HowToReg, Block, LockReset
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
const drawerWidth = 240;

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openAppointment, setOpenAppointment] = React.useState(true);
  const [openUser, setOpenUser] = React.useState(true);

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

  // **Helper function**: navigate + close mobile drawer
  const handleNavigate = (path) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false); // close only on mobile
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" sx={{ paddingLeft: 2 }}>
          Central Kitchen
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItemButton
          sx={itemStyle}
          selected={isActive('/admin/schedule')}
          onClick={() => handleNavigate('/admin/schedule')}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <CalendarMonth />
          </ListItemIcon>
          <ListItemText primary="Schedule" />
        </ListItemButton>

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
              onClick={() => handleNavigate('/admin/appointments')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <Group />
              </ListItemIcon>
              <ListItemText primary="All Appointments" />
            </ListItemButton>
            <ListItemButton
              sx={subItemStyle}
              selected={isActive('/admin/appointments/future')}
              onClick={() => handleNavigate('/admin/appointments/future')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <LockClock />
              </ListItemIcon>
              <ListItemText primary="Future Appointments" />
            </ListItemButton>
          </List>
        </Collapse>

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
              onClick={() => handleNavigate('/admin/users')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <Group />
              </ListItemIcon>
              <ListItemText primary="All Users" />
            </ListItemButton>
            <ListItemButton
              sx={subItemStyle}
              selected={isActive('/admin/users/pending')}
              onClick={() => handleNavigate('/admin/users/pending')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <PendingActions />
              </ListItemIcon>
              <ListItemText primary="Pending Approval" />
            </ListItemButton>
            <ListItemButton
              sx={subItemStyle}
              selected={isActive('/admin/users/awaiting')}
              onClick={() => handleNavigate('/admin/users/awaiting')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <HowToReg />
              </ListItemIcon>
              <ListItemText primary="Awaiting Confirmation" />
            </ListItemButton>
            <ListItemButton
              sx={subItemStyle}
              selected={isActive('/admin/users/frozen')}
              onClick={() => handleNavigate('/admin/users/frozen')}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <Block />
              </ListItemIcon>
              <ListItemText primary="Frozen Users" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton
          sx={itemStyle}
          selected={isActive('/admin/dashboard')}
          onClick={() => handleNavigate('/admin/dashboard')}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>

        <ListItemButton
          sx={itemStyle}
          selected={isActive('/admin/reset-password')}
          onClick={() => handleNavigate('/admin/reset-password')}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <LockReset />
          </ListItemIcon>
          <ListItemText primary="Reset Password" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <>
      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#006232', color: 'white', minHeight: '100vh' },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#006232', color: 'white' },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;
