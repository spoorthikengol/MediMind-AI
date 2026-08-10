from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.report import Report
from app.models.report_analysis import ReportAnalysis
from app.models.user import User


def get_dashboard_data(db: Session, current_user: User):
    """
    Returns complete dashboard analytics.
    """

    # Total reports
    total_reports = (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .count()
    )

    # Latest report
    latest_report = (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(desc(Report.id))
        .first()
    )

    # No reports uploaded
    if latest_report is None:

        return {
            "user_name": current_user.full_name,
            "total_reports": 0,
            "latest_health_score": 0,
            "average_health_score": 0,
            "highest_health_score": 0,
            "lowest_health_score": 0,
            "healthy_reports": 0,
            "abnormal_reports": 0,
            "overall_status": "No Reports",
            "risk_level": "Unknown",
            "health_trend": "No reports uploaded.",
            "last_uploaded": "-",
            "health_history": [],
            "recent_reports": []
        }

    # Get all analyses
    analyses = (
    db.query(ReportAnalysis)
    .join(Report)
    .filter(Report.user_id == current_user.id)
    .order_by(Report.created_at.asc())
    .all()
)

    scores = [
        analysis.health_score
        for analysis in analyses
    ]

    # --------------------------
    # Health History
    # --------------------------

    health_history = []

    for analysis in analyses:

        report = (
            db.query(Report)
            .filter(
                Report.id == analysis.report_id
            )
            .first()
        )

        if report:

            health_history.append({

                "report": f"R{report.id}",

                "score": analysis.health_score,

                "date": str(report.created_at)

            })

    # --------------------------
    # Recent Reports
    # --------------------------

    recent_reports = []

    reports = (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(desc(Report.id))
        .limit(5)
        .all()
    )

    for report in reports:

        recent_reports.append({

            "id": report.id,

            "file_name": report.file_name,

            "created_at": str(report.created_at),

            "health_score": report.health_score

        })

    # Latest analysis
    latest_analysis = (
        db.query(ReportAnalysis)
        .filter(
            ReportAnalysis.report_id == latest_report.id
        )
        .first()
    )

    latest_health_score = (
        latest_analysis.health_score
        if latest_analysis
        else 0
    )

    # Statistics

    average_health_score = (
        round(sum(scores) / len(scores), 1)
        if scores
        else 0
    )

    highest_health_score = (
        max(scores)
        if scores
        else 0
    )

    lowest_health_score = (
        min(scores)
        if scores
        else 0
    )

    healthy_reports = len(
        [
            s
            for s in scores
            if s >= 90
        ]
    )

    abnormal_reports = (
        len(scores)
        -
        healthy_reports
    )

    # Overall Status

    if latest_health_score >= 90:

        overall_status = "Healthy"

        risk_level = "Low"

        health_trend = (
            "Excellent health indicators. "
            "Continue maintaining your current lifestyle."
        )

    elif latest_health_score >= 70:

        overall_status = "Moderate"

        risk_level = "Medium"

        health_trend = (
            "Your health condition is stable. "
            "Regular monitoring is recommended."
        )

    else:

        overall_status = "Needs Attention"

        risk_level = "High"

        health_trend = (
            "Some health parameters need attention. "
            "Consider consulting a healthcare professional."
        )

    return {

        "user_name": current_user.full_name,

        "total_reports": total_reports,

        "latest_health_score": latest_health_score,

        "average_health_score": average_health_score,

        "highest_health_score": highest_health_score,

        "lowest_health_score": lowest_health_score,

        "healthy_reports": healthy_reports,

        "abnormal_reports": abnormal_reports,

        "overall_status": overall_status,

        "risk_level": risk_level,

        "health_trend": health_trend,

        "last_uploaded": str(
            latest_report.created_at
        ),

        "health_history": health_history,

        "recent_reports": recent_reports

    }