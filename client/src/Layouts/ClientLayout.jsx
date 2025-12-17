import React from 'react';
import { Box, Toolbar } from '@mui/material';
import ClientSidebar from '../components/ClientSidebar';
import Topbar from '../components/Topbar';

const ClientLayout = ({ children }) => {


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <ClientSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <Topbar />
        <Toolbar />  {/* This will automatically give Topbar height space */}
        <Box sx={{ mx: 'auto', px: 3, py: 3 }}>
          {children}
        </Box>
      </Box>

    </Box>
  );
};

export default ClientLayout;