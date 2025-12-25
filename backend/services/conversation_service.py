# backend/services/conversation_service.py
from services.gemini_service import gemini_service
import json
import random

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
            # Clean the user message
            user_message_lower = user_message.lower().strip()
            
            # Check for specific intents
            if any(greeting in user_message_lower for greeting in ["hi", "hello", "hey", "how are you"]):
                return self._greeting_response()
            
            if any(nervous_word in user_message_lower for nervous_word in ["nervous", "anxious", "scared", "afraid", "fear", "worried", "stage fright"]):
                return self._handle_nervousness(user_message)
            
            if any(filler_word in user_message_lower for filler_word in ["filler", "um", "uh", "like", "you know", "actually", "basically"]):
                return self._handle_filler_words(user_message)
            
            if any(pace_word in user_message_lower for pace_word in ["fast", "slow", "speed", "pace", "rate", "quick", "rushed"]):
                return self._handle_pacing(user_message)
            
            if any(practice_word in user_message_lower for practice_word in ["practice", "exercise", "drill", "train", "rehearse", "prepare"]):
                return self._suggest_practice(user_message)
            
            if any(conf_word in user_message_lower for conf_word in ["confidence", "confident", "bold", "assertive"]):
                return self._handle_confidence(user_message)
            
            if any(clarity_word in user_message_lower for clarity_word in ["clear", "clarity", "understand", "audible", "mumble"]):
                return self._handle_clarity(user_message)
            
            # Default: Use Gemini for intelligent response
            return await self._gemini_general_response(user_message, conversation_history)
            
        except Exception as e:
            print(f"Conversation error: {e}")
            return self._fallback_response()
    
    def _greeting_response(self):
        """Respond to greetings"""
        greetings = [
            "Hello! I'm Alex, your speaking coach. Ready to help you practice!",
            "Hi there! Great to meet you. What speaking skill would you like to work on today?",
            "Hey! I'm doing well, thanks! Excited to help you with your public speaking journey.",
            "Welcome! I'm Alex, your personal speaking coach. Let's work on making you a confident communicator!",
            "Hi! I'm glad you're here. Ready to level up your speaking skills together?"
        ]
        return {
            "text": random.choice(greetings),
            "coach_name": "Alex",
            "coaching_tips": ["Speak clearly", "Maintain eye contact", "Breathe naturally"],
            "requires_response": True,
            "is_encouraging": True
        }
    
    def _handle_nervousness(self, user_message):
        """Handle nervousness-related messages"""
        tips = [
            "That's completely normal! Even experienced speakers get nervous. The key is to channel that energy into enthusiasm.",
            "Let's start with some breathing exercises. Breathe in for 4 counts, hold for 4, out for 4. This calms your nervous system.",
            "Try focusing on one friendly face in the audience, not the whole crowd. It creates a more personal connection.",
            "Practice in front of a mirror first to build confidence, then with friends or family.",
            "Remember: Your audience wants you to succeed! They're on your side."
        ]
        return {
            "text": f"I understand feeling nervous about speaking. {random.choice(tips)} What specifically makes you nervous when speaking?",
            "coach_name": "Alex",
            "coaching_tips": ["Breathe deeply before starting", "Practice small first", "Focus on your message, not yourself"],
            "requires_response": True,
            "is_encouraging": True
        }
    
    def _handle_filler_words(self, user_message):
        """Help with filler words"""
        exercises = [
            "Try the 'pause practice': Whenever you feel an 'um' coming, pause for 2 seconds instead. Silence is powerful!",
            "Record yourself speaking and count the filler words. Awareness is the first step to reduction!",
            "Practice with a friend who signals every time you use a filler word. It's like a game!",
            "Try the 'one breath, one thought' technique: Complete your thought in one breath to avoid fillers."
        ]
        return {
            "text": f"Filler words are very common - everyone uses them! {random.choice(exercises)}",
            "coach_name": "Alex",
            "coaching_tips": ["Pause instead of filler", "Record and review", "Practice slowly"],
            "requires_response": True,
            "is_encouraging": True
        }
    
    def _handle_pacing(self, user_message):
        """Help with speaking pace"""
        tips = [
            "For pacing, try this: read a paragraph aloud while tapping your foot slowly. Match your words to the rhythm.",
            "Try recording yourself and listening back at 1.5x speed. If it still sounds clear, your pace is good!",
            "Place strategic pauses after key points. This gives your audience time to absorb your message.",
            "Use the 'power pause' - a 3-second silence before important statements for emphasis."
        ]
        return {
            "text": f"Finding the right pace is important. {random.choice(tips)}",
            "coach_name": "Alex",
            "coaching_tips": ["Use a metronome app for practice", "Record and listen back", "Pause intentionally"],
            "requires_response": True,
            "is_encouraging": True
        }
    
    def _handle_confidence(self, user_message):
        """Help build confidence"""
        exercises = [
            "Practice power poses before speaking! Stand tall, shoulders back, hands on hips for 2 minutes.",
            "Record positive affirmations about your speaking ability and listen to them daily.",
            "Start with low-stakes speaking situations and gradually increase the challenge.",
            "Focus on serving your audience rather than judging yourself."
        ]
        return {
            "text": f"Building speaking confidence takes practice. {random.choice(exercises)}",
            "coach_name": "Alex",
            "coaching_tips": ["Power pose before speaking", "Positive self-talk", "Start small"],
            "requires_response": True,
            "is_encouraging": True
        }
    
    def _handle_clarity(self, user_message):
        """Help with speech clarity"""
        exercises = [
            "Practice tongue twisters daily! 'Red leather, yellow leather' is a great one.",
            "Over-articulate when practicing - really exaggerate your mouth movements.",
            "Read aloud while holding a pencil between your teeth (removed for actual speaking!).",
            "Record yourself and identify which sounds or words need clearer pronunciation."
        ]
        return {
            "text": f"Clear speech is about precision. {random.choice(exercises)}",
            "coach_name": "Alex",
            "coaching_tips": ["Practice tongue twisters", "Enunciate clearly", "Record and review"],
            "requires_response": True,
            "is_encouraging": True
        }
    
    def _suggest_practice(self, user_message):
        """Suggest specific practice exercises"""
        exercises = [
            "Try the 'mirror practice': Talk to yourself in the mirror for 5 minutes daily about any topic.",
            "How about 'topic randomizer'? I give you a random topic, you speak for 1 minute without preparation.",
            "Let's practice 'slow motion speaking': Say everything at half your normal speed to focus on clarity.",
            "Try the 'one breath' challenge: Complete entire sentences in single breaths to improve breath control."
        ]
        return {
            "text": f"Great initiative wanting to practice! {random.choice(exercises)}",
            "coach_name": "Alex", 
            "coaching_tips": ["Daily practice", "Record yourself", "Get feedback"],
            "requires_response": True,
            "is_encouraging": True
        }
    
    async def _gemini_general_response(self, user_message, history):
        """Use Gemini for general conversation"""
        try:
            # Build conversation context
            history_text = ""
            if history and len(history) > 0:
                # Get last 6 messages (3 exchanges) for context
                recent_history = history[-6:] if len(history) > 6 else history
                for msg in recent_history:
                    speaker = "Student" if msg.get("speaker") == "user" else "Coach Alex"
                    history_text += f"{speaker}: {msg.get('text', '')}\n"
            
            prompt = f"""You are Alex, a friendly, encouraging speaking coach with expertise in public speaking and communication.
            
            Your coaching style:
            - Always positive and constructive
            - Give one actionable tip per response
            - Ask follow-up questions to keep conversation flowing
            - Use metaphors and examples
            - Focus on one improvement at a time
            - Keep responses conversational (1-2 sentences max)
            
            Conversation context:
            {history_text}
            
            Student: {user_message}
            
            Respond as Coach Alex with:
            1. Brief acknowledgment of their statement
            2. One specific, actionable tip or encouragement
            3. A natural follow-up question to continue conversation
            
            Coach Alex:"""
            
            response = await gemini_service.model.generate_content_async(prompt)
            response_text = response.text.strip()
            
            # Extract coaching tips from response
            coaching_tips = self._extract_coaching_tips(response_text)
            
            return {
                "text": response_text,
                "coach_name": "Alex",
                "coaching_tips": coaching_tips,
                "requires_response": True,
                "is_encouraging": True
            }
            
        except Exception as e:
            print(f"Gemini general response error: {e}")
            return self._fallback_response()
    
    def _extract_coaching_tips(self, response_text: str):
        """Extract coaching tips from response"""
        tips = []
        
        # Extract common tips based on keywords
        keywords_to_tips = {
            "breath": ["Remember to breathe deeply", "Practice breathing exercises"],
            "pause": ["Use pauses for emphasis", "Don't rush your pauses"],
            "slow": ["Speak at a measured pace", "Don't rush your words"],
            "fast": ["Consider slowing down slightly", "Pace yourself"],
            "confident": ["Project confidence in your voice", "Stand tall and speak boldly"],
            "clear": ["Enunciate your words clearly", "Focus on articulation"],
            "practice": ["Practice regularly for improvement", "Consistent practice is key"],
            "eye contact": ["Maintain good eye contact", "Connect with your audience visually"],
            "volume": ["Adjust your volume appropriately", "Project your voice"]
        }
        
        response_lower = response_text.lower()
        for keyword, tip_list in keywords_to_tips.items():
            if keyword in response_lower:
                tips.extend(tip_list)
        
        # Ensure we have at least one tip
        if not tips:
            tips = ["Keep practicing regularly", "Record yourself for self-feedback"]
        
        return tips[:3]  # Return up to 3 tips
    
    def _requires_followup(self, user_message: str):
        """Determine if AI should wait for user response"""
        questions = ["what", "how", "why", "can you", "could you", "would you", "should i", "do you", "is there"]
        return any(q in user_message.lower() for q in questions)
    
    def _fallback_response(self):
        """Fallback if everything fails"""
        fallbacks = [
            "I'm here to help you practice speaking! What would you like to work on today?",
            "Great to connect! What speaking challenge are you facing right now?",
            "I'm excited to help you improve your speaking skills. Where should we start?",
            "Let's work together on your speaking goals. What would you like to practice first?"
        ]
        return {
            "text": random.choice(fallbacks),
            "coach_name": "Alex",
            "coaching_tips": ["Speak clearly", "Take your time", "Practice regularly"],
            "requires_response": True,
            "is_encouraging": True
        }
    
    async def analyze_speaking_pattern(self, text: str):
        """Quick analysis of speaking patterns during conversation"""
        try:
            # Count filler words
            filler_words = ["um", "uh", "like", "you know", "so", "actually", "basically", "well", "i mean"]
            words = text.lower().split()
            filler_count = sum(1 for word in words if word in filler_words)
            
            # Analyze sentence structure
            sentence_count = text.count('.') + text.count('!') + text.count('?')
            avg_sentence_length = len(words) / max(sentence_count, 1)
            
            # Use Gemini for more sophisticated analysis
            prompt = f"""Analyze this spoken text for speaking patterns:

            "{text}"

            Provide a brief analysis in JSON format:
            {{
                "quick_tip": "one specific, actionable speaking tip",
                "strength": "one thing the speaker did well",
                "follow_up_question": "a natural question to continue conversation",
                "confidence_score": 1-10,
                "clarity_score": 1-10,
                "pace_analysis": "fast/medium/slow",
                "key_observation": "one specific observation about their speaking"
            }}

            Keep responses concise and encouraging."""
            
            try:
                response = await gemini_service.model.generate_content_async(prompt)
                try:
                    analysis = json.loads(response.text)
                    # Add filler word count
                    analysis["filler_word_count"] = filler_count
                    return analysis
                except json.JSONDecodeError:
                    # If Gemini doesn't return valid JSON, use our simple analysis
                    pass
            except:
                pass  # Fall through to simple analysis
            
            # Simple analysis based on text characteristics
            if len(words) < 5:
                return {
                    "quick_tip": "Try to speak in complete sentences with more details",
                    "strength": "You're getting started - that's the most important step!",
                    "follow_up_question": "What topic would you feel most comfortable speaking about?",
                    "confidence_score": 5,
                    "clarity_score": 6,
                    "pace_analysis": "normal",
                    "key_observation": "Brief response - consider expanding your thoughts",
                    "filler_word_count": filler_count
                }
            elif filler_count > 3:
                return {
                    "quick_tip": f"I noticed {filler_count} filler words. Try replacing them with brief pauses.",
                    "strength": "Good content in your message - you have things to say!",
                    "follow_up_question": "How do you feel when you notice yourself using filler words?",
                    "confidence_score": 6,
                    "clarity_score": 7,
                    "pace_analysis": "normal",
                    "key_observation": f"Uses filler words ({filler_count} detected)",
                    "filler_word_count": filler_count
                }
            elif avg_sentence_length > 15:
                return {
                    "quick_tip": "Long sentences can be hard to follow. Try breaking them into shorter ones.",
                    "strength": "Good flow and connected thoughts",
                    "follow_up_question": "Do you prefer speaking in longer, complex sentences or shorter ones?",
                    "confidence_score": 7,
                    "clarity_score": 6,
                    "pace_analysis": "fast",
                    "key_observation": "Uses longer sentences - consider varying sentence length",
                    "filler_word_count": filler_count
                }
            elif avg_sentence_length < 8:
                return {
                    "quick_tip": "Try connecting related ideas into slightly longer sentences",
                    "strength": "Clear and concise communication - easy to understand",
                    "follow_up_question": "What's your biggest speaking goal right now?",
                    "confidence_score": 7,
                    "clarity_score": 8,
                    "pace_analysis": "slow",
                    "key_observation": "Uses short, direct sentences",
                    "filler_word_count": filler_count
                }
            else:
                return {
                    "quick_tip": "Good structure! Now try varying your vocal tone for emphasis",
                    "strength": "Well-balanced sentence structure and pacing",
                    "follow_up_question": "What kind of speaking situations do you encounter most often?",
                    "confidence_score": 8,
                    "clarity_score": 8,
                    "pace_analysis": "medium",
                    "key_observation": "Good overall speaking patterns detected",
                    "filler_word_count": filler_count
                }
            
        except Exception as e:
            print(f"Analysis error: {e}")
            return {
                "quick_tip": "Keep practicing regularly for improvement",
                "strength": "You're taking steps to improve - that's great!",
                "follow_up_question": "What would you like to work on with your speaking?",
                "confidence_score": 6,
                "clarity_score": 7,
                "pace_analysis": "medium",
                "key_observation": "Analysis completed successfully",
                "filler_word_count": 0
            }

# Create singleton instance
conversation_service = ConversationService()