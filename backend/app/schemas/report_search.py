from datetime import datetime
from typing import Literal

from pydantic import BaseModel


SortOption = Literal["newest", "oldest", "score_desc", "score_asc", "name_asc", "name_desc"]
QuickRange = Literal["today", "week", "month"]


class ReportSearchItem(BaseModel):
    id: int
    file_name: str
    patient_name: str
    report_type: str | None = None
    health_score: int
    overall_status: str
    risk_level: str
    summary_snippet: str | None = None
    created_at: datetime


class ReportFilterOptions(BaseModel):
    # Populated from the user's own real data — never a hardcoded list.
    risk_levels: list[str]
    overall_statuses: list[str]
    report_types: list[str]


class ReportSearchResponse(BaseModel):
    items: list[ReportSearchItem]
    total: int
    page: int
    page_size: int
    total_pages: int
    filter_options: ReportFilterOptions