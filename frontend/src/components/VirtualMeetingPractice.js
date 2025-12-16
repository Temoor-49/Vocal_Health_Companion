// frontend/src/components/VirtualMeetingPractice.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import GroupsIcon from '@mui/icons-material/Groups';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import Groups2Icon from '@mui/icons-material/Groups2';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const VirtualMeetingPractice = ({ backendUrl, userSpeech, onClose }) => {
  // ✅ Mock meeting templates (no API needed)
  const meetingTemplates = [
    {
      id: 'team_meeting',
      title: 'Weekly Team Sync',
      platform: 'Zoom',
      duration: '30 min',
      participants: 8,
      scenario: 'Presenting project updates to your team',
      prompts: [
        "Good morning team, let's start with updates...",
        "My project is on track, this week we completed...",
        "The main challenge we're facing is...",
        "For next week, we'll focus on..."
      ]
    },
    {
      id: 'client_presentation',
      title: 'Client Quarterly Review',
      platform: 'Teams',
      duration: '45 min',
      participants: 12,
      scenario: 'Presenting quarterly results to important clients',
      prompts: [
        "Thank you for joining today's review...",
        "This quarter, we achieved 120% of our targets...",
        "Our key metrics show improvement in...",
        "Looking ahead to next quarter, we plan to..."
      ]
    },
    {
      id: 'job_interview',
      title: 'Virtual Job Interview',
      platform: 'Zoom',
      duration: '60 min',
      participants: 3,
      scenario: 'Final round interview with company executives',
      prompts: [
        "Thank you for this opportunity...",
        "In my previous role, I successfully...",
        "What excites me about this position is...",
        "My approach to challenges is..."
      ]
    },
    {
      id: 'conference_talk',
      title: 'Virtual Conference Presentation',
      platform: 'Both',
      duration: '20 min',
      participants: 50,
      scenario: 'Presenting at an industry conference',
      prompts: [
        "Hello everyone, thank you for joining...",
        "Today I'll be discussing an important trend...",
        "Let me share a case study that illustrates...",
        "In conclusion, I want to leave you with..."
      ]
    }
  ];

  const [selectedMeeting, setSelectedMeeting] = useState(meetingTemplates[0]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [browserTTSAvailable, setBrowserTTSAvailable] = useState(false);

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().slice(0, 16));
    
    // Check browser TTS
    if ('speechSynthesis' in window) {
      setBrowserTTSAvailable(true);
      window.speechSynthesis.getVoices();
    }
  }, []);

  // ✅ FIXED: No API calls - generates analysis locally
  const analyzeMeetingPerformance = () => {
    if (!userSpeech || !selectedMeeting) return;
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Generate realistic mock analysis
      const wordCount = userSpeech.split(' ').length;
      const sentenceCount = (userSpeech.match(/[.!?]+/g) || []).length;
      
      // Calculate scores based on content
      let clarityScore = 7.5;
      let confidenceScore = 7.0;
      let performanceScore = 7.2;
      
      if (wordCount > 100) clarityScore += 0.5;
      if (sentenceCount > 5) confidenceScore += 0.5;
      if (userSpeech.includes('thank you') || userSpeech.includes('appreciate')) {
        performanceScore += 0.3;
      }
      
      // Cap scores at 10
      clarityScore = Math.min(clarityScore, 9.5);
      confidenceScore = Math.min(confidenceScore, 9.3);
      performanceScore = Math.min(performanceScore, 9.2);
      
      const mockAnalysis = {
        meeting_type: selectedMeeting.title,
        platform: selectedMeeting.platform,
        scenario: selectedMeeting.scenario,
        performance_score: parseFloat(performanceScore.toFixed(1)),
        feedback: [
          `Your tone is appropriate for a ${selectedMeeting.platform} ${selectedMeeting.title.toLowerCase()}`,
          `Good structure for ${selectedMeeting.scenario.toLowerCase()}`,
          wordCount < 50 ? "Consider adding more detail to your points" : "Good level of detail",
          "Practice maintaining eye contact with the camera",
          selectedMeeting.platform === 'Zoom' 
            ? "Try using Zoom's 'pin video' feature for key participants"
            : "Consider using Teams 'Together Mode' for engagement"
        ],
        platform_specific_tips: getPlatformTips(selectedMeeting.platform),
        meeting_recording: `https://meeting-recordings.example.com/${selectedMeeting.id}-${Date.now()}`
      };
      
      // Save to localStorage for voice feedback
      localStorage.setItem('vocalCoach_meetingAnalysis', JSON.stringify(mockAnalysis));
      
      setAnalysis(mockAnalysis);
      setLoading(false);
    }, 1500);
  };

  const getPlatformTips = (platform) => {
    const tips = {
      'Zoom': [
        "Use 'touch up my appearance' for better video quality",
        "Enable virtual background to minimize distractions",
        "Mute when not speaking to avoid background noise",
        "Use gallery view to see all participants"
      ],
      'Teams': [
        "Use 'Together Mode' for more engaging meetings",
        "Enable live captions for accessibility",
        "Use 'Raise Hand' feature for structured discussions",
        "Share specific windows instead of entire screen"
      ],
      'Both': [
        "Look at the camera, not your own video",
        "Use good lighting - face a window or use a lamp",
        "Position camera at eye level",
        "Use a headset for better audio quality",
        "Test your setup before important meetings"
      ]
    };
    
    return tips[platform] || tips['Both'];
  };

  const handleScheduleSession = () => {
    // Mock scheduling - no API needed
    const mockJoinUrl = `https://${selectedMeeting.platform.toLowerCase()}.us/j/${Math.floor(Math.random() * 10000000000)}`;
    
    alert(`✅ Practice session scheduled!\n\nPlatform: ${selectedMeeting.platform}\nMeeting: ${selectedMeeting.title}\nDate: ${new Date(scheduleDate).toLocaleString()}\n\nJoin URL: ${mockJoinUrl}\n\nCalendar invitation has been added.`);
    
    setScheduleDialog(false);
  };

  const playMeetingFeedback = () => {
    if (!analysis || !browserTTSAvailable) return;
    
    const feedbackText = `
      Great job on your ${analysis.meeting_type} practice! 
      Your performance score is ${analysis.performance_score} out of 10.
      ${analysis.feedback[0]}.
      ${analysis.feedback[1]}.
      For better ${analysis.platform} meetings, ${analysis.platform_specific_tips[0]}.
    `;
    
    const utterance = new SpeechSynthesisUtterance(feedbackText);
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const naturalVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
      if (naturalVoice) utterance.voice = naturalVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.cancel();
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const renderPerformanceScore = (score) => {
    let color = '#EF4444';
    let label = 'Needs Work';
    
    if (score >= 8.5) {
      color = '#10B981';
      label = 'Excellent';
    } else if (score >= 7.0) {
      color = '#F59E0B';
      label = 'Good';
    }
    
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          border: `8px solid ${color}20`,
          background: `conic-gradient(${color} ${score * 10}%, transparent ${score * 10}%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          position: 'relative'
        }}>
          <Box sx={{ 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <Typography variant="h4" fontWeight={700} color={color}>
              {score}/10
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        bgcolor: 'secondary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VideocamIcon fontSize="large" />
          <Box>
            <Typography variant="h6" fontWeight={600}>Virtual Meeting Practice</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Optimize your speaking for Zoom, Teams, and virtual presentations
            </Typography>
          </Box>
        </Box>
        {onClose && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={onClose}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Close
          </Button>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Meeting Template Selection */}
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupsIcon /> Select Meeting Type
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose a virtual meeting scenario to practice. Get tailored feedback for each platform.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {meetingTemplates.map((meeting) => (
            <Grid item xs={12} sm={6} md={3} key={meeting.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedMeeting?.id === meeting.id ? '2px solid #10B981' : '1px solid #374151',
                  bgcolor: selectedMeeting?.id === meeting.id ? '#1F2937' : 'inherit',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
                onClick={() => setSelectedMeeting(meeting)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {meeting.platform === 'Zoom' ? (
                      <ZoomInMapIcon color="primary" />
                    ) : meeting.platform === 'Teams' ? (
                      <Groups2Icon color="primary" />
                    ) : (
                      <VideocamIcon color="primary" />
                    )}
                    <Chip 
                      label={meeting.platform} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {meeting.title}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    {meeting.scenario}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="caption">
                      ⏱️ {meeting.duration}
                    </Typography>
                    <Typography variant="caption">
                      👥 {meeting.participants} people
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Analyze Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button 
            variant="contained"
            size="large"
            onClick={analyzeMeetingPerformance}
            disabled={!selectedMeeting || !userSpeech || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <VideocamIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            {loading ? 'Analyzing...' : 'Analyze Meeting Performance'}
          </Button>
        </Box>

        {/* Analysis Results */}
        {analysis && (
          <>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Meeting Performance Analysis
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VolumeUpIcon />}
                  onClick={playMeetingFeedback}
                  disabled={!browserTTSAvailable}
                >
                  Hear Feedback
                </Button>
              </Box>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  {renderPerformanceScore(analysis.performance_score)}
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom>
                    {analysis.meeting_type} on {analysis.platform}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {analysis.scenario}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {analysis.feedback.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ 
                          width: 6, 
                          height: 6, 
                          bgcolor: 'primary.main', 
                          borderRadius: '50%',
                          mt: 0.75,
                          mr: 1.5 
                        }} />
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Platform Tips */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TipsAndUpdatesIcon color="warning" /> {analysis.platform} Pro Tips
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {analysis.platform_specific_tips.map((tip, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2">{tip}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Action Buttons */}
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="contained"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={() => setScheduleDialog(true)}
                >
                  Schedule Practice Session
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    alert(`🎯 Joining mock ${selectedMeeting.platform} meeting for "${selectedMeeting.title}"\n\nThis simulates a real virtual meeting environment for practice.`);
                  }}
                >
                  Join Mock Meeting Now
                </Button>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <strong>Demo Mode:</strong> Using mock data for demonstration. In production, this would integrate with real Zoom/Teams APIs.
            </Alert>
          </>
        )}

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon /> Schedule Practice Session
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Schedule a virtual practice session on {selectedMeeting?.platform}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Meeting Type</InputLabel>
              <Select
                value={selectedMeeting?.id || ''}
                label="Meeting Type"
                disabled
              >
                <MenuItem value={selectedMeeting?.id}>{selectedMeeting?.title}</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              type="datetime-local"
              label="Date & Time"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              sx={{ mt: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              A calendar invitation and meeting link will be generated for you.
            </Alert>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleScheduleSession}
            >
              Schedule Session
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Paper>
  );
};

export default VirtualMeetingPractice;