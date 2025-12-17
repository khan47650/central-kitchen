import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6F00', // orange
    },
    secondary: {
      main: '#424242', // dark gray
    },
    background: {
      default: '#f9f9f9',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
});

export default theme;