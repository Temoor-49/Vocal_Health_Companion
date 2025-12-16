// frontend/src/components/ComparisonComponent.js - UPDATED VERSION
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
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

const ComparisonComponent = ({ backendUrl, userSpeech, onClose }) => {
  const [professionalSpeeches, setProfessionalSpeeches] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSpeeches, setLoadingSpeeches] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchProfessionalSpeeches();
    
    // Check if we have saved comparison
    const savedComparison = localStorage.getItem('vocalCoach_comparisonResult');
    if (savedComparison && userSpeech) {
      try {
        const parsed = JSON.parse(savedComparison);
        setComparisonResult(parsed);
        setSelectedProfessional(parsed.professional_speech);
      } catch (e) {
        console.error('Error loading saved comparison:', e);
      }
    }
  }, [userSpeech]);

  const fetchProfessionalSpeeches = async () => {
    try {
      setLoadingSpeeches(true);
      const response = await fetch(`${backendUrl}/api/professional-speeches`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      setProfessionalSpeeches(data.speeches || []);
      
      // Auto-select first speech if none selected
      if (data.speeches && data.speeches.length > 0 && !selectedProfessional) {
        setSelectedProfessional(data.speeches[0]);
      }
    } catch (error) {
      console.error('Error fetching speeches:', error);
      // Fallback to mock data
      setProfessionalSpeeches([
        {
          id: 'ted_001',
          title: 'Steve Jobs - Stanford Commencement',
          speaker: 'Steve Jobs',
          category: 'Motivational',
          tags: ['leadership', 'inspiration', 'career'],
          metrics: {
            clarity_score: 9.5,
            confidence_score: 9.8,
            pace: 'medium'
          }
        },
        {
          id: 'ted_002',
          title: 'How Great Leaders Inspire Action',
          speaker: 'Simon Sinek',
          category: 'Leadership',
          tags: ['business', 'leadership', 'communication'],
          metrics: {
            clarity_score: 9.2,
            confidence_score: 9.3,
            pace: 'slow'
          }
        }
      ]);
    } finally {
      setLoadingSpeeches(false);
    }
  };

  const runComparison = async () => {
    if (!userSpeech || !selectedProfessional) {
      setError('Please provide speech text and select a professional speaker');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Running comparison...');
      const response = await fetch(`${backendUrl}/api/compare-with-pro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: userSpeech,
          professional_id: selectedProfessional.id
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        
        // Use mock data if API fails
        generateMockComparison();
        return;
      }
      
      const data = await response.json();
      console.log('Comparison success:', data);
      
      // Save to localStorage
      localStorage.setItem('vocalCoach_comparisonResult', JSON.stringify(data));
      setComparisonResult(data);
      setSuccess(`Successfully compared with ${data.professional_speech.speaker}!`);
      
    } catch (error) {
      console.error('Comparison error:', error);
      setError('Connection failed. Using demo comparison data.');
      generateMockComparison();
    } finally {
      setLoading(false);
    }
  };

  const generateMockComparison = () => {
    const mockResult = {
      success: true,
      user_analysis: {
        clarity_score: Math.floor(Math.random() * 3) + 7, // 7-9
        confidence_score: Math.floor(Math.random() * 3) + 6, // 6-8
        filler_words_count: Math.floor(Math.random() * 5),
        pace: ["slow", "medium", "fast"][Math.floor(Math.random() * 3)]
      },
      professional_speech: selectedProfessional || {
        id: 'ted_001',
        title: 'Steve Jobs - Stanford Commencement',
        speaker: 'Steve Jobs',
        category: 'Motivational',
        metrics: {
          clarity_score: 9.5,
          confidence_score: 9.8,
          pace: 'medium'
        }
      },
      comparison: {
        summary: "Your speech shows good potential with room to grow",
        strengths: ["Clear message", "Good energy", "Authentic delivery"],
        areas_to_improve: ["More dramatic pauses", "Stronger opening", "Better pacing"],
        specific_advice: "Try using more pauses for emphasis like professional speakers"
      },
      similarity_scores: {
        clarity_similarity: Math.floor(Math.random() * 30) + 60, // 60-90%
        confidence_similarity: Math.floor(Math.random() * 30) + 55, // 55-85%
        overall_similarity: Math.floor(Math.random() * 30) + 60 // 60-90%
      },
      improvement_areas: ["Pacing", "Confidence", "Storytelling"],
      professional_tips: [
        "Use dramatic pauses for emphasis",
        "Tell personal stories to connect",
        "Repeat key phrases for impact",
        "Practice speaking slowly and clearly",
        "Record yourself and listen back"
      ],
      is_mock: true
    };
    
    localStorage.setItem('vocalCoach_comparisonResult', JSON.stringify(mockResult));
    setComparisonResult(mockResult);
    setSuccess(`Demo comparison with ${mockResult.professional_speech.speaker} complete!`);
  };

  const renderSimilarityMeter = (score, label) => {
    let color = '#EF4444'; // Red
    let status = 'Low';
    
    if (score >= 80) {
      color = '#10B981'; // Green
      status = 'High';
    } else if (score >= 60) {
      color = '#F59E0B'; // Yellow
      status = 'Medium';
    }
    
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption">{label}</Typography>
          <Typography variant="caption" fontWeight={600}>
            {score}% ({status})
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={score} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: '#374151',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: 4
            }
          }}
        />
      </Box>
    );
  };

  const speakComparisonFeedback = () => {
    if (!comparisonResult || !('speechSynthesis' in window)) return;
    
    const feedback = `
      Compared with ${comparisonResult.professional_speech.speaker}, 
      your overall similarity is ${comparisonResult.similarity_scores.overall_similarity} percent.
      Your clarity score is ${comparisonResult.user_analysis.clarity_score} out of 10.
      ${comparisonResult.comparison.specific_advice}
    `;
    
    const utterance = new SpeechSynthesisUtterance(feedback);
    window.speechSynthesis.speak(utterance);
  };

  if (loadingSpeeches) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading professional speeches...</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CompareArrowsIcon fontSize="large" />
          <Box>
            <Typography variant="h6" fontWeight={600}>Compare with Pros</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              See how you measure against world-class speakers
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        {!comparisonResult ? (
          /* SELECTION VIEW */
          <>
            <Typography variant="subtitle1" gutterBottom>
              Select a Professional Speaker
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a speaker to compare your delivery style with. See how you can improve to reach their level.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {professionalSpeeches.map((speech) => (
                <Grid item xs={12} sm={6} key={speech.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedProfessional?.id === speech.id ? '2px solid #8B5CF6' : '1px solid #374151',
                      bgcolor: selectedProfessional?.id === speech.id ? '#1F2937' : 'inherit',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}
                    onClick={() => setSelectedProfessional(speech)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {speech.speaker}
                        </Typography>
                        <Chip 
                          label={speech.category} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {speech.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {speech.tags?.slice(0, 2).map((tag) => (
                          <Chip 
                            key={tag} 
                            label={tag} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={onClose}
              >
                Back to Practice
              </Button>
              
              <Button 
                variant="contained"
                onClick={runComparison}
                disabled={!selectedProfessional || loading || !userSpeech}
                startIcon={loading ? <CircularProgress size={20} /> : <CompareArrowsIcon />}
              >
                {loading ? 'Comparing...' : 'Compare Now'}
              </Button>
            </Box>
          </>
        ) : (
          /* RESULTS VIEW */
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                🎯 You vs {comparisonResult.professional_speech.speaker}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setComparisonResult(null);
                    setSelectedProfessional(null);
                  }}
                >
                  Compare Another
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={speakComparisonFeedback}
                  startIcon={<VolumeUpIcon />}
                >
                  Hear Feedback
                </Button>
              </Box>
            </Box>

            {/* Overall Similarity */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon color="primary" /> Overall Similarity Score
              </Typography>
              
              <Box sx={{ textAlign: 'center', my: 2 }}>
                <Typography variant="h2" color="primary" fontWeight={700}>
                  {comparisonResult.similarity_scores.overall_similarity}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Match with {comparisonResult.professional_speech.speaker}'s speaking style
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                  {renderSimilarityMeter(comparisonResult.similarity_scores.clarity_similarity, "Clarity")}
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderSimilarityMeter(comparisonResult.similarity_scores.confidence_similarity, "Confidence")}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Your Scores:
                    </Typography>
                    <Typography variant="h5" color="secondary">
                      Clarity: {comparisonResult.user_analysis.clarity_score}/10
                    </Typography>
                    <Typography variant="h5" color="secondary" sx={{ mt: 1 }}>
                      Confidence: {comparisonResult.user_analysis.confidence_score}/10
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Comparison Details */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon color="success" /> Your Strengths
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {comparisonResult.comparison.strengths.map((strength, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          bgcolor: 'success.main', 
                          borderRadius: '50%',
                          mr: 1.5 
                        }} />
                        <Typography variant="body2">{strength}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="warning" /> Areas to Improve
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {comparisonResult.comparison.areas_to_improve.map((area, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5, p: 1, bgcolor: 'warning.50', borderRadius: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          bgcolor: 'warning.main', 
                          borderRadius: '50%',
                          mr: 1.5 
                        }} />
                        <Typography variant="body2">{area}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Professional Tips */}
            <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                💡 Tips from {comparisonResult.professional_speech.speaker}'s Style
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {comparisonResult.professional_tips.map((tip, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, height: '100%' }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ 
                          width: 6, 
                          height: 6, 
                          bgcolor: 'primary.main', 
                          borderRadius: '50%',
                          mt: 0.75,
                          mr: 1.5,
                          flexShrink: 0
                        }} />
                        {tip}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained"
                onClick={() => {
                  // Save to session for voice feedback
                  localStorage.setItem('vocalCoach_comparisonResult', JSON.stringify(comparisonResult));
                  alert('Comparison saved! This will enhance your voice feedback.');
                }}
              >
                Save This Comparison
              </Button>
              
              <Button 
                variant="outlined"
                onClick={() => {
                  // Export as report
                  const report = {
                    title: `Comparison with ${comparisonResult.professional_speech.speaker}`,
                    date: new Date().toLocaleDateString(),
                    ...comparisonResult
                  };
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
                  const downloadAnchorNode = document.createElement('a');
                  downloadAnchorNode.setAttribute("href", dataStr);
                  downloadAnchorNode.setAttribute("download", `comparison-${comparisonResult.professional_speech.speaker}.json`);
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}
              >
                Export Report
              </Button>
              
              <Button 
                variant="text"
                onClick={onClose}
              >
                Back to Practice
              </Button>
            </Box>

            {comparisonResult.is_mock && (
              <Alert severity="info" sx={{ mt: 3 }}>
                Using enhanced comparison data. In production, this would use real AI analysis for more accurate comparisons.
              </Alert>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ComparisonComponent;