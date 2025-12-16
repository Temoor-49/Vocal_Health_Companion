// frontend/src/components/Header.js
import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton,
  Avatar,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MicIcon from '@mui/icons-material/Mic';
import PersonIcon from '@mui/icons-material/Person';

const Header = () => {
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <IconButton sx={{ mr: 2 }}>
            <MicIcon color="primary" />
          </IconButton>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            VocalCoach AI
          </Typography>
          
          <Chip 
            label="Beta" 
            size="small" 
            color="secondary" 
            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Practice sessions: <strong>12</strong>
          </Typography>
          
          <Avatar sx={{ bgcolor: 'primary.light' }}>
            <PersonIcon />
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;