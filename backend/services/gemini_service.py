# backend/services/gemini_service.py
import google.generativeai as genai
from config.settings import settings
import os
import json
import traceback


class GeminiService:
    def __init__(self):
        self.auth_method = settings.google_auth_method
        self.model_name = settings.GEMINI_MODEL

        print("===================================")
        print("🔧 Initializing Gemini Service")
        print(f"🔧 Auth Method: {self.auth_method}")
        print(f"🔧 Model Name: {self.model_name}")
        print("===================================")

        if self.auth_method == "api_key":
            # Use simple API key auth
            if settings.GOOGLE_API_KEY:
                print("🔑 Configuring Gemini with API key...")
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                try:
                    self.model = genai.GenerativeModel(self.model_name)
                    print(f"✅ Gemini configured with API key, model: {self.model_name}")
                except Exception as e:
                    print(f"❌ Failed to load model: {e}")
                    traceback.print_exc()
                    self.model = None
            else:
                print("❌ API key auth selected but no GOOGLE_API_KEY found.")
                self.model = None

        elif self.auth_method == "service_account":
            print("🔐 Service Account authentication selected...")
            print("⚠️ Full service account support not yet implemented.")

            if settings.GOOGLE_API_KEY:
                print("➡️ Falling back to API key since GOOGLE_API_KEY exists.")
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                try:
                    self.model = genai.GenerativeModel(self.model_name)
                    print(f"✅ Fallback model loaded: {self.model_name}")
                except Exception as e:
                    print(f"❌ Failed to load fallback model: {e}")
                    traceback.print_exc()
                    self.model = None
            else:
                print("❌ No API key available for fallback.")
                self.model = None
        else:
            print("⚠️ No valid auth method configured.")
            self.model = None

        print("===================================")


    async def analyze_speech(self, text: str) -> dict:
        """Analyze speech and return structured AI feedback."""
        print("\n===================================")
        print(f"🔍 Starting speech analysis...")
        print(f"🔍 Input text (first 50 chars): {text[:50]}...")
        print(f"🔍 Auth method: {self.auth_method}")
        print(f"🔍 Model available: {self.model is not None}")
        print("===================================\n")

        if not self.model:
            print("❌ No Gemini model loaded — returning mock feedback.")
            return self._get_mock_feedback(text)

        try:
            print("🤖 Sending prompt to Gemini API...")

            prompt = f"""
            You are a professional speaking coach. Analyze this speech text and provide feedback:

            Speech: "{text}"

            Provide feedback in this JSON format:
            {{
                "clarity_score": 0-10,
                "confidence_score": 0-10,
                "filler_words_count": number,
                "filler_words_list": ["um", "like", ...],
                "pace": "slow/medium/fast",
                "word_count": number,
                "key_feedback": ["feedback point 1", "feedback point 2", "feedback point 3"],
                "improvement_suggestions": ["suggestion 1", "suggestion 2"]
            }}

            Return ONLY valid JSON, no extra text.
            """

            response = await self.model.generate_content_async(prompt)
            response_text = response.text.strip()

            print("📥 Gemini raw response received:")
            print(response_text[:250], "...\n")

            # Clean JSON (remove ```json code blocks)
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]

            try:
                feedback = json.loads(response_text)
                feedback["is_real_ai"] = True
                print("✅ Successfully parsed JSON from Gemini.")
                return feedback

            except json.JSONDecodeError as e:
                print("❌ JSON parsing error:")
                print(str(e))
                print("📄 Response received:")
                print(response_text)
                traceback.print_exc()
                return self._get_mock_feedback(text)

        except Exception as e:
            print("❌ Gemini API call failed:")
            print(str(e))
            traceback.print_exc()
            return self._get_mock_feedback(text)


    def _get_mock_feedback(self, text: str) -> dict:
        """Fallback mock feedback for testing or offline mode."""
        print("⚠️ Using mock feedback (no real AI).")

        words = text.split()
        filler_words = ["um", "uh", "like", "you know", "so", "actually", "basically"]
        found_fillers = [word for word in words if word.lower() in filler_words]

        return {
            "clarity_score": min(9, len(words) // 10 + 5),
            "confidence_score": min(8, len(words) // 15 + 4),
            "filler_words_count": len(found_fillers),
            "filler_words_list": found_fillers[:3],
            "pace": "medium" if len(words) < 100 else "fast",
            "word_count": len(words),
            "key_feedback": [
                "Good content structure",
                "Could use more vocal variety",
                "Strong opening statement"
            ],
            "improvement_suggestions": [
                "Practice pausing for emphasis",
                "Reduce filler words",
                "Use more descriptive language"
            ],
            "is_real_ai": False,
            "note": "Using mock data. Check Gemini API setup."
        }


    async def simple_test(self) -> str:
        """Simple test to verify Gemini API connectivity."""
        print("\n🔍 Running Gemini simple test...")
        print(f"🔍 Model available: {self.model is not None}")

        if not self.model:
            return "⚠️ Gemini not configured. Missing API key?"

        try:
            response = await self.model.generate_content_async(
                "Say exactly: Gemini API is working!"
            )
            print("📥 Test response received:", response.text)
            return response.text

        except Exception as e:
            print("❌ Gemini simple test failed:", str(e))
            traceback.print_exc()
            return f"❌ Gemini test failed: {str(e)}"


# Singleton instance used across the app
gemini_service = GeminiService()
