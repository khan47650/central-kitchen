import React, { useState } from 'react';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import ClientSidebar from '../components/ClientSidebar';
import Topbar from '../components/Topbar';

const drawerWidth = 250;

const ClientLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

   return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
       <ClientSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

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
         <Topbar setMobileOpen={setMobileOpen} />
         <Toolbar/>

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

export default ClientLayout;
