# backend/main.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from config.settings import settings
from services.gemini_service import gemini_service
from services.elevenlabs_service import elevenlabs_service
from services.firebase_service import firebase_service
import uvicorn

app = FastAPI(title="Vocal Health Companion API")

# ---------------------------------------------------------
# CORS Settings
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # Example: http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Root Endpoint
# ---------------------------------------------------------
@app.get("/")
def read_root():
    return {
        "message": "Vocal Health Companion API is running!",
        "version": "1.0",
        "apis": {
            "health": "/health",
            "test_gemini": "/test/gemini",
            "debug_gemini": "/debug/gemini",
            "analyze": "/api/analyze/{text}",
            "test_elevenlabs": "/test/elevenlabs"
        }
    }

# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "backend",
        "environment": settings.ENVIRONMENT,
        "project": settings.GOOGLE_CLOUD_PROJECT
    }

# ---------------------------------------------------------
# Gemini Simple Test (uses gemini_service)
# ---------------------------------------------------------
@app.get("/test/gemini")
async def test_gemini():
    try:
        result = await gemini_service.simple_test()
        return {
            "gemini": "connected" if "working" in result.lower() else "issues",
            "auth_method": settings.google_auth_method,
            "test_result": result,
            "model": settings.GEMINI_MODEL,
            "has_api_key": bool(settings.GOOGLE_API_KEY),
            "has_service_account": bool(settings.GOOGLE_APPLICATION_CREDENTIALS)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {str(e)}")

# ---------------------------------------------------------
# NEW: 🔍 Raw Gemini Debug Endpoint
# ---------------------------------------------------------
@app.get("/debug/gemini")
async def debug_gemini():
    """
    Debug Gemini API directly using a barebones test.
    This ignores gemini_service and tests the API key + model directly.
    """
    import google.generativeai as genai

    try:
        # Configure API Key
        genai.configure(api_key=settings.GOOGLE_API_KEY)

        # Use simple model for testing
        model = genai.GenerativeModel("gemini-2.5-flash-lite")

        # Make test request
        response = model.generate_content("Say 'Hello World'")

        return {
            "success": True,
            "response": response.text,
            "api_key_length": len(settings.GOOGLE_API_KEY) if settings.GOOGLE_API_KEY else 0,
            "api_key_prefix": settings.GOOGLE_API_KEY[:10] + "..." if settings.GOOGLE_API_KEY else "none",
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "api_key_set": bool(settings.GOOGLE_API_KEY),
        }

# ---------------------------------------------------------
# Analyze Speech Endpoints
# ---------------------------------------------------------
@app.get("/api/analyze/{text}")
async def analyze_text(text: str):
    if len(text) < 10:
        raise HTTPException(status_code=400, detail="Text too short. Minimum 10 characters.")

    feedback = await gemini_service.analyze_speech(text)
    return {
        "text": text,
        "feedback": feedback,
        "analysis_type": "speech_coaching"
    }

@app.post("/api/analyze")
async def analyze_text_post(data: dict):
    text = data.get("text", "")

    if not text or len(text) < 10:
        raise HTTPException(status_code=400, detail="Text too short. Minimum 10 characters.")

    feedback = await gemini_service.analyze_speech(text)
    return {
        "text": text,
        "feedback": feedback,
        "analysis_type": "speech_coaching"
    }

# ---------------------------------------------------------
# Eleven Labs Placeholder (OLD)
# ---------------------------------------------------------
@app.get("/test/elevenlabs")
async def test_elevenlabs():
    """Test ElevenLabs API connection"""
    result = elevenlabs_service.test_connection()  # This uses the real test
    return result

# ---------------------------------------------------------
# ⭐ NEW ElevenLabs Endpoints Added Below
# ---------------------------------------------------------

@app.get("/test/elevenlabs")
async def test_elevenlabs():
    """Test ElevenLabs API connection"""
    result = elevenlabs_service.test_connection()
    return result


@app.post("/api/text-to-speech")
async def text_to_speech(data: dict):
    """Convert text to speech audio"""
    text = data.get("text", "")
    voice_id = data.get("voice_id", "EXAVITQu4vr4xnSDxMaL")  # Default to Sarah
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    # Get audio bytes from ElevenLabs
    audio_bytes = elevenlabs_service.text_to_speech(text, voice_id)
    
    if audio_bytes:
        # Return audio file
        from fastapi.responses import Response
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
    else:
        raise HTTPException(status_code=500, detail="Failed to generate speech")


@app.post("/api/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    """Convert speech audio to text (mock for now)"""
    try:
        audio_bytes = await file.read()
        text = elevenlabs_service.speech_to_text(audio_bytes)
        
        return {
            "text": text,
            "is_mock": True,
            "note": "Using mock STT. Enable real ElevenLabs STT for production."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")


@app.get("/api/voices")
async def get_voices():
    """Get available ElevenLabs voices"""
    voices = elevenlabs_service.get_available_voices()
    return {
        "voices": voices,
        "total": len(voices)
    }

# ---------------------------------------------------------
# backend API endpoints
# ---------------------------------------------------------

@app.post("/api/sessions")
async def create_session(session_data: dict):
    """Create a new practice session"""
    try:
        # Add demo user ID (in real app, use actual auth)
        session_data["user_id"] = "demo_user"
        
        session_id = firebase_service.save_session(session_data)
        
        if session_id:
            return {
                "success": True,
                "session_id": session_id,
                "message": "Session created successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save session")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")

@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """Get a specific session"""
    session = firebase_service.get_session(session_id)
    
    if session:
        return session
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.get("/api/sessions")
async def get_recent_sessions(limit: int = 5):
    """Get recent sessions"""
    sessions = firebase_service.get_user_sessions("demo_user", limit)
    return {
        "sessions": sessions,
        "count": len(sessions)
    }

@app.post("/api/sessions/{session_id}/analysis")
async def save_session_analysis(session_id: str, analysis_data: dict):
    """Save analysis for a session"""
    success = firebase_service.save_analysis(session_id, analysis_data)
    
    if success:
        return {"success": True, "message": "Analysis saved"}
    else:
        raise HTTPException(status_code=500, detail="Failed to save analysis")

@app.get("/api/statistics")
async def get_statistics():
    """Get user statistics"""
    stats = firebase_service.get_statistics("demo_user")
    return stats

# ---------------------------------------------------------
# Simple API Test for Frontend
# ---------------------------------------------------------
@app.get("/api/test")
async def api_test():
    return {"message": "Backend API is accessible from frontend!", "status": "success"}

# ---------------------------------------------------------
# Run Server
# ---------------------------------------------------------
if __name__ == "__main__":

    # Validate .env
    try:
        settings.validate()
        print("✅ All environment variables are set")
    except ValueError as e:
        print(f"⚠️ Warning: {e}")
        print("Continuing with mock data...")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True
    )
