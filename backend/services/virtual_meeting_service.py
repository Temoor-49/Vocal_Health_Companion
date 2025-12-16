# backend/services/virtual_meeting_service.py
from datetime import datetime
import random

class VirtualMeetingService:
    def __init__(self):
        self.meeting_templates = [
            {
                "id": "team_meeting",
                "title": "Weekly Team Sync",
                "platform": "Zoom",
                "duration": "30 min",
                "participants": 8,
                "scenario": "Presenting project updates to your team",
                "prompts": [
                    "Good morning team, let's start with updates...",
                    "My project is on track, this week we completed...",
                    "The main challenge we're facing is...",
                    "For next week, we'll focus on..."
                ]
            },
            {
                "id": "client_presentation",
                "title": "Client Quarterly Review",
                "platform": "Teams",
                "duration": "45 min",
                "participants": 12,
                "scenario": "Presenting quarterly results to important clients",
                "prompts": [
                    "Thank you for joining today's review...",
                    "This quarter, we achieved 120% of our targets...",
                    "Our key metrics show improvement in...",
                    "Looking ahead to next quarter, we plan to..."
                ]
            },
            {
                "id": "job_interview",
                "title": "Virtual Job Interview",
                "platform": "Zoom",
                "duration": "60 min",
                "participants": 3,
                "scenario": "Final round interview with company executives",
                "prompts": [
                    "Thank you for this opportunity...",
                    "In my previous role, I successfully...",
                    "What excites me about this position is...",
                    "My approach to challenges is..."
                ]
            },
            {
                "id": "conference_talk",
                "title": "Virtual Conference Presentation",
                "platform": "Both",
                "duration": "20 min",
                "participants": 50,
                "scenario": "Presenting at an industry conference",
                "prompts": [
                    "Hello everyone, thank you for joining...",
                    "Today I'll be discussing an important trend...",
                    "Let me share a case study that illustrates...",
                    "In conclusion, I want to leave you with..."
                ]
            }
        ]
    
    def get_meeting_templates(self):
        """Get all virtual meeting templates"""
        return self.meeting_templates
    
    def analyze_meeting_performance(self, speech_text, meeting_type="team_meeting"):
        """Analyze how well speech would perform in a virtual meeting"""
        # Mock analysis - in real app, use AI
        template = next((m for m in self.meeting_templates if m["id"] == meeting_type), None)
        
        if not template:
            template = self.meeting_templates[0]
        
        score = random.uniform(6.5, 9.5)  # Random score for demo
        
        return {
            "meeting_type": template["title"],
            "platform": template["platform"],
            "scenario": template["scenario"],
            "performance_score": round(score, 1),
            "feedback": [
                f"Your tone is appropriate for a {template['platform']} meeting",
                f"Good structure for {template['scenario'].lower()}",
                "Consider using more visual language for virtual settings",
                "Practice maintaining eye contact with the camera"
            ],
            "platform_specific_tips": self._get_platform_tips(template["platform"]),
            "meeting_recording": self._generate_mock_recording_url()
        }
    
    def _get_platform_tips(self, platform):
        """Get platform-specific speaking tips"""
        tips = {
            "Zoom": [
                "Use Zoom's 'pin video' to focus on key participants",
                "Enable 'touch up my appearance' for better video quality",
                "Use virtual background to minimize distractions",
                "Mute when not speaking to avoid background noise"
            ],
            "Teams": [
                "Use 'Together Mode' for more engaging meetings",
                "Enable live captions for accessibility",
                "Use 'Raise Hand' feature for structured discussions",
                "Share specific windows instead of entire screen"
            ],
            "Both": [
                "Look at the camera, not your own video",
                "Use good lighting - face a window or use a lamp",
                "Position camera at eye level",
                "Use a headset for better audio quality"
            ]
        }
        return tips.get(platform, tips["Both"])
    
    def _generate_mock_recording_url(self):
        """Generate a mock recording URL for demo"""
        return f"https://meeting-recordings.example.com/recording-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    def schedule_practice_session(self, meeting_type, date_time):
        """Schedule a practice session (mock)"""
        return {
            "success": True,
            "meeting_id": f"practice-{random.randint(10000, 99999)}",
            "meeting_type": meeting_type,
            "scheduled_time": date_time,
            "join_url": f"https://zoom.us/j/{random.randint(1000000000, 9999999999)}",
            "calendar_event": "Practice session added to your calendar",
            "reminder": "You'll receive a reminder 15 minutes before"
        }

# Create singleton instance
virtual_meeting_service = VirtualMeetingService()