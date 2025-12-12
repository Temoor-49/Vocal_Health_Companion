// frontend/src/components/Statistics.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  LinearProgress,
  Card,
  CardContent,
  Button
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Statistics = ({ backendUrl }) => {
  const [statistics, setStatistics] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsResponse = await fetch(`${backendUrl}/api/statistics`);
      const statsData = await statsResponse.json();
      setStatistics(statsData);
      
      // Fetch recent sessions
      const sessionsResponse = await fetch(`${backendUrl}/api/sessions?limit=3`);
      const sessionsData = await sessionsResponse.json();
      setRecentSessions(sessionsData.sessions || []);
      
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading statistics...</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AssessmentIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Your Progress Dashboard</Typography>
        <Button 
          size="small" 
          onClick={fetchStatistics}
          sx={{ ml: 'auto' }}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEventsIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ mt: 1 }}>
                {statistics?.total_sessions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ mt: 1 }}>
                {statistics?.average_clarity || 0}/10
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. Clarity
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimelineIcon color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ mt: 1 }}>
                {statistics?.average_confidence || 0}/10
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. Confidence
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {statistics?.total_words || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Words Practiced
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Sessions */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        Recent Practice Sessions
      </Typography>
      
      {recentSessions.length > 0 ? (
        <Box>
          {recentSessions.map((session, index) => (
            <Paper 
              key={session.id || index} 
              sx={{ 
                p: 2, 
                mb: 1,
                bgcolor: index === 0 ? '#f0f7ff' : 'white'
              }}
            >
              <Typography variant="body2">
                {session.text ? `${session.text.substring(0, 80)}...` : 'No text available'}
              </Typography>
              {session.analysis?.feedback && (
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography variant="caption">
                    Clarity: {session.analysis.feedback.clarity_score}/10
                  </Typography>
                  <Typography variant="caption">
                    Confidence: {session.analysis.feedback.confidence_score}/10
                  </Typography>
                  <Typography variant="caption">
                    Words: {session.analysis.feedback.word_count}
                  </Typography>
                </Box>
              )}
              {session.created_at && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(session.created_at).toLocaleDateString()}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No practice sessions yet. Record your first speech!
        </Typography>
      )}

      {statistics?.is_mock && (
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 2 }}>
          Using mock statistics. Firebase needs proper configuration.
        </Typography>
      )}
    </Paper>
  );
};

export default Statistics;