from pydantic import BaseModel


class HealthHistory(BaseModel):
    report: str
    score: int
    date: str


class DashboardResponse(BaseModel):
    user_name: str

    total_reports: int

    latest_health_score: int

    average_health_score: float

    highest_health_score: int

    lowest_health_score: int

    healthy_reports: int

    abnormal_reports: int

    overall_status: str

    risk_level: str

    health_trend: str

    last_uploaded: str

    health_history: list[HealthHistory]