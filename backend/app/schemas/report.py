from pydantic import BaseModel
from datetime import datetime


class ReportResponse(BaseModel):
    id: int
    file_name: str
    health_score: int
    overall_status: str
    risk_level: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }