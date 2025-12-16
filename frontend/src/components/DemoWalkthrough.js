// frontend/src/components/DemoWalkthrough.js
/*import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Typography,
  Box
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import TranslateIcon from '@mui/icons-material/Translate';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const steps = [
  {
    label: 'Record Your Speech',
    description: 'Click the microphone button and speak naturally. Practice presentations, interviews, or casual conversations.',
    icon: <MicIcon />
  },
  {
    label: 'AI Transcription',
    description: 'Our system converts your speech to text using advanced voice recognition technology.',
    icon: <TranslateIcon />
  },
  {
    label: 'Instant AI Analysis',
    description: 'Google Gemini AI analyzes your speech for clarity, confidence, filler words, pacing, and structure.',
    icon: <AnalyticsIcon />
  },
  {
    label: 'Voice Feedback',
    description: 'Receive personalized coaching advice through natural-sounding voice feedback.',
    icon: <VolumeUpIcon />
  }
];

const DemoWalkthrough = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        How It Works
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Follow these 4 simple steps to improve your speaking skills
      </Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel StepIconComponent={() => (
              <Box sx={{ color: 'primary.main' }}>
                {step.icon}
              </Box>
            )}>
              <Typography variant="subtitle1">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2">{step.description}</Typography>
              <Box sx={{ mb: 2, mt: 1 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

export default DemoWalkthrough;*/