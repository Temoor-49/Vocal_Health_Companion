// frontend/src/components/FeatureCards.js - FIXED VERSION
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const features = [
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: '#4F46E5' }} />,
    title: 'AI-Powered Analysis',
    description: 'Get instant feedback on clarity, confidence, filler words, and pacing using Google Gemini AI.',
    tag: 'Powered by Gemini'
  },
  {
    icon: <RecordVoiceOverIcon sx={{ fontSize: 40, color: '#10B981' }} />,
    title: 'Voice-First Interface',
    description: 'Practice naturally with speech recognition and realistic voice feedback.',
    tag: 'ElevenLabs + Browser TTS'
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#F59E0B' }} />,
    title: 'Progress Tracking',
    description: 'Monitor your improvement over time with detailed analytics and session history.',
    tag: 'Firebase Database'
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#EF4444' }} />,
    title: 'Personalized Coaching',
    description: 'Receive tailored suggestions to improve specific areas of your speaking style.',
    tag: 'Smart Feedback'
  }
];

const FeatureCards = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Core Features
      </Typography>
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%', 
              transition: 'transform 0.2s', 
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: 3
              } 
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {feature.icon}
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  {feature.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 2, 
                  minHeight: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {feature.description}
                </Typography>
                
                <Chip 
                  label={feature.tag} 
                  size="small" 
                  sx={{ 
                    bgcolor: '#7C3AED',
                    color: '#F3F4F6',
                    fontSize: '0.7rem',
                    height: 24
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeatureCards;