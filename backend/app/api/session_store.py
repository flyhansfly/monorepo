"""
Session store for managing user sessions and their associated data.
"""
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}
    
    def get_session(self, session_id: str) -> Dict[str, Any]:
        """Get session data by ID."""
        return self._sessions.get(session_id, {})
    
    def set_session(self, session_id: str, data: Dict[str, Any]) -> None:
        """Set session data for a given ID."""
        self._sessions[session_id] = data
        logger.info(f"Session {session_id} updated with data: {data}")
    
    def delete_session(self, session_id: str) -> None:
        """Delete a session by ID."""
        if session_id in self._sessions:
            del self._sessions[session_id]
            logger.info(f"Session {session_id} deleted")

# Create a singleton instance
session_store = SessionStore() 