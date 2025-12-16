import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // ⭐ THIS CHANGES EVERYTHING TO DARK MODE
    primary: {
      main: '#8B5CF6', // Purple for dark mode
      light: '#A78BFA',
      dark: '#7C3AED',
    },
    secondary: {
      main: '#10B981', // Keep green for contrast
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#000000', // ⭐ BLACK background
      paper: '#111827',   // Dark gray for cards/paper
    },
    text: {
      primary: '#f3f4f6', // Light text
      secondary: '#9CA3AF', // Gray text
    },
  },

  // Add to theme.js
breakpoints: {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
},
components: {
  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: '16px',
        paddingRight: '16px',
        '@media (min-width: 600px)': {
          paddingLeft: '24px',
          paddingRight: '24px',
        },
      },
    },
  },
},
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000000', // ⭐ Ensures body is black
          margin: 0,
          padding: 0,
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#111827', // Dark gray for papers
          color: '#F3F4F6', // Light text on papers
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#111827',
          border: '1px solid #374151', // Subtle border
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
        },
      },
    },
  },
});

export default theme;