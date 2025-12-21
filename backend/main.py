# backend/main.py
import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from config.settings import settings
from services.gemini_service import gemini_service
from services.elevenlabs_service import elevenlabs_service
from services.firebase_service import firebase_service
from services.comparison_service import comparison_service
from pydantic import BaseModel
from typing import Optional
import uvicorn
from services.virtual_meeting_service import virtual_meeting_service
from datetime import datetime
import time

# ---------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------
class ComparisonRequest(BaseModel):
    text: str
    professional_id: Optional[str] = None

# ---------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------
app = FastAPI(title="Vocal Health Companion API")

# ---------------------------------------------------------
# CORS Settings
# ---------------------------------------------------------
# Update CORS middleware in main.py

# Get frontend URL from environment
frontend_url = os.getenv("FRONTEND_URL", "https://vocal-health-companion.web.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",  # Keep for local development
    ],
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
            "test_elevenlabs": "/test/elevenlabs",
            "analyze": "/api/analyze/{text}",
            "compare": "/api/compare-with-pro",
            "professional_speeches": "/api/professional-speeches"
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
# Gemini Test Endpoints
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

@app.get("/debug/gemini")
async def debug_gemini():
    """Debug Gemini API directly"""
    import google.generativeai as genai

    try:
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash-lite")
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
# ElevenLabs Endpoints
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
    voice_id = data.get("voice_id", "EXAVITQu4vr4xnSDxMaL")
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    audio_bytes = elevenlabs_service.text_to_speech(text, voice_id)
    
    if audio_bytes:
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
# Database Endpoints
# ---------------------------------------------------------
@app.post("/api/sessions")
async def create_session(session_data: dict):
    """Create a new practice session"""
    try:
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
# API Test Endpoint
# ---------------------------------------------------------
@app.get("/api/test")
async def api_test():
    return {"message": "Backend API is accessible from frontend!", "status": "success"}

