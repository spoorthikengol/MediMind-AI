from pydantic import BaseModel


class HealthHistoryItem(BaseModel):

    report_id: int

    filename: str

    report_type: str

    health_score: int

    overall_status: str

    risk_level: str

    uploaded_at: str


class HealthHistoryResponse(BaseModel):

    history: list[HealthHistoryItem]