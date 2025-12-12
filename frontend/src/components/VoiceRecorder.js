// frontend/src/components/VoiceRecorder.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';

const VoiceRecorder = ({ backendUrl, onAnalysisComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // ⭐ NEW: Browser TTS availability
  const [browserTTSAvailable, setBrowserTTSAvailable] = useState(false);

  // ⭐ NEW: Check if browser TTS is available on load
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setBrowserTTSAvailable(true);
      window.speechSynthesis.getVoices();
    }
  }, []);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      setError('');
      setSuccess('');
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
      setSuccess('Recording started... Speak now!');
      
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setSuccess('Recording stopped. Click "Transcribe" to process.');
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

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
      
      const response = await fetch(`${backendUrl}/api/speech-to-text`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTranscribedText(data.text);
        setSuccess('Speech transcribed! Now analyze or generate feedback.');
      } else {
        setError('Transcription failed');
      }
    } catch (err) {
      setError('Error during transcription');
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };


  // ⭐ UPDATED analyzeText — now saves session to DB before analyzing
  const analyzeText = async () => {
    if (!transcribedText.trim()) {
      setError('No text to analyze');
      return;
    }

    try {
      // First, save session to database
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
      const sessionId = sessionData.session_id;

      // Then, analyze with AI
      const analysisResponse = await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcribedText }),
      });
      
      const analysisData = await analysisResponse.json();
      
      if (analysisResponse.ok) {
        // Save analysis to session
        await fetch(`${backendUrl}/api/sessions/${sessionId}/analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        });

        setSuccess('Analysis saved to database! Click "Get Voice Feedback" to hear results.');

        setAnalysisResult(analysisData);

        // Pass data to parent
        if (onAnalysisComplete) onAnalysisComplete(analysisData);

      } else {
        setError('Analysis failed');
      }
    } catch (err) {
      setError('Error during analysis');
      console.error('Analysis error:', err);
    }
  };


  const getVoiceFeedback = async () => {
    if (!transcribedText.trim() && !analysisResult) {
      setError('No analysis to convert to speech');
      return;
    }

    if ('speechSynthesis' in window) {
      try {
        const feedbackText = `Great job on your practice speech! 
        Your clarity score is ${analysisResult?.feedback?.clarity_score || 8} out of 10. 
        Your confidence score is ${analysisResult?.feedback?.confidence_score || 7} out of 10.
        You used ${analysisResult?.feedback?.filler_words_count || 0} filler words. 
        ${analysisResult?.feedback?.improvement_suggestions?.[0] || 'Keep practicing regularly!'}`;
        
        const utterance = new SpeechSynthesisUtterance(feedbackText);
        
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const preferredVoice = voices.find(v => 
            v.name.includes('Google') || 
            v.name.includes('Natural') || 
            v.lang.includes('en-US')
          );
          if (preferredVoice) utterance.voice = preferredVoice;
        }
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        window.speechSynthesis.speak(utterance);
        
        setSuccess('Playing AI voice feedback using browser TTS...');
        return;
      } catch (browserError) {
        console.log('Browser TTS failed, trying ElevenLabs...', browserError);
      }
    }

    try {
      const feedbackText = `Great job on your practice speech! I analyzed your delivery and here's my feedback.`;
      
      const response = await fetch(`${backendUrl}/api/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: feedbackText,
          voice_id: "EXAVITQu4vr4xnSDxMaL"
        }),
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        setSuccess('Playing AI voice feedback using ElevenLabs...');
      } else {
        setError('ElevenLabs blocked. Using browser TTS instead.');
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance("Here's your feedback. Check the analysis results tab.");
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      setError('Voice feedback failed. Make sure ElevenLabs API key is valid.');
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🎤 Voice Practice Session
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color={isRecording ? "error" : "primary"}
            startIcon={isRecording ? <StopIcon /> : <MicIcon />}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
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
        
        {transcribedText && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Transcribed Text:
            </Typography>
            <Typography variant="body2">
              {transcribedText}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={analyzeText}
              >
                Analyze with AI
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={getVoiceFeedback}
                startIcon={<PlayArrowIcon />}
              >
                Get Voice Feedback {browserTTSAvailable ? '(Browser TTS)' : '(ElevenLabs)'}
              </Button>
              
              {browserTTSAvailable && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  Using browser's built-in speech synthesis
                </Typography>
              )}
            </Box>

          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>How to use:</strong>
          1. Click "Start Recording" and speak your practice speech
          2. Click "Stop Recording" when finished
          3. Click "Transcribe Speech to Text"
          4. Click "Analyze with AI" for feedback
          5. Click "Get Voice Feedback" to hear AI suggestions
        </Typography>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