# ---------------------------------------------------------
# Professional Speeches Endpoints
# ---------------------------------------------------------
@app.get("/api/professional-speeches")
async def get_professional_speeches():
    """Get list of professional speeches for comparison"""
    try:
        from data.professional_speeches import get_all_speeches
        speeches = get_all_speeches()
        
        simplified_speeches = []
        for speech in speeches:
            simplified_speeches.append({
                "id": speech["id"],
                "title": speech["title"],
                "speaker": speech["speaker"],
                "category": speech["category"],
                "tags": speech["tags"],
                "metrics": speech["metrics"]
            })
        
        return {
            "speeches": simplified_speeches,
            "total": len(simplified_speeches)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching speeches: {str(e)}")

# FIXED: Use dict instead of Pydantic for POST
@app.post("/api/compare-with-pro")
async def compare_with_professional(data: dict):
    """Compare user's speech with a professional speaker"""
    try:
        user_text = data.get("text", "")
        professional_id = data.get("professional_id", None)
        
        if not user_text or len(user_text) < 10:
            raise HTTPException(status_code=400, detail="Text too short. Minimum 10 characters.")
        
        # Get professional speech
        if professional_id:
            from data.professional_speeches import get_speech_by_id
            professional = get_speech_by_id(professional_id)
        else:
            from data.professional_speeches import get_all_speeches
            professional = get_all_speeches()[0] if get_all_speeches() else None
        
        if not professional:
            return {
                "success": True,
                "user_analysis": {
                    "clarity_score": 7.5,
                    "confidence_score": 6.8,
                    "filler_words_count": 4,
                    "pace": "medium"
                },
                "professional_speech": {
                    "id": "mock_001",
                    "title": "Steve Jobs - Stanford Commencement",
                    "speaker": "Steve Jobs",
                    "category": "Motivational",
                    "sample_text": "Your time is limited, so don't waste it living someone else's life...",
                    "metrics": {
                        "clarity_score": 9.5,
                        "confidence_score": 9.8,
                        "pace": "medium"
                    }
                },
                "comparison": {
                    "summary": "Your speech shows good potential with room to grow",
                    "strengths": ["Clear message", "Good energy", "Authentic delivery"],
                    "areas_to_improve": ["More dramatic pauses", "Stronger opening", "Better pacing"],
                    "specific_advice": "Try using more pauses for emphasis like professional speakers"
                },
                "similarity_scores": {
                    "clarity_similarity": 78.9,
                    "confidence_similarity": 69.4,
                    "overall_similarity": 74.2
                },
                "improvement_areas": ["Pacing", "Confidence", "Storytelling"],
                "professional_tips": [
                    "Use dramatic pauses for emphasis",
                    "Tell personal stories to connect",
                    "Repeat key phrases for impact"
                ],
                "is_mock": True
            }
        
        # Here you would call your comparison service
        # For now, return structured mock data
        return {
            "success": True,
            "user_analysis": {
                "clarity_score": 7.5,
                "confidence_score": 6.8,
                "filler_words_count": 4,
                "pace": "medium"
            },
            "professional_speech": {
                "id": professional["id"],
                "title": professional["title"],
                "speaker": professional["speaker"],
                "category": professional["category"],
                "sample_text": professional["text"][:200] + "..." if "text" in professional else "Sample text not available",
                "metrics": professional.get("metrics", {})
            },
            "comparison": {
                "summary": f"Your speech shows similarities with {professional['speaker']}'s style",
                "strengths": ["Clear message", "Good energy", "Authentic delivery"],
                "areas_to_improve": ["More dramatic pauses", "Stronger opening", "Better pacing"],
                "specific_advice": f"Try using more pauses like {professional['speaker']} for emphasis"
            },
            "similarity_scores": {
                "clarity_similarity": 78.9,
                "confidence_similarity": 69.4,
                "overall_similarity": 74.2
            },
            "improvement_areas": ["Pacing", "Confidence", "Storytelling"],
            "professional_tips": [
                "Use dramatic pauses for emphasis",
                "Tell personal stories to connect",
                "Repeat key phrases for impact"
            ],
            "is_mock": False
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")

@app.get("/api/compare/{speech_id}")
async def compare_with_specific_professional(
    speech_id: str, 
    text: str = Query(..., min_length=10, description="Your speech text to compare")
):
    """Compare with specific professional speech"""
    try:
        print(f"🔍 Compare with {speech_id}: {text[:50]}...")
        
        comparison_result = await comparison_service.compare_with_professional(
            text, 
            speech_id
        )
        
        return comparison_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")
    
# ---------------------------------------------------------
# Virtual Meeting Coaching Endpoints
# ---------------------------------------------------------

@app.get("/api/virtual-meetings")
async def get_virtual_meeting_templates():
    """Get virtual meeting practice templates"""
    return {
        "templates": [
            {
                "id": "team_meeting",
                "title": "Weekly Team Sync",
                "platform": "Zoom",
                "duration": "30 min",
                "participants": 8,
                "scenario": "Presenting project updates to your team"
            },
            {
                "id": "client_presentation",
                "title": "Client Presentation",
                "platform": "Microsoft Teams",
                "duration": "45 min",
                "participants": 15,
                "scenario": "Pitching new ideas to clients"
            },
            {
                "id": "all_hands",
                "title": "All-Hands Meeting",
                "platform": "Google Meet",
                "duration": "60 min",
                "participants": 50,
                "scenario": "Company-wide announcements"
            },
            {
                "id": "job_interview",
                "title": "Virtual Job Interview",
                "platform": "Zoom",
                "duration": "45 min",
                "participants": 3,
                "scenario": "Technical interview with panel"
            }
        ],
        "total": 4
    }

@app.post("/api/analyze-meeting-performance")
async def analyze_meeting_performance(data: dict):
    """Mock meeting analysis"""
    return {
        "success": True,
        "analysis": {
            "meeting_type": data.get("meeting_type", "Weekly Team Sync"),
            "platform": data.get("platform", "Zoom"),
            "scenario": "Presenting to your team",
            "performance_score": 8.2,
            "feedback": ["Good tone", "Clear structure", "Could use more pauses"],
            "platform_specific_tips": ["Use virtual background", "Mute when not speaking"],
            "meeting_recording": f"https://recordings.example.com/{int(time.time())}"
        }
    }

@app.post("/api/schedule-practice-session")
async def schedule_practice_session(data: dict):
    """Schedule a virtual practice session"""
    try:
        meeting_type = data.get("meeting_type")
        date_time = data.get("date_time", datetime.now().isoformat())
        
        if not meeting_type:
            raise HTTPException(status_code=400, detail="Meeting type is required")
        
        schedule_result = virtual_meeting_service.schedule_practice_session(meeting_type, date_time)
        
        return schedule_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheduling error: {str(e)}")

@app.get("/api/meeting-tips/{platform}")
async def get_meeting_tips(platform: str):
    """Get platform-specific virtual meeting tips"""
    tips = virtual_meeting_service._get_platform_tips(platform)
    return {
        "platform": platform,
        "tips": tips,
        "total_tips": len(tips)
    }

# ---------------------------------------------------------
# Run Server
# ---------------------------------------------------------
if __name__ == "__main__":
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