// frontend/src/components/ConversationCoach.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Tooltip,
  Fab
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

const ConversationCoach = ({ backendUrl }) => {
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [showTips, setShowTips] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const conversationEndRef = useRef(null);

  // Define fetchTopics function with useCallback
  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/api/conversation/topics`);
      const data = await response.json();
      setAvailableTopics(data.topics || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  }, [backendUrl]);

  // Define startNewConversation function with useCallback
  const startNewConversation = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/api/conversation/start`, {
        method: 'POST'
      });
      const data = await response.json();
      
      const welcomeMessage = {
        speaker: 'ai',
        text: data.message,
        tips: data.tips,
        isWelcome: true,
        timestamp: new Date().toISOString()
      };
      
      setConversation([welcomeMessage]);
      
      // Speak the welcome message
      speakMessage(data.message);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      // Fallback welcome message
      const fallbackMessage = {
        speaker: 'ai',
        text: "Hello! I'm Alex, your AI speaking coach. I'm here to help you improve your communication skills through conversation practice.",
        tips: ["Speak naturally", "Don't rush your words", "Focus on clarity"],
        isWelcome: true,
        timestamp: new Date().toISOString()
      };
      setConversation([fallbackMessage]);
      speakMessage("Hello! I'm Alex, your AI speaking coach.");
    }
  }, [backendUrl]);

  // Initialize conversation
  useEffect(() => {
    startNewConversation();
    fetchTopics();
  }, [startNewConversation, fetchTopics]);

  // Auto-scroll to latest message
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const startListening = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        try {
          // Create blob from audio chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          
          // Send audio to backend for transcription
          const formData = new FormData();
          formData.append('file', audioBlob, 'conversation.wav');
          
          const transcribeResponse = await fetch(`${backendUrl}/api/speech-to-text`, {
            method: 'POST',
            body: formData,
          });
          
          const transcribeData = await transcribeResponse.json();
          const transcribedText = transcribeData.text || "I didn't catch that clearly. Could you please repeat?";
          
          await processUserMessage(transcribedText);
          
        } catch (transcribeError) {
          console.error('Transcription error:', transcribeError);
          // Fallback to mock transcription for development
          const mockText = "I'm practicing my speaking skills with my AI coach.";
          await processUserMessage(mockText);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsListening(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access for conversation mode.');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processUserMessage = async (text) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    // Add user message to conversation
    const userMessage = {
      speaker: 'user',
      text: text,
      timestamp: new Date().toISOString()
    };
    
    setConversation(prev => [...prev, userMessage]);
    
    try {
      // Send to backend for AI response
      const response = await fetch(`${backendUrl}/api/conversation/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: conversation
        })
      });
      
      const aiResponse = await response.json();
      
      // Add AI response to conversation
      const aiMessage = {
        speaker: 'ai',
        text: aiResponse.text || "I appreciate you sharing that! Let's continue working on your speaking skills.",
        tips: aiResponse.coaching_tips || ["Keep practicing", "Focus on your pacing"],
        quickAnalysis: aiResponse.quick_analysis || {
          confidence_score: 7,
          clarity_score: 6,
          pace: "medium",
          suggestion: "Try to vary your pace for better engagement"
        },
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, aiMessage]);
      
      // Speak the AI response
      speakMessage(aiMessage.text);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Fallback AI response
      const fallbackMessage = {
        speaker: 'ai',
        text: "Thanks for sharing! I'm here to help you improve your speaking skills. What would you like to practice next?",
        tips: ["Speak clearly", "Project your voice"],
        quickAnalysis: {
          confidence_score: 6,
          clarity_score: 7,
          pace: "normal",
          suggestion: "Great start! Keep practicing regularly."
        },
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, fallbackMessage]);
      speakMessage(fallbackMessage.text);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a good coaching voice
      const coachVoice = voices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Natural') ||
        v.name.includes('Samantha') ||
        v.lang.includes('en-US')
      );
      
      if (coachVoice) {
        utterance.voice = coachVoice;
        utterance.rate = 0.9; // Slightly slower for coaching
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
      }
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Small delay to ensure previous speech is cancelled
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  // FIXED: Changed function name from useTopic to selectTopic
  const selectTopic = (topic) => {
    setCurrentTopic(topic);
    
    const topicMessage = {
      speaker: 'ai',
      text: `Great choice! Let's practice ${topic.name.toLowerCase()}. ${topic.prompt}`,
      isTopic: true,
      timestamp: new Date().toISOString()
    };
    
    setConversation(prev => [...prev, topicMessage]);
    speakMessage(`Great choice! Let's practice ${topic.name.toLowerCase()}. ${topic.prompt}`);
  };

  const sendTextMessage = () => {
    const text = prompt("Enter your message (for testing):");
    if (text) {
      processUserMessage(text);
    }
  };

  const restartConversation = () => {
    startNewConversation();
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%' }}>
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
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
            <RecordVoiceOverIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              🗣️ AI Speaking Coach
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Practice speaking naturally with your AI coach Alex
            </Typography>
          </Box>
        </Box>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={restartConversation}
          sx={{ color: 'white', borderColor: 'white' }}
        >
          Restart
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3, height: 'calc(100% - 200px)', overflow: 'auto' }}>
        {/* Conversation Tips */}
        {showTips && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight={600}>
                <TipsAndUpdatesIcon sx={{ mr: 1, fontSize: '1rem' }} />
                How to use: Press & hold to speak, release when done
              </Typography>
              <IconButton size="small" onClick={() => setShowTips(false)}>
                <Typography variant="caption">×</Typography>
              </IconButton>
            </Box>
          </Paper>
        )}

        {/* Conversation Messages */}
        <Box sx={{ mb: 4 }}>
          {conversation.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PsychologyIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Starting your conversation...
              </Typography>
            </Box>
          ) : (
            conversation.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.speaker === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Card
                  sx={{
                    maxWidth: '80%',
                    bgcolor: msg.speaker === 'user' ? 'primary.main' : 'grey.100',
                    color: msg.speaker === 'user' ? 'white' : 'text.primary',
                    borderRadius: 3,
                    borderTopLeftRadius: msg.speaker === 'ai' ? 4 : 20,
                    borderTopRightRadius: msg.speaker === 'user' ? 4 : 20
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24, 
                        mr: 1,
                        bgcolor: msg.speaker === 'user' ? 'white' : 'primary.main',
                        color: msg.speaker === 'user' ? 'primary.main' : 'white'
                      }}>
                        {msg.speaker === 'user' ? 'Y' : 'A'}
                      </Avatar>
                      <Typography variant="caption" fontWeight={600}>
                        {msg.speaker === 'user' ? 'You' : 'Coach Alex'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1">
                      {msg.text}
                    </Typography>
                    
                    {msg.tips && msg.speaker === 'ai' && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {msg.tips.map((tip, i) => (
                          <Chip
                            key={i}
                            label={tip}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    )}
                    
                    {msg.quickAnalysis && (
                      <Paper sx={{ mt: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight={600}>
                          <AutoAwesomeIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                          Quick Tip: {msg.quickAnalysis.suggestion || "Great effort! Keep practicing."}
                        </Typography>
                        {msg.quickAnalysis.confidence_score && (
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption">
                              Confidence: {msg.quickAnalysis.confidence_score}/10
                            </Typography>
                            <Typography variant="caption">
                              Clarity: {msg.quickAnalysis.clarity_score}/10
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
          
          {isProcessing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Card sx={{ bgcolor: 'grey.100', borderRadius: 3 }}>
                <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">Coach Alex is thinking...</Typography>
                  <LinearProgress sx={{ width: 100, ml: 2 }} />
                </CardContent>
              </Card>
            </Box>
          )}
          
          <div ref={conversationEndRef} />
        </Box>

        {/* Conversation Topics */}
        {availableTopics.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              💡 Try a practice topic:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {availableTopics.map((topic) => (
                <Chip
                  key={topic.id}
                  label={topic.name}
                  // FIXED: Changed from useTopic to selectTopic
                  onClick={() => selectTopic(topic)}
                  variant={currentTopic?.id === topic.id ? "filled" : "outlined"}
                  color="primary"
                  size="small"
                  sx={{ 
                    mb: 0.5,
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Controls */}
      <Box sx={{ 
        p: 3, 
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2
      }}>
        {/* Microphone Button */}
        <Tooltip title={isListening ? "Release to send" : "Press & hold to speak"}>
          <Fab
            color={isListening ? "error" : "primary"}
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            disabled={isProcessing || isSpeaking}
            sx={{ 
              width: 64, 
              height: 64,
              boxShadow: 3
            }}
          >
            {isListening ? <StopIcon /> : <MicIcon />}
          </Fab>
        </Tooltip>
        
        {/* Status Indicators */}
        <Box sx={{ ml: 2, minWidth: 150 }}>
          {isListening && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 80 }}>
                <LinearProgress color="error" />
              </Box>
              <Typography variant="caption" color="error">
                Listening...
              </Typography>
            </Box>
          )}
          
          {isSpeaking && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VolumeUpIcon color="primary" fontSize="small" />
              <Typography variant="caption" color="primary">
                Coach is speaking...
              </Typography>
            </Box>
          )}
          
          {isProcessing && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon color="primary" fontSize="small" />
              <Typography variant="caption" color="text.secondary">
                Processing...
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Text Input Button (for development/testing) */}
        <Button 
          variant="outlined" 
          size="small"
          onClick={sendTextMessage}
          sx={{ ml: 'auto' }}
          disabled={isProcessing}
        >
          Text Input (Test)
        </Button>
      </Box>
    </Paper>
  );
};

export default ConversationCoach;