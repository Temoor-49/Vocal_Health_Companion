// frontend/src/components/Footer.js
import React from 'react';
import { Box, Typography, Link, Divider, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  return (
    <Box component="footer" sx={{ mt: 6, py: 3, textAlign: 'center' }}>
      <Divider sx={{ mb: 3 }} />
      
      <Typography variant="h6" gutterBottom color="primary">
        VocalCoach AI
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        An AI-powered speaking coach for confident communication.
        Built for the Google Cloud + Partners Hackathon.
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <IconButton 
          size="small" 
          href="https://github.com/yourusername/vocal-health-companion" 
          target="_blank"
        >
          <GitHubIcon />
        </IconButton>
        <IconButton size="small" href="mailto:your-email@example.com">
          <EmailIcon />
        </IconButton>
      </Box>
      
      <Typography variant="caption" color="text.secondary">
        Built with Google Gemini AI, ElevenLabs Voice API, Firebase, and Google Cloud.
        <br />
        © {new Date().getFullYear()} VocalCoach AI. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;