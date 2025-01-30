from fastapi import APIRouter, HTTPException
from app.core.llm import llm_service
from app.models.chatbot import ChatbotResponse, ChatbotRequest  # This should now work
from app.models.patient_story import PatientStoryResponse  # Add missing import
from app.prompts.chatbot_prompt import CHATBOT_PROMPT
from langchain.output_parsers import PydanticOutputParser
import logging
from typing import Optional

router = APIRouter()
logger = logging.getLogger(__name__)
chatbot_parser = PydanticOutputParser(pydantic_object=ChatbotResponse)


# In-memory session store (replace with DB in production)
sessions = {}


class QuestionManager:
    @staticmethod
    def get_next_question(session_id: str, answer: Optional[str] = None):
        session = sessions[session_id]

        if answer is not None:
            session['responses'].append(answer)

        if session['current_index'] >= len(session['questions']):
            return None

        next_q = session['questions'][session['current_index']]
        session['current_index'] += 1
        return next_q


@router.post("/start", response_model=ChatbotResponse)
async def start_session(patient_story: PatientStoryResponse):
    session_id = str(hash(patient_story))
    sessions[session_id] = {
        'questions': [q.dict() for q in patient_story.all_questions],
        'current_index': 0,
        'responses': []
    }
    first_question = QuestionManager.get_next_question(session_id)
    return ChatbotResponse(
        message="Let's begin your assessment",
        current_question=first_question,
        session_id=session_id
    )


@router.post("/next", response_model=ChatbotResponse)
async def handle_response(request: ChatbotRequest):
    try:
        next_q = QuestionManager.get_next_question(
            request.session_id,
            request.user_input
        )

        if not next_q:
            return ChatbotResponse(
                message="Assessment complete",
                is_complete=True,
                session_id=request.session_id
            )

        return ChatbotResponse(
            message="Thank you for your response",
            current_question=next_q,
            session_id=request.session_id
        )

    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
