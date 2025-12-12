# backend/services/elevenlabs_service.py
import os
import requests
from config.settings import settings
import io
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
    # UPDATED text_to_speech METHOD
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
                "model_id": "eleven_turbo_v2",  # UPDATED: Use turbo v2 for free tier
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
    # EXISTING speech_to_text (unchanged)
    # ------------------------------------------------------------------
    def speech_to_text(self, audio_bytes: bytes) -> Optional[str]:
        print("⚠️ Using mock STT for demo. Enable real STT for production.")
        return "This is mock transcribed text from audio. For real STT, enable ElevenLabs Speech-to-Text."
    
    # ------------------------------------------------------------------
    # UPDATED get_available_voices METHOD
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
    # test_connection (unchanged)
    # ------------------------------------------------------------------
    def test_connection(self) -> dict:
        voices = self.get_available_voices()
        
        if voices:
            return {
                "status": "connected",
                "voices_count": len(voices),
                "voices": voices[:3],
                "note": "TTS is ready. STT requires beta access."
            }
        else:
            return {
                "status": "error",
                "error": "Could not fetch voices. Check API key.",
                "note": "Make sure your ElevenLabs API key is valid."
            }

# Create singleton instance
elevenlabs_service = ElevenLabsService()
