// frontend/src/components/VoiceRecorder.js - WITH FIXED analyzeText FUNCTION
import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import VideocamIcon from '@mui/icons-material/Videocam';
import ClearIcon from '@mui/icons-material/Clear';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

// Import components
import ComparisonComponent from './ComparisonComponent';
import VirtualMeetingPractice from './VirtualMeetingPractice';

const VoiceRecorder = ({ backendUrl, onAnalysisComplete, selectedVoice, selectedTemplate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [browserTTSAvailable, setBrowserTTSAvailable] = useState(false);
  
  const [showComparison, setShowComparison] = useState(false);
  const [showMeetingPractice, setShowMeetingPractice] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isAnalyzingMeeting, setIsAnalyzingMeeting] = useState(false);
  
  // Conversation Mode State
  const [conversationMode, setConversationMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isProcessingConversation, setIsProcessingConversation] = useState(false);
  const [conversationRecording, setConversationRecording] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const conversationRecorderRef = useRef(null);

  // ✅ Load saved state from localStorage on component mount
  useEffect(() => {
    // Load transcribed text
    const savedText = localStorage.getItem('vocalCoach_transcribedText');
    if (savedText) {
      setTranscribedText(savedText);
    }
    
    // Load analysis result
    const savedAnalysis = localStorage.getItem('vocalCoach_analysisResult');
    if (savedAnalysis) {
      try {
        setAnalysisResult(JSON.parse(savedAnalysis));
      } catch (e) {
        console.error('Error loading saved analysis:', e);
      }
    }
    
    // Load conversation history if exists
    const savedConversation = localStorage.getItem('vocalCoach_conversationHistory');
    if (savedConversation) {
      try {
        setConversationHistory(JSON.parse(savedConversation));
      } catch (e) {
        console.error('Error loading conversation history:', e);
      }
    }
    
    // Check browser TTS
    if ('speechSynthesis' in window) {
      setBrowserTTSAvailable(true);
      window.speechSynthesis.getVoices();
    }
  }, []);

  // ✅ Save transcribed text to localStorage whenever it changes
  useEffect(() => {
    if (transcribedText) {
      localStorage.setItem('vocalCoach_transcribedText', transcribedText);
    }
  }, [transcribedText]);

  // ✅ Save analysis result to localStorage whenever it changes
  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem('vocalCoach_analysisResult', JSON.stringify(analysisResult));
    }
  }, [analysisResult]);

  // ✅ Save conversation history to localStorage
  useEffect(() => {
    if (conversationHistory.length > 0) {
      localStorage.setItem('vocalCoach_conversationHistory', JSON.stringify(conversationHistory));
    }
  }, [conversationHistory]);

  const startRecording = async () => {
    try {
      setError('');
      setSuccess('');
      setShowComparison(false);
      setShowMeetingPractice(false);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setSuccess('🎤 Recording started... Speak now!');
      
    } catch (err) {
      setError('❌ Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setSuccess('⏹️ Recording stopped. Click "Transcribe" to process.');
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  // ✅ FIXED: Updated transcribeAudio with mode parameter for analysis
  const transcribeAudio = async () => {
    if (!audioBlob) {
      setError('No recording to transcribe');
      return;
    }

    setIsTranscribing(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      formData.append('mode', 'analysis');  // CRITICAL: Tell backend this is for analysis
      
      console.log('🔍 Sending transcription request with mode=analysis');
      
      const response = await fetch(`${backendUrl}/api/speech-to-text`, {
        method: 'POST',
        body: formData,  // FormData automatically sets Content-Type
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTranscribedText(data.text);
        setSuccess('✅ Speech transcribed! Now analyze or generate feedback.');
        console.log('🎤 Transcription complete:', {
          mode: data.mode,
          textPreview: data.text?.substring(0, 100) + '...',
          isMock: data.is_mock,
          note: data.note
        });
      } else {
        setError('Transcription failed: ' + (data.detail || 'Unknown error'));
      }
    } catch (err) {
      setError('Error during transcription: ' + err.message);
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  // ✅ FIXED: Updated analyzeText function with better error handling
  const analyzeText = async () => {
    if (!transcribedText.trim()) {
      setError('No text to analyze');
      return;
    }

    try {
      let sessionId = null;
      
      // FIRST: Save session to get session ID
      try {
        const sessionResponse = await fetch(`${backendUrl}/api/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: transcribedText,
            audio_duration: audioBlob ? Math.round(audioBlob.size / 1000) : 0,
            recorded_at: new Date().toISOString()
          }),
        });

        const sessionData = await sessionResponse.json();
        sessionId = sessionData.session_id;
        console.log('✅ Created session:', sessionId);
        
      } catch (sessionError) {
        console.log('⚠️ Session save failed, using mock session', sessionError);
        sessionId = `mock_${Date.now()}`;
      }

      // SECOND: Analyze with AI
      const analysisResponse = await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcribedText }),
      });
      
      const analysisData = await analysisResponse.json();
      
      if (analysisResponse.ok && sessionId) {
        // THIRD: Save analysis to session
        try {
          await fetch(`${backendUrl}/api/sessions/${sessionId}/analysis`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(analysisData),
          });
          console.log('✅ Analysis saved to session:', sessionId);
        } catch (saveError) {
          console.log('⚠️ Analysis save failed, but continuing', saveError);
        }

        setSuccess('✅ Analysis complete! Click "Get Voice Feedback" to hear results.');
        setAnalysisResult(analysisData);
        
        // ✅ Save to localStorage for persistence
        localStorage.setItem('vocalCoach_analysisResult', JSON.stringify(analysisData));

        // Pass data to parent
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisData);
        }
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch (err) {
      setError('Error during analysis: ' + err.message);
      console.error('Analysis error:', err);
    }
  };

  // ✅ FIXED: Browser TTS ONLY - Checks localStorage for saved analysis
  const getVoiceFeedback = () => {
    if (!transcribedText.trim()) {
      setError('No speech text available for feedback');
      return;
    }

    if (!browserTTSAvailable) {
      setError('Browser speech synthesis not available. Try Chrome, Edge, or Safari.');
      return;
    }

    try {
      // ✅ Check both state AND localStorage for analysis
      let currentAnalysis = analysisResult;
      if (!currentAnalysis) {
        const savedAnalysis = localStorage.getItem('vocalCoach_analysisResult');
        if (savedAnalysis) {
          try {
            currentAnalysis = JSON.parse(savedAnalysis);
          } catch (e) {
            console.error('Error parsing saved analysis:', e);
          }
        }
      }

      let feedbackText = '';
      
      if (currentAnalysis && currentAnalysis.feedback) {
        // Extract data from analysis
        const clarity = currentAnalysis.feedback?.clarity_score || 8;
        const confidence = currentAnalysis.feedback?.confidence_score || 7;
        const fillers = currentAnalysis.feedback?.filler_words_count || 0;
        const improvement = currentAnalysis.feedback?.improvement_suggestions?.[0] || 
                           currentAnalysis.feedback?.suggestions?.[0] || 
                           'Practice speaking slowly and clearly.';
        
        // ✅ Use real analysis results
        feedbackText = `Excellent! Here's your detailed feedback. Your clarity score is ${clarity} out of 10. Your confidence score is ${confidence} out of 10. You used ${fillers} filler words. For improvement: ${improvement}`;
        
        // ✅ Check for comparison results
        const savedComparison = localStorage.getItem('vocalCoach_comparisonResult');
        if (savedComparison) {
          try {
            const comparisonData = JSON.parse(savedComparison);
            feedbackText += ` Compared with ${comparisonData.professional_speech?.speaker || 'professional speaker'}, your similarity score is ${comparisonData.similarity_scores?.overall_similarity || '70'} percent.`;
          } catch (e) {
            console.error('Error parsing comparison:', e);
          }
        }
        
        // ✅ Check for meeting analysis
        const savedMeeting = localStorage.getItem('vocalCoach_meetingResult');
        if (savedMeeting) {
          try {
            const meetingData = JSON.parse(savedMeeting);
            feedbackText += ` For virtual meetings, your score is ${meetingData.analysis?.performance_score || 8} out of 10.`;
          } catch (e) {
            console.error('Error parsing meeting data:', e);
          }
        }
        
        setSuccess('🔊 Playing detailed AI feedback based on your analysis...');
      } else {
        // Generic feedback if no analysis yet
        feedbackText = "Thanks for your practice speech! I can see you've transcribed your speech. To get detailed feedback with scores and improvement suggestions, click 'Analyze with AI' first. Then click 'Voice Feedback' again.";
        setSuccess('🔊 Playing general feedback. Analyze with AI for detailed scores.');
      }
      
      playVoiceFeedback(feedbackText);
      
    } catch (browserError) {
      setError('Browser speech synthesis failed. Please try a different browser.');
      console.error('Browser TTS error:', browserError);
    }
  };

  // Helper function to play voice feedback
  const playVoiceFeedback = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get and select the best voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const naturalVoice = voices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Samantha') ||
        v.name.includes('Microsoft') ||
        v.lang.includes('en-US')
      );
      
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    }
    
    // Stop any previous speech and play new one
    window.speechSynthesis.cancel();
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const quickCompareWithPros = async () => {
    if (!transcribedText.trim()) {
      setError('No text to compare. Please transcribe your speech first.');
      return;
    }

    setIsComparing(true);
    setError('');

    try {
      const response = await fetch(`${backendUrl}/api/compare-with-pro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: transcribedText 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // ✅ Save comparison result for voice feedback
        localStorage.setItem('vocalCoach_comparisonResult', JSON.stringify(data));
        
        setSuccess(`✅ Compared with ${data.professional_speech?.speaker || 'professional speaker'}! Similarity: ${data.similarity_scores?.overall_similarity || '75'}%`);
        setShowComparison(true);
        setShowMeetingPractice(false);
      } else {
        setError('Comparison failed: ' + (data.detail || 'Unknown error'));
      }
    } catch (err) {
      setError('Error during comparison: ' + err.message);
      console.error('Comparison error:', err);
    } finally {
      setIsComparing(false);
    }
  };

  const quickMeetingAnalysis = async () => {
    if (!transcribedText.trim()) {
      setError('No text to analyze. Please transcribe your speech first.');
      return;
    }

    setIsAnalyzingMeeting(true);
    setError('');

    try {
      const response = await fetch(`${backendUrl}/api/analyze-meeting-performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: transcribedText,
          meeting_type: selectedTemplate?.title || 'team_meeting'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // ✅ Save meeting result for voice feedback
        localStorage.setItem('vocalCoach_meetingResult', JSON.stringify(data));
        
        setSuccess(`✅ Meeting analysis complete! Score: ${data.analysis?.performance_score || 8}/10`);
        setShowMeetingPractice(true);
        setShowComparison(false);
      } else {
        setError('Meeting analysis failed');
      }
    } catch (err) {
      setError('Error during meeting analysis: ' + err.message);
      console.error('Meeting analysis error:', err);
    } finally {
      setIsAnalyzingMeeting(false);
    }
  };

  // ✅ Clear all saved data
  const clearSession = () => {
    localStorage.removeItem('vocalCoach_transcribedText');
    localStorage.removeItem('vocalCoach_analysisResult');
    localStorage.removeItem('vocalCoach_comparisonResult');
    localStorage.removeItem('vocalCoach_meetingResult');
    localStorage.removeItem('vocalCoach_conversationHistory');
    
    setTranscribedText('');
    setAnalysisResult(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setShowComparison(false);
    setShowMeetingPractice(false);
    setConversationMode(false);
    setConversationHistory([]);
    
    setSuccess('🗑️ Session cleared. Ready for new practice!');
  };

  // Conversation Mode Functions
  const startConversation = async () => {
    setConversationMode(true);
    const greeting = 'Hello! I\'m your speaking coach. What would you like to practice today?';
    
    setConversationHistory([{
      speaker: 'ai',
      text: greeting,
      timestamp: new Date().toISOString()
    }]);
    
    // Play AI greeting
    if ('speechSynthesis' in window) {
      playVoiceFeedback(greeting);
    }
    
    setSuccess('💬 Conversation mode started! The AI coach will guide you through speaking practice.');
  };

  const endConversation = () => {
    setConversationMode(false);
    setSuccess('💬 Conversation mode ended. You can review the conversation history.');
  };

  const startConversationRecording = async () => {
    try {
      setConversationRecording(true);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      conversationRecorderRef.current = new MediaRecorder(stream);
      
      conversationRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      conversationRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleConversationAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      conversationRecorderRef.current.start();
      setSuccess('🎤 Recording your response... Speak now!');
      
    } catch (err) {
      setError('Failed to access microphone for conversation.');
      console.error('Conversation recording error:', err);
    }
  };

  const stopConversationRecording = () => {
    if (conversationRecorderRef.current && conversationRecording) {
      conversationRecorderRef.current.stop();
      setConversationRecording(false);
    }
  };

  const handleConversationAudio = async (audioBlob) => {
    setIsProcessingConversation(true);
    
    try {
      // Transcribe user speech with conversation mode
      const formData = new FormData();
      formData.append('file', audioBlob, 'conversation.wav');
      formData.append('mode', 'conversation');  // Use conversation mode for varied responses
      
      console.log('💬 Sending conversation transcription with mode=conversation');
      
      const transcribeResponse = await fetch(`${backendUrl}/api/speech-to-text`, {
        method: 'POST',
        body: formData,
      });
      
      const transcribeData = await transcribeResponse.json();
      
      if (transcribeResponse.ok) {
        const userSpeech = transcribeData.text;
        
        // Add user message to history
        setConversationHistory(prev => [...prev, {
          speaker: 'user',
          text: userSpeech,
          timestamp: new Date().toISOString()
        }]);
        
        // Get AI response
        await handleConversationResponse(userSpeech);
        
      } else {
        setError('Failed to transcribe conversation.');
      }
    } catch (err) {
      setError('Error processing conversation.');
      console.error('Conversation processing error:', err);
    } finally {
      setIsProcessingConversation(false);
    }
  };

  const handleConversationResponse = async (userSpeech) => {
    try {
      // Send to backend for conversational response
      const response = await fetch(`${backendUrl}/api/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userSpeech,
          history: conversationHistory,
          mode: 'speaking_practice'
        }),
      });
      
      const aiResponse = await response.json();
      
      if (response.ok) {
        // Add AI response to history
        setConversationHistory(prev => [...prev, {
          speaker: 'ai',
          text: aiResponse.text,
          timestamp: new Date().toISOString(),
          feedback: aiResponse.feedback
        }]);
        
        // Speak AI response
        if ('speechSynthesis' in window) {
          playVoiceFeedback(aiResponse.text);
        }
        
        setSuccess('💬 AI coach responded! Listen to the feedback.');
        
      } else {
        setError('Failed to get AI response.');
      }
    } catch (error) {
      setError('Error in conversation.');
      console.error('Conversation error:', error);
    }
  };

  const handleTextConversationResponse = async (text) => {
    setIsProcessingConversation(true);
    
    try {
      // Add user message to history
      setConversationHistory(prev => [...prev, {
        speaker: 'user',
        text: text,
        timestamp: new Date().toISOString()
      }]);
      
      // Get AI response
      await handleConversationResponse(text);
      
    } catch (error) {
      setError('Error in text conversation.');
      console.error('Text conversation error:', error);
    } finally {
      setIsProcessingConversation(false);
    }
  };

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.prompts && selectedTemplate.prompts.length > 0) {
      setTranscribedText(selectedTemplate.prompts[0]);
      setSuccess(`📋 Using "${selectedTemplate.title}" template. Feel free to edit or record over it.`);
    }
  }, [selectedTemplate]);

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            🎤 Voice Practice Session
            {selectedTemplate && (
              <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                ({selectedTemplate.title} Template)
              </Typography>
            )}
          </Typography>
          
          {/* Clear Session Button */}
          <Button
            variant="text"
            size="small"
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={clearSession}
            sx={{ textTransform: 'none' }}
          >
            Clear Session
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        {/* Conversation Mode Toggle */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant={conversationMode ? "contained" : "outlined"}
            color={conversationMode ? "success" : "primary"}
            startIcon={<ChatIcon />}
            onClick={conversationMode ? endConversation : startConversation}
            fullWidth
          >
            {conversationMode ? 'End Conversation with AI Coach' : '💬 Start Conversation with AI Coach'}
          </Button>
        </Box>
        
        {/* Conversation Mode UI */}
        {conversationMode && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" color="primary">
                💬 AI Coaching Conversation
              </Typography>
              <Chip 
                label="Live" 
                color="success" 
                size="small" 
                variant="outlined"
              />
            </Box>
            
            {/* Conversation History */}
            <Box sx={{ maxHeight: '300px', overflowY: 'auto', mb: 2, p: 1 }}>
              {conversationHistory.map((msg, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    mb: 1,
                    justifyContent: msg.speaker === 'ai' ? 'flex-start' : 'flex-end'
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: msg.speaker === 'ai' ? 'primary.light' : 'secondary.light',
                      color: msg.speaker === 'ai' ? 'primary.contrastText' : 'secondary.contrastText',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          mr: 1,
                          bgcolor: msg.speaker === 'ai' ? 'primary.main' : 'secondary.main'
                        }}
                      >
                        {msg.speaker === 'ai' ? 'AI' : 'You'}
                      </Avatar>
                      <Typography variant="caption">
                        {msg.speaker === 'ai' ? 'AI Coach' : 'You'}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {msg.text}
                    </Typography>
                    {msg.feedback && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                        💡 Feedback: {msg.feedback}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
            
            {/* Conversation Controls */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant={conversationRecording ? "contained" : "outlined"}
                color={conversationRecording ? "error" : "primary"}
                startIcon={conversationRecording ? <StopIcon /> : <MicIcon />}
                onClick={conversationRecording ? stopConversationRecording : startConversationRecording}
                disabled={isProcessingConversation}
                size="small"
              >
                {conversationRecording ? 'Stop Recording' : 'Record Response'}
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  const text = prompt('Type your response to the AI coach:');
                  if (text) handleTextConversationResponse(text);
                }}
                disabled={isProcessingConversation}
                size="small"
              >
                Type Response
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const lastAI = conversationHistory.filter(msg => msg.speaker === 'ai').pop();
                  if (lastAI) playVoiceFeedback(lastAI.text);
                }}
              >
                Repeat Last
              </Button>
            </Box>
            
            {isProcessingConversation && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="caption">
                  Processing your conversation...
                </Typography>
              </Box>
            )}
          </Paper>
        )}
        
        {/* Recording Controls (only show if not in conversation mode) */}
        {!conversationMode && (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color={isRecording ? "error" : "primary"}
                startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing || isComparing || isAnalyzingMeeting}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              
              {audioUrl && (
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  onClick={playRecording}
                  disabled={isPlaying}
                >
                  Play Recording
                </Button>
              )}
            </Box>
            
            {/* Audio Player */}
            {audioUrl && (
              <Box sx={{ mb: 2 }}>
                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  controls 
                  style={{ width: '100%' }}
                />
              </Box>
            )}
            
            {/* Transcribe Button */}
            {audioBlob && !transcribedText && (
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={transcribeAudio}
                  disabled={isTranscribing}
                  startIcon={isTranscribing ? <CircularProgress size={20} /> : <SendIcon />}
                >
                  {isTranscribing ? 'Transcribing...' : 'Transcribe Speech to Text'}
                </Button>
              </Box>
            )}
            
            {/* Transcribed Text & Actions */}
            {transcribedText && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  📝 Your Speech Text:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, fontStyle: selectedTemplate ? 'italic' : 'normal' }}>
                  {transcribedText}
                </Typography>
                
                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
                  gap: 2,
                  mb: 2 
                }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={analyzeText}
                    disabled={isComparing || isAnalyzingMeeting}
                    sx={{ height: '100%' }}
                  >
                    Analyze with AI
                  </Button>
                  
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={getVoiceFeedback}
                    startIcon={<PlayArrowIcon />}
                    disabled={!transcribedText || !browserTTSAvailable}
                    sx={{ height: '100%' }}
                  >
                    Voice Feedback
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={quickCompareWithPros}
                    disabled={!transcribedText || isComparing}
                    startIcon={isComparing ? <CircularProgress size={16} /> : <CompareArrowsIcon />}
                    sx={{ height: '100%' }}
                  >
                    {isComparing ? 'Comparing...' : 'Compare with Pros'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    color="info"
                    onClick={quickMeetingAnalysis}
                    disabled={!transcribedText || isAnalyzingMeeting}
                    startIcon={isAnalyzingMeeting ? <CircularProgress size={16} /> : <VideocamIcon />}
                    sx={{ height: '100%', gridColumn: { xs: '1', sm: '1', md: 'auto' } }}
                  >
                    {isAnalyzingMeeting ? 'Analyzing...' : 'Virtual Meeting'}
                  </Button>
                </Box>
                
                {/* Voice Info & Status */}
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {browserTTSAvailable 
                      ? '🔊 Voice feedback available' 
                      : '⚠️ Enable browser TTS for voice feedback'}
                  </Typography>
                  
                  {localStorage.getItem('vocalCoach_analysisResult') && (
                    <Typography variant="caption" color="success.main">
                      ✓ Analysis saved
                    </Typography>
                  )}
                  
                  {localStorage.getItem('vocalCoach_comparisonResult') && (
                    <Typography variant="caption" color="secondary.main">
                      ✓ Comparison saved
                    </Typography>
                  )}
                  
                  {localStorage.getItem('vocalCoach_meetingResult') && (
                    <Typography variant="caption" color="info.main">
                      ✓ Meeting analysis saved
                    </Typography>
                  )}
                  
                  {conversationHistory.length > 0 && (
                    <Typography variant="caption" color="warning.main">
                      💬 Conversation saved
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Instructions */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            📋 How to Use:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, color: 'text.secondary' }}>
            <Typography variant="body2" component="li">
              1. <strong>Start Conversation</strong> with AI coach for interactive practice
            </Typography>
            <Typography variant="body2" component="li">
              2. <strong>Record</strong> your practice speech
            </Typography>
            <Typography variant="body2" component="li">
              3. <strong>Transcribe</strong> to text (saved automatically)
            </Typography>
            <Typography variant="body2" component="li">
              4. <strong>Analyze</strong> with AI for scores
            </Typography>
            <Typography variant="body2" component="li">
              5. <strong>Get voice feedback</strong> from AI coach
            </Typography>
            <Typography variant="body2" component="li">
              6. <strong>Compare with professional speakers</strong> 🆕
            </Typography>
            <Typography variant="body2" component="li">
              7. <strong>Practice for virtual meetings</strong> (Zoom/Teams) 🆕
            </Typography>
            <Typography variant="body2" component="li" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}>
              💡 Your data is saved automatically! Switch tabs without losing progress.
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      {/* Comparison Modal */}
      {showComparison && (
        <Box sx={{ mt: 3 }}>
          <ComparisonComponent
            backendUrl={backendUrl}
            userSpeech={transcribedText}
            onClose={() => setShowComparison(false)}
          />
        </Box>
      )}
      
      {/* Virtual Meeting Practice Modal */}
      {showMeetingPractice && (
        <Box sx={{ mt: 3 }}>
          <VirtualMeetingPractice
            backendUrl={backendUrl}
            userSpeech={transcribedText}
            onClose={() => setShowMeetingPractice(false)}
          />
        </Box>
      )}
    </Card>
  );
};

export default VoiceRecorder;