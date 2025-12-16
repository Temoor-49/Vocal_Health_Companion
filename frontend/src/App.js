// frontend/src/App.js - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Alert, 
  LinearProgress,
  Tabs,
  Tab,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Divider
} from '@mui/material';

import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';


import VoiceRecorder from './components/VoiceRecorder';
import Statistics from './components/Statistics';



import FeatureCards from './components/featurecards'; // Capital F
import DemoWalkthrough from './components/DemoWalkthrough';
import ProgressChart from './components/ProgressChart';

// Import NEW Components
import VoiceSelector from './components/VoiceSelector';
import PracticeTemplates from './components/PracticeTemplates';
import ExportReports from './components/ExportsReports';



// Import Icons
import MicIcon from '@mui/icons-material/Mic';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DescriptionIcon from '@mui/icons-material/Description';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [geminiInfo, setGeminiInfo] = useState(null);
  const [elevenlabsInfo, setElevenlabsInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Update activeTab to load from localStorage
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('vocalCoach_activeTab');
    return savedTab ? parseInt(savedTab) : 0;
  });
  
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem('vocalCoach_selectedVoice') || null;
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Mock data for progress chart
  const progressData = [
    { date: 'Day 1', clarity: 6.5, confidence: 5.8 },
    { date: 'Day 2', clarity: 7.2, confidence: 6.3 },
    { date: 'Day 3', clarity: 7.8, confidence: 7.1 },
    { date: 'Day 4', clarity: 8.2, confidence: 7.5 },
    { date: 'Day 5', clarity: 8.7, confidence: 8.0 },
  ];

  // Load saved analysis result from localStorage on component mount
  useEffect(() => {
    const savedAnalysisResult = localStorage.getItem('vocalCoach_analysisResult');
    if (savedAnalysisResult) {
      try {
        setAnalysisResult(JSON.parse(savedAnalysisResult));
      } catch (error) {
        console.error('Error parsing saved analysis result:', error);
      }
    }
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch(`${backendUrl}/health`);
      const data = await response.json();
      setBackendStatus(`✅ ${data.status} - ${data.service}`);
    } catch (error) {
      setBackendStatus('❌ Backend not reachable');
    }
  };

  const testGeminiDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/test/gemini`);
      const data = await response.json();
      setGeminiInfo(data);
    } catch (error) {
      setGeminiInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testElevenlabsDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/test/elevenlabs`);
      const data = await response.json();
      setElevenlabsInfo(data);
    } catch (error) {
      setElevenlabsInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = (data) => {
    setAnalysisResult(data);
    // Save to localStorage
    localStorage.setItem('vocalCoach_analysisResult', JSON.stringify(data));
    
    // Switch to analysis tab automatically only on first analysis
    const hasSeenAnalysis = localStorage.getItem('vocalCoach_hasSeenAnalysis');
    if (!hasSeenAnalysis) {
      setActiveTab(1);
      localStorage.setItem('vocalCoach_hasSeenAnalysis', 'true');
    }
  };

  const handleStartPractice = () => {
    setActiveTab(0); // Switch to Voice Practice tab
  };

  const handleVoiceSelect = (voiceId) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('vocalCoach_selectedVoice', voiceId);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Switch to voice practice tab when template is selected
    setActiveTab(0);
    console.log('Selected template:', template);
  };

  // Save tab when it changes
  useEffect(() => {
    localStorage.setItem('vocalCoach_activeTab', activeTab.toString());
  }, [activeTab]);

  useEffect(() => {
    checkBackend();
    testGeminiDetails();
    testElevenlabsDetails();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {/* Professional Header */}
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderRadius: 0
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            py: 2,
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <MicIcon />
              </Avatar>
              <Box>
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
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Practice sessions: <strong>12</strong>
              </Typography>
              <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                <PersonIcon fontSize="small" />
              </Avatar>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Paper elevation={0} sx={{ 
          p: 5, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #A855F7 100%)',
          color: 'white',
          borderRadius: 3,
          mb: 4
        }}>
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
            🎤 Master Your Voice
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ opacity: 0.9, mb: 4 }}>
            AI-Powered Speaking Coach for Confident Communication
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleStartPractice}
            sx={{ 
              bgcolor: 'white', 
              color: '#4F46E5',
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              '&:hover': { bgcolor: '#f0f0f0' }
            }}
            startIcon={<MicIcon />}
          >
            Start Free Practice Session
          </Button>
        </Paper>

        {/* Voice Practice Section with Tabs */}
        <Paper elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': { py: 2 }
            }}
          >
            <Tab 
              icon={<MicIcon />} 
              label="Voice Practice" 
              iconPosition="start"
            />
            <Tab 
              icon={<AnalyticsIcon />} 
              label="Analysis Results" 
              iconPosition="start"
            />
            <Tab 
              icon={<AssessmentIcon />} 
              label="Progress Dashboard" 
              iconPosition="start"
            />
            <Tab 
              icon={<VolumeUpIcon />} 
              label="Voice Settings" 
              iconPosition="start"
            />
            <Tab 
              icon={<DescriptionIcon />} 
              label="Reports" 
              iconPosition="start"
            />
          </Tabs>

          {/* Tab 1: Voice Practice */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
                🎤 Voice Practice Session
              </Typography>
              
              {/* MAIN FUNCTION: Voice Recorder FIRST */}
              <VoiceRecorder 
                backendUrl={backendUrl}
                onAnalysisComplete={handleAnalysisComplete}
                selectedVoice={selectedVoice}
                selectedTemplate={selectedTemplate}
              />
              
              {/* Practice Templates AFTER Voice Recorder */}
              <PracticeTemplates 
                onTemplateSelect={handleTemplateSelect}
              />
            </Box>
          )}

          {/* Tab 2: Analysis Results */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              {analysisResult ? (
                <Statistics backendUrl={backendUrl} />
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <AnalyticsIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Analysis Results Yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Record and analyze your first speech to see detailed feedback here.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => setActiveTab(0)}
                    startIcon={<MicIcon />}
                  >
                    Start Your First Practice
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Tab 3: Progress Dashboard */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
                📈 Progress Dashboard
              </Typography>
              <ProgressChart data={progressData} backendUrl={backendUrl} />
            </Box>
          )}

          {/* Tab 4: Voice Settings */}
          {activeTab === 3 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
                🎭 Voice Settings
              </Typography>
              <VoiceSelector 
                backendUrl={backendUrl}
                onVoiceSelect={handleVoiceSelect}
                selectedVoice={selectedVoice}
              />
              <Alert severity="info" sx={{ mt: 3 }}>
                Selected voice will be used for all AI coaching feedback. 
                Changes are saved automatically.
              </Alert>
            </Box>
          )}

          {/* Tab 5: Reports */}
          {activeTab === 4 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
                📊 Progress Reports & Export
              </Typography>
              <ExportReports 
                backendUrl={backendUrl}
                analysisResult={analysisResult}
              />
            </Box>
          )}
        </Paper>

        {/* Feature Cards */}
        <Box sx={{ mb: 4 }}>
          <FeatureCards />
        </Box>

        {/* System Status */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" /> System Status
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#8B5CF6' }}>
                <Typography variant="body2" color="text.secondary">Backend</Typography>
                <Typography variant="body1" fontWeight="bold">{backendStatus}</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#8B5CF6' }}>
                <Typography variant="body2" color="text.secondary">Gemini AI</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {geminiInfo?.model || 'Gemini 2.5 Flash-Lite'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#8B5CF6' }}>
                <Typography variant="body2" color="text.secondary">ElevenLabs</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {elevenlabsInfo?.status === 'connected' ? 'Connected ✓' : 'Checking...'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* Project Description */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2, bgcolor: 'primary.50' }}>
          <Typography variant="h6" gutterBottom color="primary" align="center">
            VocalCoach AI
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            An AI-powered speaking coach for confident communication. 
            Built with Google Gemini AI, ElevenLabs Voice API, Firebase, and Google Cloud for the Google Cloud + Partners Hackathon.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="Google Gemini AI" color="primary" variant="outlined" />
            <Chip label="ElevenLabs Voice" color="secondary" variant="outlined" />
            <Chip label="Firebase Database" color="success" variant="outlined" />
            <Chip label="Google Cloud" color="warning" variant="outlined" />
            <Chip label="Real-time Analysis" color="info" variant="outlined" />
            <Chip label="Progress Tracking" color="error" variant="outlined" />
          </Box>
        </Paper>

        {/* Footer */}
        <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <IconButton 
              size="small" 
              href="https://github.com/yourusername/vocal-health-companion" 
              target="_blank"
              sx={{ mx: 1 }}
            >
              <GitHubIcon />
            </IconButton>
            <IconButton size="small" href="mailto:your-email@example.com" sx={{ mx: 1 }}>
              <EmailIcon />
            </IconButton>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Backend: {backendUrl} | Model: {geminiInfo?.model || 'Gemini 2.5 Flash-Lite'} | © {new Date().getFullYear()} VocalCoach AI
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;