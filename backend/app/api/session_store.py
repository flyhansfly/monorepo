"""
Session store for managing user sessions and their associated data.
"""
from typing import Dict, Any, Optional
import logging
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.database import get_db
from ..models.database import Session as SessionModel
from sqlalchemy import select

logger = logging.getLogger(__name__)

class SessionStore:
    """
    Class for managing user sessions and their associated data.
    """
    def __init__(self):
        """Initialize the session store."""
        self._get_db = get_db

    async def fetch(self, session_id: str) -> Optional[SessionModel]:
        """
        Fetch session data from the database.
        
        Args:
            session_id: The unique identifier for the session
            
        Returns:
            The session data if found, None otherwise
        """
        try:
            async with self._get_db() as db:
                result = await db.execute(
                    select(SessionModel).where(SessionModel.session_id == session_id)
                )
                return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching session {session_id}: {str(e)}")
            raise

    async def store(self, session_id: str, data: Dict[str, Any], db: AsyncSession = Depends(get_db)) -> None:
        """
        Store session data in the database.
        
        Args:
            session_id: The unique identifier for the session
            data: The data to store
            db: The database session
        """
        try:
            # Check if session exists
            result = await db.execute(
                select(SessionModel).where(SessionModel.session_id == session_id)
            )
            session = result.scalar_one_or_none()
            
            if session:
                # Update existing session
                session.data = data
            else:
                # Create new session
                session = SessionModel(session_id=session_id, data=data)
                db.add(session)
            
            await db.commit()
            logger.info(f"Session {session_id} stored successfully")
        except Exception as e:
            logger.error(f"Error storing session {session_id}: {str(e)}")
            raise

# Create a singleton instance
session_store = SessionStore() 