from fastapi import APIRouter
from pydantic import BaseModel

from app.services.report_analyzer import analyze_report

router = APIRouter(
    prefix="/analyze",
    tags=["AI Analysis"]
)


class AnalyzeRequest(BaseModel):
    report_text: str


@router.post("/")
def analyze(request: AnalyzeRequest):
    result = analyze_report(request.report_text)
    return result