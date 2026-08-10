from pydantic import BaseModel
from datetime import datetime


class ReportResponse(BaseModel):
    id: int
    filename: str
    report_type: str
    uploaded_at: datetime

    model_config = {
        "from_attributes": True
    }