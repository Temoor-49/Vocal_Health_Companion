# backend/data/professional_speeches.py
PROFESSIONAL_SPEECHES = [
    {
        "id": "ted_001",
        "title": "Steve Jobs - Stanford Commencement",
        "speaker": "Steve Jobs",
        "category": "Motivational",
        "text": "Your time is limited, so don't waste it living someone else's life... Stay hungry, stay foolish.",
        "metrics": {
            "clarity_score": 9.5,
            "confidence_score": 9.8,
            "pace": "medium",
            "filler_words_per_minute": 0.5,
            "sentiment": "inspirational",
            "pause_frequency": "optimal"
        },
        "audio_url": "https://example.com/steve-jobs.mp3",
        "tags": ["leadership", "inspiration", "career"]
    },
    {
        "id": "ted_002",
        "title": "How Great Leaders Inspire Action",
        "speaker": "Simon Sinek",
        "category": "Leadership",
        "text": "People don't buy what you do, they buy why you do it...",
        "metrics": {
            "clarity_score": 9.2,
            "confidence_score": 9.3,
            "pace": "slow",
            "filler_words_per_minute": 0.8,
            "sentiment": "educational",
            "pause_frequency": "high"
        },
        "audio_url": "https://example.com/sinek.mp3",
        "tags": ["business", "leadership", "communication"]
    },
    {
        "id": "political_001",
        "title": "I Have a Dream",
        "speaker": "Martin Luther King Jr.",
        "category": "Historic",
        "text": "I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.",
        "metrics": {
            "clarity_score": 9.8,
            "confidence_score": 9.9,
            "pace": "medium",
            "filler_words_per_minute": 0.2,
            "sentiment": "powerful",
            "pause_frequency": "strategic"
        },
        "audio_url": "https://example.com/mlk.mp3",
        "tags": ["historic", "inspiration", "social"]
    },
    {
        "id": "business_001",
        "title": "The Power of Vulnerability",
        "speaker": "Brené Brown",
        "category": "Psychology",
        "text": "Vulnerability is not winning or losing; it's having the courage to show up and be seen when we have no control over the outcome.",
        "metrics": {
            "clarity_score": 9.0,
            "confidence_score": 8.8,
            "pace": "medium",
            "filler_words_per_minute": 1.2,
            "sentiment": "authentic",
            "pause_frequency": "natural"
        },
        "audio_url": "https://example.com/brown.mp3",
        "tags": ["psychology", "authenticity", "human"]
    }
]

def get_speech_by_id(speech_id):
    """Get a professional speech by ID"""
    for speech in PROFESSIONAL_SPEECHES:
        if speech["id"] == speech_id:
            return speech
    return None

def get_all_speeches():
    """Get all professional speeches"""
    return PROFESSIONAL_SPEECHES

def get_speeches_by_category(category):
    """Get speeches by category"""
    return [speech for speech in PROFESSIONAL_SPEECHES if speech["category"] == category]