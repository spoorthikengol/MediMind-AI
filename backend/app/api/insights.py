from typing import Union

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.api.users import get_current_user

from app.schemas.insights import (
    FullInsightsResponse,
    TrendsResponse,
    RecommendationsResponse,
    HistoryResponse,
    NotEnoughData,
)

from app.services import insights_service


router = APIRouter(
    prefix="/insights",
    tags=["AI Health Insights"]
)


@router.get("/", response_model=Union[FullInsightsResponse, NotEnoughData])
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return insights_service.get_full_insights(db, current_user.id)


@router.get("/trends", response_model=Union[TrendsResponse, NotEnoughData])
def get_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return insights_service.get_trends_only(db, current_user.id)


@router.get("/recommendations", response_model=Union[RecommendationsResponse, NotEnoughData])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return insights_service.get_recommendations_only(db, current_user.id)


@router.get("/history", response_model=Union[HistoryResponse, NotEnoughData])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return insights_service.get_history_only(db, current_user.id)