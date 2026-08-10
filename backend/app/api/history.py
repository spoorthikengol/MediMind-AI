from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.report import Report
from app.models.report_analysis import ReportAnalysis
from app.models.user import User
from app.api.users import get_current_user


router = APIRouter(
    prefix="/history",
    tags=["History"]
)


@router.get("/")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    reports = (
        db.query(Report)
        .filter(
            Report.user_id == current_user.id
        )
        .order_by(
            desc(Report.created_at)
        )
        .all()
    )


    result = []

    for report in reports:

        analysis = (
            db.query(ReportAnalysis)
            .filter(
                ReportAnalysis.report_id == report.id
            )
            .first()
        )


        result.append({

            "id": report.id,

            "file_name": report.file_name,

            "health_score":
                analysis.health_score
                if analysis else report.health_score,

            "overall_status":
                report.overall_status,

            "risk_level":
                report.risk_level,

            "created_at":
                str(report.created_at)

        })


    return result