from datetime import datetime
from typing import Literal

from pydantic import BaseModel


NotificationType = Literal[
    "report_uploaded",
    "analysis_completed",
    "high_risk_detected",
    "score_improved",
    "score_decreased",
    "follow_up_reminder",
    "doctor_recommendation",
    "system",
]

NotificationPriority = Literal["info", "warning", "critical"]


class NotificationCreate(BaseModel):
    title: str
    message: str
    type: NotificationType
    priority: NotificationPriority = "info"


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: NotificationType
    priority: NotificationPriority
    is_read: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class UnreadCountResponse(BaseModel):
    count: int