# backend/services/conversation_service.py
from services.gemini_service import gemini_service
import json

class ConversationService:
    def __init__(self):
        self.coach_personality = {
            "name": "Alex",
            "style": "encouraging, patient, constructive",
            "expertise": "public speaking and communication",
            "voice_tone": "warm, professional, friendly"
        }
    
    async def get_coaching_response(self, user_message: str, conversation_history: list = None):
        """
        Generate a conversational response as a speaking coach
        """
        try:
            # Build conversation context
            history_text = ""
            if conversation_history and len(conversation_history) > 0:
                for msg in conversation_history[-5:]:  # Last 5 messages
                    speaker = "Student" if msg.get("speaker") == "user" else "Coach"
                    history_text += f"{speaker}: {msg.get('text', '')}\n"
            
            prompt = f"""
            You are {self.coach_personality['name']}, a {self.coach_personality['style']} speaking coach.
            Your expertise is {self.coach_personality['expertise']}.
            Speak with a {self.coach_personality['voice_tone']} tone.
            
            You're having a voice conversation with a student who wants to improve their speaking skills.
            Keep responses natural, conversational, and under 2 sentences.
            Include subtle coaching tips in your responses.
            
            Previous conversation:
            {history_text}
            
            Student: {user_message}
            
            Coach {self.coach_personality['name']}:
            """
            
            response = await gemini_service.model.generate_content_async(prompt)
            
            # Extract coaching tips
            coaching_tips = self._extract_coaching_tips(response.text)
            
            return {
                "text": response.text,
                "coach_name": self.coach_personality["name"],
                "coaching_tips": coaching_tips,
                "requires_response": self._requires_followup(user_message),
                "is_encouraging": True
            }
            
        except Exception as e:
            print(f"Conversation error: {e}")
            return {
                "text": "I'm here to help you practice speaking! What would you like to work on?",
                "coach_name": "Alex",
                "coaching_tips": ["Speak clearly", "Take your time"],
                "requires_response": True,
                "is_encouraging": True
            }
    
    def _extract_coaching_tips(self, response_text: str):
        """Extract coaching tips from response"""
        tips = []
        
        # Simple extraction logic
        if "breathe" in response_text.lower() or "pause" in response_text.lower():
            tips.append("Remember to breathe between sentences")
        if "slow" in response_text.lower():
            tips.append("Try speaking a bit slower")
        if "confident" in response_text.lower():
            tips.append("Speak with confidence in your voice")
        if "practice" in response_text.lower():
            tips.append("Regular practice is key to improvement")
        
        return tips[:2] if tips else ["Keep practicing regularly!"]
    
    def _requires_followup(self, user_message: str):
        """Determine if AI should wait for user response"""
        questions = ["what", "how", "why", "can you", "could you", "would you"]
        return any(q in user_message.lower() for q in questions)
    
    async def analyze_speaking_pattern(self, text: str):
        """Quick analysis of speaking patterns during conversation"""
        prompt = f"""
        Analyze this spoken text for immediate feedback:
        "{text}"
        
        Provide 1 quick tip in JSON format:
        {{
            "quick_tip": "one quick suggestion",
            "strength": "one thing they did well",
            "follow_up_question": "a question to keep conversation going"
        }}
        """
        
        try:
            response = await gemini_service.model.generate_content_async(prompt)
            return json.loads(response.text)
        except:
            return {
                "quick_tip": "Try to vary your vocal tone",
                "strength": "Good clarity in your speech",
                "follow_up_question": "What makes you nervous about public speaking?"
            }

# Create singleton instance
conversation_service = ConversationService()