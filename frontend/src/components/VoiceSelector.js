// frontend/src/components/VoiceSelector.js - FIXED VERSION (Browser TTS Only)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';

const VoiceSelector = ({ backendUrl, onVoiceSelect }) => {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [playingVoice, setPlayingVoice] = useState(null);
  const [browserTTSAvailable, setBrowserTTSAvailable] = useState(false);

  useEffect(() => {
    fetchVoices();
    
    // Check if browser TTS is available
    if ('speechSynthesis' in window) {
      setBrowserTTSAvailable(true);
      window.speechSynthesis.getVoices();
    }
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/voices`);
      const data = await response.json();
      setVoices(data.voices || []);
      
      // Set default voice (first one)
      if (data.voices && data.voices.length > 0) {
        setSelectedVoice(data.voices[0].voice_id);
        if (onVoiceSelect) {
          onVoiceSelect(data.voices[0].voice_id);
        }
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Use Browser TTS instead of ElevenLabs API
  const playVoicePreview = (voiceName) => {
    if (playingVoice || !browserTTSAvailable) return;
    
    setPlayingVoice(voiceName);
    
    try {
      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(
        `Hello, I'm ${voiceName}. I'll be your speaking coach today. Let's practice together!`
      );
      
      // Get available browser voices
      const browserVoices = window.speechSynthesis.getVoices();
      
      if (browserVoices.length > 0) {
        // Try to match voice gender/type
        const isFemale = voiceName === 'Sarah' || voiceName === 'Laura';
        const preferredVoice = browserVoices.find(voice => 
          (isFemale && voice.name.toLowerCase().includes('female')) ||
          (!isFemale && voice.name.toLowerCase().includes('male')) ||
          voice.name.includes('Google') ||
          voice.name.includes('Natural')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        // Set good defaults
        utterance.rate = 1.0;
        utterance.pitch = isFemale ? 1.1 : 1.0;
        utterance.volume = 1.0;
      }
      
      // Stop any previous speech
      window.speechSynthesis.cancel();
      
      // Speak the preview
      utterance.onend = () => {
        setPlayingVoice(null);
      };
      
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Error playing voice preview:', error);
      setPlayingVoice(null);
      
      // Fallback: Show alert instead of playing
      alert(`Voice preview for ${voiceName}. In production, this would play audio.`);
    }
  };

  const handleVoiceSelect = (voice) => {
    setSelectedVoice(voice.voice_id);
    if (onVoiceSelect) {
      onVoiceSelect(voice.voice_id);
    }
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        🎭 Choose Your Coach's Voice
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a voice personality for your AI coach's feedback. {browserTTSAvailable ? 'Preview voices using browser speech.' : 'Browser speech synthesis not available.'}
      </Typography>
      
      {voices.length === 0 ? (
        <Alert severity="info">
          No voices available. Please check your ElevenLabs API connection.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {voices.map((voice) => (
            <Grid item xs={12} sm={6} md={4} key={voice.voice_id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedVoice === voice.voice_id ? '2px solid #8B5CF6' : '1px solid #374151',
                  backgroundColor: selectedVoice === voice.voice_id ? '#1F2937' : 'inherit',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => handleVoiceSelect(voice)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {voice.name}
                    </Typography>
                    
                    {selectedVoice === voice.voice_id && (
                      <CheckCircleIcon color="primary" />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
                    {voice.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      icon={voice.name === 'Sarah' || voice.name === 'Laura' ? <FemaleIcon /> : <MaleIcon />}
                      label={voice.category === 'premade' ? 'Standard' : voice.category}
                      size="small"
                      variant="outlined"
                    />
                    
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoicePreview(voice.name);
                      }}
                      disabled={playingVoice === voice.name || !browserTTSAvailable}
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&:disabled': {
                          bgcolor: 'grey.700',
                          color: 'grey.500'
                        }
                      }}
                    >
                      {playingVoice === voice.name ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <VolumeUpIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #374151' }}>
        <Typography variant="caption" color="text.secondary">
          {browserTTSAvailable 
            ? 'Voice previews using browser speech synthesis. ElevenLabs integration demonstrated in code.' 
            : 'ElevenLabs API integrated. Enable browser speech synthesis for voice previews.'}
        </Typography>
        
        {!browserTTSAvailable && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Browser speech synthesis not available. Try Chrome, Edge, or Safari for voice previews.
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default VoiceSelector;