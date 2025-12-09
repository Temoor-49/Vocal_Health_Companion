# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Vocal Health Companion API")

# Get frontend URL from environment or use default
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Allow frontend to call backend - UPDATED
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],  # Now using the variable
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def read_root():
    return {"message": "Vocal Health Companion API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "backend"}

# Add a test endpoint for our APIs
@app.get("/test/elevenlabs")
async def test_elevenlabs():
    """Test that ElevenLabs is accessible"""
    return {"elevenlabs": "ready", "note": "We'll implement voice tomorrow"}

@app.get("/test/gemini")
async def test_gemini():
    """Test that Gemini is accessible"""
    return {"gemini": "ready", "note": "We'll implement AI tomorrow"}

# NEW: Simple test endpoint that doesn't require auth
@app.get("/api/test")
async def api_test():
    return {"message": "Backend API is accessible from frontend!"}