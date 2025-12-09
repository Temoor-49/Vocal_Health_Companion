// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [apiTestResult, setApiTestResult] = useState('');

  // Use environment variable or fallback
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const checkBackend = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/health`);
      const data = await response.json();
      setBackendStatus(`✅ ${data.status} - ${data.service}`);
    } catch (error) {
      setBackendStatus('❌ Backend not reachable');
    }
  }, [backendUrl]);

  const testApi = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/api/test`);
      const data = await response.json();
      setApiTestResult(`✅ ${data.message}`);
    } catch (error) {
      setApiTestResult(`❌ Error: ${error.message}`);
    }
  }, [backendUrl]);

  useEffect(() => {
    checkBackend();
    testApi();
  }, [checkBackend, testApi]);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom color="primary">
            🎤 Vocal Health Companion
          </Typography>
          <Typography variant="h6" gutterBottom>
            Your AI-Powered Speaking Coach
          </Typography>
          
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="body1">
              Backend Status: <strong>{backendStatus}</strong>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              API Test: <strong>{apiTestResult}</strong>
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={checkBackend}
                sx={{ mr: 1 }}
              >
                Check Backend
              </Button>
              <Button 
                variant="outlined" 
                onClick={testApi}
              >
                Test API
              </Button>
            </Box>
          </Box>

          <Typography variant="body1" sx={{ mt: 4 }}>
            Project setup complete! Both frontend and backend are running.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: 'gray' }}>
            Backend URL: {backendUrl}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default App;