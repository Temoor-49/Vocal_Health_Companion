# backend/services/practice_stt_service.py
import random

class PracticeSTTService:
    """Speech-to-text service SPECIFIC for practice sessions"""
    
    def transcribe_practice_speech(self, audio_bytes: bytes) -> str:
        """
        Transcribe actual recorded speech for practice analysis
        Returns realistic practice phrases
        """
        # For demo/hackathon: Return varied practice speech samples
        practice_samples = [
            "Hello everyone, thank you for joining me today. I'll be discussing the importance of effective communication in the workplace.",
            "Public speaking is a skill that can be developed with practice and persistence. It requires confidence and clear articulation.",
            "The key to a good presentation is to start with a strong opening, maintain eye contact, and speak at a moderate pace.",
            "In my experience, practicing in front of a mirror helps build confidence and identify areas for improvement in delivery.",
            "Today I want to talk about artificial intelligence and its impact on modern business practices and daily life.",
            "Effective communication involves not just speaking clearly, but also listening actively and responding thoughtfully.",
            "When presenting data, it's important to explain complex concepts in simple terms that everyone can understand.",
            "Practice makes perfect. The more you speak in public, the more comfortable and confident you will become over time."
        ]
        
        # Return a random sample (in real app, this would use actual STT)
        return random.choice(practice_samples)
    
    def analyze_recording_quality(self, audio_bytes: bytes) -> dict:
        """Mock analysis of recording quality"""
        return {
            "duration_seconds": len(audio_bytes) / 16000,  # Mock calculation
            "clarity_indicator": random.uniform(0.7, 0.95),
            "background_noise": random.uniform(0.1, 0.3),
            "volume_level": "good"
        }

# Create singleton instance
practice_stt_service = PracticeSTTService()