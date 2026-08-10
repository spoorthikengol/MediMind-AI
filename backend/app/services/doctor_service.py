from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user import User
from app.models.report import Report
from app.models.report_analysis import ReportAnalysis


def get_doctor_dashboard(db: Session):
    users = db.query(User).all()

    reports = db.query(Report).all()

    analyses = db.query(ReportAnalysis).all()

    total_patients = len(users)

    total_reports = len(reports)

    high_risk = 0
    healthy = 0

    patient_reports = []

    for report in reports:

        user = (
            db.query(User)
            .filter(User.id == report.user_id)
            .first()
        )

        analysis = (
            db.query(ReportAnalysis)
            .filter(
                ReportAnalysis.report_id == report.id
            )
            .first()
        )

        if not user or not analysis:
            continue

        score = analysis.health_score

        if score >= 90:
            risk = "Low"
            healthy += 1

        elif score >= 70:
            risk = "Medium"

        else:
            risk = "High"
            high_risk += 1

        patient_reports.append({
            "id": report.id,
            "patient_name": user.full_name,
            "email": user.email,
            "health_score": score,
            "risk_level": risk,
            "created_at": str(report.created_at)
        })

    patient_reports.sort(
        key=lambda x: x["id"],
        reverse=True
    )

    return {
        "total_patients": total_patients,
        "total_reports": total_reports,
        "healthy_patients": healthy,
        "high_risk_patients": high_risk,
        "patients": patient_reports
    }
