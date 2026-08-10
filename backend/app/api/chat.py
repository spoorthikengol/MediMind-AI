from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.chat_service import ask_ai

router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"]
)


class ChatRequest(BaseModel):
    report_text: str
    question: str


class ChatResponse(BaseModel):
    answer: str


@router.post(
    "/ask",
    response_model=ChatResponse,
    summary="Ask questions about a medical report"
)
def chat(request: ChatRequest):
    """
    Ask the AI questions about an uploaded medical report.

    Example:
    {
        "report_text": "Patient has mild pneumonia...",
        "question": "Explain this report in simple English."
    }
    """

    # Validate input
    if not request.report_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Medical report text cannot be empty."
        )

    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    try:
        answer = ask_ai(
            report_text=request.report_text,
            question=request.question
        )

        return ChatResponse(answer=answer)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Chat Error: {str(e)}"
        )