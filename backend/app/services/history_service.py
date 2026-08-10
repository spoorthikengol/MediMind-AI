from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.report import Report
from app.models.report_analysis import ReportAnalysis
from app.models.user import User


def get_health_history(db: Session, current_user: User):
    """
    Returns complete report history.
    """

    reports = (
        db.query(Report, ReportAnalysis)
        .join(
            ReportAnalysis,
            Report.id == ReportAnalysis.report_id
        )
        .filter(
            Report.user_id == current_user.id
        )
        .order_by(
            desc(Report.uploaded_at)
        )
        .all()
    )

    history = []

    for report, analysis in reports:

        score = analysis.health_score

        if score >= 90:
            overall_status = "Healthy"
            risk_level = "Low"

        elif score >= 70:
            overall_status = "Needs Attention"
            risk_level = "Moderate"

        else:
            overall_status = "Consult a Doctor"
            risk_level = "High"

        history.append({

            "report_id": report.id,

            "filename": report.filename,

            "report_type": report.report_type,

            "health_score": score,

            "overall_status": overall_status,

            "risk_level": risk_level,

            "uploaded_at": str(report.uploaded_at)

        })

    return {

        "history": history

    }