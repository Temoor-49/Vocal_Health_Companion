# backend/config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Google Cloud - Try API key first, then service account
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "vocal-health-companion")
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    # Gemini
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # ElevenLabs
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
    
    # Firebase
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "vocal-health-companion")
    
    # App
    PORT = int(os.getenv("PORT", 8000))
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Check which auth method is available
    @property
    def google_auth_method(self):
        if self.GOOGLE_API_KEY:
            return "api_key"
        elif self.GOOGLE_APPLICATION_CREDENTIALS:
            return "service_account"
        else:
            return "none"
    
    def validate(self):
        missing = []
        if not self.ELEVENLABS_API_KEY:
            missing.append("ELEVENLABS_API_KEY")
        if not self.GOOGLE_API_KEY and not self.GOOGLE_APPLICATION_CREDENTIALS:
            missing.append("GOOGLE_API_KEY or GOOGLE_APPLICATION_CREDENTIALS")
        
        if missing:
            print(f"⚠️  Missing: {', '.join(missing)}")
            print("Will use mock data for missing services")
        return True

settings = Settings()