from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel


TrendDirection = Literal["improving", "declining", "stable", "needs_attention"]


class NotEnoughData(BaseModel):
    has_enough_data: Literal[False]
    message: str


class ScoreEvolution(BaseModel):
    current: int
    previous: int
    best: int
    average: float
    improvement_pct: Optional[float] = None


class RiskAnalysis(BaseModel):
    current: str
    previous: str
    highest: str
    lowest: str
    trend: Literal["improving", "worsening", "stable"]


class TestTrend(BaseModel):
    direction: TrendDirection
    latest_value: float
    previous_value: Optional[float] = None
    data_points: int


class InsightCard(BaseModel):
    type: str
    icon: str
    title: str
    description: str


class InsightsOverviewResponse(BaseModel):
    has_enough_data: Literal[True]
    reports_analyzed: int
    score_evolution: ScoreEvolution
    risk_analysis: Optional[RiskAnalysis] = None
    trends: dict[str, TestTrend]


class FullInsightsResponse(InsightsOverviewResponse):
    summary: str
    cards: list[InsightCard]


class TrendsResponse(BaseModel):
    has_enough_data: Literal[True]
    trends: dict[str, TestTrend]


class RecommendationsPayload(BaseModel):
    exercise: list[str]
    nutrition: list[str]
    hydration: list[str]
    sleep: list[str]
    follow_up_tests: list[str]
    doctor_visit: list[str]


class RecommendationsResponse(BaseModel):
    has_enough_data: Literal[True]
    recommendations: RecommendationsPayload


class HistoryPoint(BaseModel):
    report_id: int
    date: datetime
    health_score: int
    risk_level: str


class HistoryResponse(BaseModel):
    has_enough_data: Literal[True]
    history: list[HistoryPoint]