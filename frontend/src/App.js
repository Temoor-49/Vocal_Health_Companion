// frontend/src/App.js
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
  Tab
} from '@mui/material';
import VoiceRecorder from './components/VoiceRecorder';
import MicIcon from '@mui/icons-material/Mic';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';     // ⭐ NEW
import Statistics from './components/Statistics';                 // ⭐ NEW


function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [geminiInfo, setGeminiInfo] = useState(null);
  const [elevenlabsInfo, setElevenlabsInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Use environment variable or fallback
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

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
  };

  useEffect(() => {
    checkBackend();
    testGeminiDetails();
    testElevenlabsDetails();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Typography variant="h3" gutterBottom color="primary" align="center">
            🎤 Vocal Health Companion
          </Typography>
          <Typography variant="h6" gutterBottom align="center">
            Your AI-Powered Speaking Coach
          </Typography>
          
          {loading && <LinearProgress sx={{ my: 2 }} />}
          
          {/* Status Panel */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="body1">
              <strong>Backend Status:</strong> {backendStatus}
            </Typography>
            
            {/* Gemini Info */}
            {geminiInfo && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  🤖 Gemini AI Status
                </Typography>
                <Typography variant="body2">
                  <strong>Model:</strong> {geminiInfo.model}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {geminiInfo.gemini}
                </Typography>
                <Typography variant="body2">
                  <strong>Test:</strong> {geminiInfo.test_result}
                </Typography>
              </Box>
            )}
            
            {/* ElevenLabs Info */}
            {elevenlabsInfo && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  🔊 ElevenLabs Voice Status
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {elevenlabsInfo.status}
                </Typography>
                {elevenlabsInfo.voices && (
                  <Typography variant="body2">
                    <strong>Available Voices:</strong> {elevenlabsInfo.voices_count}
                  </Typography>
                )}
                {elevenlabsInfo.note && (
                  <Typography variant="caption" color="text.secondary">
                    Note: {elevenlabsInfo.note}
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Test Buttons */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={checkBackend}
              >
                Test Backend
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={testGeminiDetails}
              >
                Test Gemini
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={testElevenlabsDetails}
              >
                Test ElevenLabs
              </Button>
            </Box>
          </Box>
          
          {/* Tabs for different views */}
          <Box sx={{ mt: 4 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab icon={<MicIcon />} label="Voice Practice" />
              <Tab icon={<AnalyticsIcon />} label="Analysis Results" />
              <Tab icon={<AssessmentIcon />} label="Progress Dashboard" /> {/* ⭐ NEW */}
            </Tabs>
            
            {/* Tab 1: Voice Practice */}
            {activeTab === 0 && (
              <Box sx={{ mt: 3 }}>
                <VoiceRecorder 
                  backendUrl={backendUrl}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </Box>
            )}
            
            {/* Tab 2: Analysis Results */}
            {activeTab === 1 && analysisResult && (
              <Box sx={{ mt: 3, p: 3, bgcolor: '#fff8e1', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Analysis Results
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Clarity Score</Typography>
                    <Typography variant="h4" color="primary">
                      {analysisResult.feedback.clarity_score}/10
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Confidence Score</Typography>
                    <Typography variant="h4" color="secondary">
                      {analysisResult.feedback.confidence_score}/10
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Filler Words</Typography>
                    <Typography variant="h4" color="error">
                      {analysisResult.feedback.filler_words_count}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Word Count</Typography>
                    <Typography variant="h4">
                      {analysisResult.feedback.word_count}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Feedback List */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Key Feedback:
                  </Typography>
                  <ul>
                    {analysisResult.feedback.key_feedback.map((item, index) => (
                      <li key={index}><Typography variant="body2">{item}</Typography></li>
                    ))}
                  </ul>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Improvement Suggestions:
                  </Typography>
                  <ul>
                    {analysisResult.feedback.improvement_suggestions.map((item, index) => (
                      <li key={index}><Typography variant="body2">{item}</Typography></li>
                    ))}
                  </ul>
                </Box>
                
                {analysisResult.feedback.is_real_ai === false && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Using mock data. Check Gemini API setup for real AI analysis.
                  </Alert>
                )}
              </Box>
            )}
            
            {activeTab === 1 && !analysisResult && (
              <Box sx={{ mt: 3, p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No analysis results yet. Record and analyze a speech first!
                </Typography>
              </Box>
            )}

            {/* ⭐ NEW TAB 3: Statistics Dashboard */}
            {activeTab === 2 && (
              <Box sx={{ mt: 3 }}>
                <Statistics backendUrl={backendUrl} />
              </Box>
            )}

          </Box>
          
          {/* Footer Info */}
          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Backend URL:</strong> {backendUrl}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Day 3: Voice integration complete! Record, transcribe, analyze, and get voice feedback.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default App;
