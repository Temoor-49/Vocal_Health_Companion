# backend/services/comparison_service.py
from data.professional_speeches import get_all_speeches, get_speech_by_id
from services.gemini_service import gemini_service
import json

class ComparisonService:
    def __init__(self):
        self.professional_speeches = get_all_speeches()
    
    async def compare_with_professional(self, user_speech: str, professional_id: str = None):
        """
        Compare user's speech with a professional speaker
        """
        try:
            # Get professional speech
            if professional_id:
                professional = get_speech_by_id(professional_id)
            else:
                # Pick the most relevant professional speech
                professional = self._find_most_relevant_speech(user_speech)
            
            if not professional:
                return self._create_mock_comparison(user_speech)
            
            # Analyze user's speech with Gemini
            user_analysis = await gemini_service.analyze_speech(user_speech)
            
            # Get professional metrics
            professional_metrics = professional["metrics"]
            
            # Generate detailed comparison using Gemini
            comparison_text = await self._generate_comparison_analysis(
                user_speech, 
                user_analysis, 
                professional["text"], 
                professional_metrics,
                professional["speaker"]
            )
            
            # Calculate similarity scores
            similarity_scores = self._calculate_similarity_scores(
                user_analysis, 
                professional_metrics
            )
            
            return {
                "success": True,
                "user_analysis": user_analysis,
                "professional_speech": {
                    "id": professional["id"],
                    "title": professional["title"],
                    "speaker": professional["speaker"],
                    "category": professional["category"],
                    "sample_text": professional["text"][:200] + "...",
                    "metrics": professional_metrics
                },
                "comparison": comparison_text,
                "similarity_scores": similarity_scores,
                "improvement_areas": self._identify_improvement_areas(
                    user_analysis, 
                    professional_metrics
                ),
                "professional_tips": self._get_professional_tips(professional["speaker"])
            }
            
        except Exception as e:
            print(f"❌ Comparison error: {e}")
            return self._create_mock_comparison(user_speech)
    
    def _find_most_relevant_speech(self, user_speech: str):
        """Find the most relevant professional speech based on content"""
        # Simple keyword matching (in production, use AI)
        user_text_lower = user_speech.lower()
        
        for speech in self.professional_speeches:
            if any(tag in user_text_lower for tag in speech["tags"]):
                return speech
        
        # Default to first speech
        return self.professional_speeches[0] if self.professional_speeches else None
    
    async def _generate_comparison_analysis(self, user_text, user_analysis, pro_text, pro_metrics, pro_speaker):
        """Use Gemini to generate insightful comparison"""
        try:
            prompt = f"""
            Compare these two speeches and provide professional coaching insights:
            
            USER'S SPEECH:
            "{user_text}"
            
            User's Metrics:
            - Clarity: {user_analysis.get('clarity_score', 0)}/10
            - Confidence: {user_analysis.get('confidence_score', 0)}/10
            - Filler words: {user_analysis.get('filler_words_count', 0)}
            - Pace: {user_analysis.get('pace', 'unknown')}
            
            PROFESSIONAL SPEAKER ({pro_speaker}):
            Sample: "{pro_text[:150]}..."
            
            Professional's Typical Metrics:
            - Clarity: {pro_metrics.get('clarity_score', 0)}/10
            - Confidence: {pro_metrics.get('confidence_score', 0)}/10
            - Pace: {pro_metrics.get('pace', 'unknown')}
            - Style: {pro_metrics.get('sentiment', 'neutral')}
            
            Provide a comparison in this JSON format:
            {{
                "summary": "brief comparison summary",
                "strengths": ["what user does well", "another strength"],
                "areas_to_improve": ["area 1", "area 2", "area 3"],
                "specific_advice": "specific advice to sound more like {pro_speaker}"
            }}
            
            Be constructive, professional, and specific.
            """
            
            response = await gemini_service.model.generate_content_async(prompt)
            return json.loads(response.text) if response else self._default_comparison()
            
        except Exception as e:
            print(f"Gemini comparison error: {e}")
            return self._default_comparison()
    
    def _calculate_similarity_scores(self, user_analysis, pro_metrics):
        """Calculate similarity scores between user and professional"""
        return {
            "clarity_similarity": round(
                (user_analysis.get("clarity_score", 0) / pro_metrics.get("clarity_score", 10)) * 100, 
                1
            ),
            "confidence_similarity": round(
                (user_analysis.get("confidence_score", 0) / pro_metrics.get("confidence_score", 10)) * 100, 
                1
            ),
            "overall_similarity": round(
                (
                    (user_analysis.get("clarity_score", 0) / pro_metrics.get("clarity_score", 10)) * 0.4 +
                    (user_analysis.get("confidence_score", 0) / pro_metrics.get("confidence_score", 10)) * 0.4 +
                    (1 - min(user_analysis.get("filler_words_count", 5) / 10, 1)) * 0.2
                ) * 100,
                1
            )
        }
    
    def _identify_improvement_areas(self, user_analysis, pro_metrics):
        """Identify key areas for improvement"""
        areas = []
        
        if user_analysis.get("clarity_score", 0) < pro_metrics.get("clarity_score", 8) - 2:
            areas.append("Clarity & articulation")
        
        if user_analysis.get("confidence_score", 0) < pro_metrics.get("confidence_score", 8) - 2:
            areas.append("Confidence & conviction")
        
        if user_analysis.get("filler_words_count", 0) > 3:
            areas.append("Reducing filler words")
        
        if user_analysis.get("pace", "medium") == "fast" and pro_metrics.get("pace") == "slow":
            areas.append("Pacing & pauses")
        
        return areas[:3]
    
    def _get_professional_tips(self, speaker_name):
        """Get tips based on the professional speaker's style"""
        tips = {
            "Steve Jobs": [
                "Use dramatic pauses for emphasis",
                "Tell personal stories to connect",
                "Repeat key phrases for impact"
            ],
            "Simon Sinek": [
                "Start with 'Why' before 'What'",
                "Use simple, powerful visuals",
                "Speak slowly to emphasize points"
            ],
            "Martin Luther King Jr.": [
                "Use rhythmic repetition",
                "Build to emotional climax",
                "Speak with conviction and passion"
            ],
            "Brené Brown": [
                "Be vulnerable and authentic",
                "Use personal anecdotes",
                "Maintain conversational tone"
            ]
        }
        
        return tips.get(speaker_name, [
            "Practice deliberate pauses",
            "Record and review yourself",
            "Focus on one improvement at a time"
        ])
    
    def _default_comparison(self):
        return {
            "summary": "Comparison analysis",
            "strengths": ["Good content structure"],
            "areas_to_improve": ["Practice pacing", "Reduce filler words"],
            "specific_advice": "Keep practicing regularly"
        }
    
    def _create_mock_comparison(self, user_speech):
        """Create mock comparison for demo"""
        return {
            "success": True,
            "user_analysis": {
                "clarity_score": 7.5,
                "confidence_score": 6.8,
                "filler_words_count": 4,
                "pace": "medium"
            },
            "professional_speech": {
                "id": "ted_001",
                "title": "Steve Jobs - Stanford Commencement",
                "speaker": "Steve Jobs",
                "category": "Motivational",
                "sample_text": "Your time is limited, so don't waste it living someone else's life...",
                "metrics": {
                    "clarity_score": 9.5,
                    "confidence_score": 9.8,
                    "pace": "medium",
                    "filler_words_per_minute": 0.5
                }
            },
            "comparison": {
                "summary": "Your speech shows good potential with room to grow",
                "strengths": ["Clear message", "Good energy"],
                "areas_to_improve": ["More dramatic pauses", "Stronger opening"],
                "specific_advice": "Try pausing before key points like Steve Jobs does"
            },
            "similarity_scores": {
                "clarity_similarity": 78.9,
                "confidence_similarity": 69.4,
                "overall_similarity": 74.2
            },
            "improvement_areas": ["Pacing", "Confidence"],
            "professional_tips": [
                "Use dramatic pauses for emphasis",
                "Tell personal stories to connect",
                "Repeat key phrases for impact"
            ],
            "is_mock": True
        }

# Create singleton instance
comparison_service = ComparisonService()