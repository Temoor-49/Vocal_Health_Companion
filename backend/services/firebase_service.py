# backend/services/firebase_service.py
import os
import firebase_admin
from firebase_admin import credentials, firestore
from config.settings import settings
import json
from datetime import datetime
import uuid

class FirebaseService:
    def __init__(self):
        self.db = None
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """Initialize Firebase connection"""
        print(f"🔍 Attempting Firebase initialization...")
        print(f"🔍 GOOGLE_APPLICATION_CREDENTIALS: {settings.GOOGLE_APPLICATION_CREDENTIALS}")
        print(f"🔍 File exists: {os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS) if settings.GOOGLE_APPLICATION_CREDENTIALS else 'No path'}")
    

        try:
            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                # Use service account credentials
                cred_path = settings.GOOGLE_APPLICATION_CREDENTIALS
                
                if cred_path:
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                    print("✅ Firebase initialized with service account")
                else:
                    print("⚠️ No service account found for Firebase")
                    return
            else:
                print("✅ Firebase already initialized")
            
            # Initialize Firestore
            self.db = firestore.client()
            print("✅ Firestore client ready")
            
        except Exception as e:
            print(f"❌ Firebase initialization error: {e}")
            self.db = None
    
    def save_session(self, session_data: dict) -> str:
        """Save a practice session to Firestore"""
        if not self.db:
            print("❌ Firestore not initialized")
            return None
        
        try:
            # Generate session ID
            session_id = str(uuid.uuid4())
            
            # Add metadata
            session_data["session_id"] = session_id
            session_data["created_at"] = datetime.now().isoformat()
            session_data["updated_at"] = datetime.now().isoformat()
            
            # Save to Firestore
            doc_ref = self.db.collection("sessions").document(session_id)
            doc_ref.set(session_data)
            
            print(f"✅ Session saved: {session_id}")
            return session_id
            
        except Exception as e:
            print(f"❌ Error saving session: {e}")
            return None
    
    def get_session(self, session_id: str) -> dict:
        """Get a session by ID"""
        if not self.db:
            return None
        
        try:
            doc_ref = self.db.collection("sessions").document(session_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            else:
                return None
        except Exception as e:
            print(f"❌ Error getting session: {e}")
            return None
    
    def get_user_sessions(self, user_id: str, limit: int = 10) -> list:
        """Get recent sessions for a user"""
        if not self.db:
            return []
        
        try:
            # For demo, we'll use mock user ID
            # In real app, you'd have user authentication
            sessions_ref = self.db.collection("sessions")
            
            # Query by user_id if available, else get all
            query = sessions_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit)
            
            sessions = []
            for doc in query.stream():
                session_data = doc.to_dict()
                session_data["id"] = doc.id
                sessions.append(session_data)
            
            return sessions
        except Exception as e:
            print(f"❌ Error getting user sessions: {e}")
            return []
    
    def save_analysis(self, session_id: str, analysis_data: dict) -> bool:
        """Save analysis results for a session"""
        if not self.db:
            return False
        
        try:
            doc_ref = self.db.collection("sessions").document(session_id)
            doc_ref.update({
                "analysis": analysis_data,
                "updated_at": datetime.now().isoformat()
            })
            
            print(f"✅ Analysis saved for session: {session_id}")
            return True
        except Exception as e:
            print(f"❌ Error saving analysis: {e}")
            return False
    
    def get_statistics(self, user_id: str = "demo_user") -> dict:
        """Get user statistics"""
        if not self.db:
            return {
                "total_sessions": 0,
                "average_clarity": 7.5,
                "average_confidence": 7.0,
                "total_words": 0,
                "is_mock": True
            }
        
        try:
            sessions = self.get_user_sessions(user_id, limit=50)
            
            if not sessions:
                return {
                    "total_sessions": 0,
                    "average_clarity": 0,
                    "average_confidence": 0,
                    "total_words": 0
                }
            
            total_sessions = len(sessions)
            total_clarity = 0
            total_confidence = 0
            total_words = 0
            sessions_with_analysis = 0
            
            for session in sessions:
                if "analysis" in session and "feedback" in session["analysis"]:
                    feedback = session["analysis"]["feedback"]
                    total_clarity += feedback.get("clarity_score", 0)
                    total_confidence += feedback.get("confidence_score", 0)
                    total_words += feedback.get("word_count", 0)
                    sessions_with_analysis += 1
            
            return {
                "total_sessions": total_sessions,
                "average_clarity": round(total_clarity / max(sessions_with_analysis, 1), 1),
                "average_confidence": round(total_confidence / max(sessions_with_analysis, 1), 1),
                "total_words": total_words,
                "sessions_analyzed": sessions_with_analysis
            }
            
        except Exception as e:
            print(f"❌ Error getting statistics: {e}")
            return {
                "total_sessions": 0,
                "average_clarity": 7.5,
                "average_confidence": 7.0,
                "total_words": 0,
                "error": str(e)
            }

# Create singleton instance
firebase_service = FirebaseService()