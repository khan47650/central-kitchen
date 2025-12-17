import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const TopNavbar = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '16px 24px',
        borderBottom: '1px solid #ddd',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        All Appointments
      </Typography>

      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="body2" color="text.secondary">
          Hello, umair!
        </Typography>
        <Button variant="text" color="error">
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default TopNavbar;