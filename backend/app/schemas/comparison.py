from typing import Literal, Optional, Union

from pydantic import BaseModel


ChangeStatus = Literal["improved", "needs_attention", "stable"]
Confidence = Literal["High", "Medium", "Low"]
Priority = Literal["High", "Medium", "Low"]


class DrivingFactor(BaseModel):
    name: str
    direction: Literal["up", "down"]


class ParameterComparison(BaseModel):
    name: str
    previous_value: float
    current_value: float
    difference: float
    percent_change: Optional[float] = None
    reference_range: Optional[str] = None
    status: ChangeStatus
    clinical_meaning: Optional[str] = None
    ai_explanation: str


class ScoreComparison(BaseModel):
    previous: int
    current: int
    difference: int
    percent_change: Optional[float] = None
    trend: ChangeStatus
    driven_by: list[DrivingFactor]
    reason: str


class RiskComparison(BaseModel):
    previous: str
    current: str
    changed: bool
    trend: ChangeStatus
    reason: str


class TypeMismatch(BaseModel):
    previous_type: str
    latest_type: str


class ComparisonHighlight(BaseModel):
    type: str
    icon: str
    title: str
    description: str
    is_placeholder: bool = False


class ComparisonRecommendation(BaseModel):
    category: str
    reason: str
    recommendation: str
    expected_benefit: str
    priority: Priority


class SummaryBullet(BaseModel):
    text: str
    confidence: Confidence
    supporting_marker: Optional[str] = None


class ComparisonResponse(BaseModel):
    previous_report_id: int
    latest_report_id: int

    # Kept for backward compatibility with any existing consumer of
    # the plain-prose shape.
    comparison: list[str]

    ai_headline: str
    ai_confidence: Confidence
    parameters: list[ParameterComparison]
    score_comparison: ScoreComparison
    risk_comparison: Optional[RiskComparison] = None
    type_mismatch: Optional[TypeMismatch] = None

    summary_bullets: list[SummaryBullet]
    highlights: list[ComparisonHighlight]
    recommendations: list[ComparisonRecommendation]


class NotEnoughReportsResponse(BaseModel):
    previous_report_id: Literal[0]
    latest_report_id: Literal[0]
    comparison: list[str]


ComparisonResult = Union[ComparisonResponse, NotEnoughReportsResponse]