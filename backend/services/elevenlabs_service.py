# backend/services/elevenlabs_service.py
import os
import requests
import random
from config.settings import settings
from typing import Optional

class ElevenLabsService:
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        # Test connection on startup
        if self.api_key:
            print(f"✅ ElevenLabs configured with API key")
        else:
            print("❌ ElevenLabs API key not found in .env file")
    
    # ------------------------------------------------------------------
    # text_to_speech METHOD
    # ------------------------------------------------------------------
    def text_to_speech(self, text: str, voice_id: str = "pNInz6obpgDQGcFmaJgB") -> Optional[bytes]:
        """
        Convert text to speech using ElevenLabs
        Returns audio bytes or None if error
        """
        if not self.api_key:
            print("❌ No ElevenLabs API key")
            return None
        
        try:
            url = f"{self.base_url}/text-to-speech/{voice_id}"
            
            payload = {
                "text": text,
                "model_id": "eleven_turbo_v2",  # Use turbo v2 for free tier
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.5,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
            }
            
            response = requests.post(url, json=payload, headers=self.headers)
            
            if response.status_code == 200:
                print(f"✅ TTS successful: {len(text)} characters")
                return response.content
            else:
                print(f"❌ TTS failed: {response.status_code} - {response.text[:100]}")
                return None
                
        except Exception as e:
            print(f"❌ TTS error: {e}")
            return None

    # ------------------------------------------------------------------
    # UPDATED speech_to_text METHOD
    # ------------------------------------------------------------------
    def speech_to_text(self, audio_bytes: bytes) -> Optional[str]:
        """
        Convert speech audio to text using ElevenLabs
        Note: ElevenLabs STT is in beta and may require different setup
        For now, we'll use an IMPROVED mock version
        """
        # IMPORTANT: ElevenLabs STT requires specific model setup
        # For hackathon demo, we'll return VARIED mock text
        # Uncomment below for real implementation
        
        """
        # Real implementation (requires specific model access):
        try:
            url = f"{self.base_url}/speech-to-text"
            files = {"audio": ("audio.wav", audio_bytes, "audio/wav")}
            headers = {"xi-api-key": self.api_key}
            
            response = requests.post(url, files=files, headers=headers)
            
            if response.status_code == 200:
                return response.json().get("text", "")
            else:
                print(f"STT failed: {response.status_code}")
                return None
        except Exception as e:
            print(f"STT error: {e}")
            return None
        """
        
        # IMPROVED mock implementation for conversation
        # Different conversation starters based on context
        mock_responses = [
            # Greetings
            "Hello Alex, how are you today?",
            "Hi coach, ready to practice speaking",
            "Hey Alex, let's work on my presentation skills",
            
            # Nervousness-related
            "I'm feeling really nervous about my speech tomorrow",
            "Public speaking makes me very anxious",
            "I get scared when everyone looks at me",
            
            # Filler words
            "I use too many filler words like um and uh",
            "My problem is saying 'you know' too much",
            "I need help reducing filler words in my speech",
            
            # Pacing
            "I speak too fast during presentations",
            "People say I talk very quickly when nervous",
            "How can I slow down my speaking pace?",
            
            # General practice
            "Can we practice elevator pitches?",
            "I want to improve my storytelling skills",
            "Help me with my job interview preparation",
            
            # Speech content
            "Today I'd like to talk about climate change initiatives",
            "Our company's quarterly results show a positive trend",
            "The key points of my presentation are threefold",
            
            # Questions to coach
            "How can I sound more confident?",
            "What techniques can I use to engage the audience?",
            "Can you give me feedback on my body language?"
        ]
        
        # Return random realistic text
        selected_text = random.choice(mock_responses)
        print(f"⚠️ Mock STT: Returning '{selected_text}'")
        return selected_text
    
    # ------------------------------------------------------------------
    # get_available_voices METHOD
    # ------------------------------------------------------------------
    def get_available_voices(self) -> list:
        """Get list of available voices"""
        if not self.api_key:
            return []
        
        try:
            url = f"{self.base_url}/voices"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                voices = response.json().get("voices", [])
                simplified_voices = []

                for voice in voices:
                    if len(simplified_voices) < 5:  # limit to first 5
                        simplified_voices.append({
                            "voice_id": voice.get("voice_id"),
                            "name": voice.get("name"),
                            "category": voice.get("category"),
                            "labels": voice.get("labels", {}),
                            "preview_url": voice.get("preview_url"),
                            "description": (
                                voice.get("description")[:50] + "..."
                                if voice.get("description")
                                else "No description"
                            )
                        })
                return simplified_voices
            else:
                print(f"Failed to get voices: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error getting voices: {e}")
            return []

    # ------------------------------------------------------------------
    # test_connection METHOD
    # ------------------------------------------------------------------
    def test_connection(self) -> dict:
        voices = self.get_available_voices()
        
        if voices:
            return {
                "status": "connected",
                "voices_count": len(voices),
                "voices": voices[:3],
                "note": "TTS is ready. STT mock is active for demo."
            }
        else:
            return {
                "status": "error",
                "error": "Could not fetch voices. Check API key.",
                "note": "Make sure your ElevenLabs API key is valid."
            }

# Create singleton instance
elevenlabs_service = ElevenLabsService()