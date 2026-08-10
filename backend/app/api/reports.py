print("REPORTS ROUTER LOADED")

import os
from uuid import uuid4
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db

from app.models.report import Report
from app.models.report_analysis import ReportAnalysis
from app.models.user import User

from app.schemas.report import ReportResponse
from app.schemas.report_search import ReportSearchResponse, SortOption, QuickRange

from app.api.users import get_current_user

from app.services.report_service import analyze_report
from app.services.pdf_service import generate_health_report_pdf
from app.services import notification_service
from app.services.report_search_service import search_reports


router = APIRouter(
    prefix="/reports",
    tags=["Medical Reports"]
)


UPLOAD_FOLDER = "uploads/reports"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ==================================================
# Upload Report
# ==================================================

@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )


    content = await file.read()


    unique_filename = (
        f"{uuid4()}_{file.filename}"
    )


    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )


    with open(file_path, "wb") as buffer:
        buffer.write(content)



    previous_analysis = (
        db.query(ReportAnalysis)
        .join(Report)
        .filter(
            Report.user_id == current_user.id
        )
        .order_by(
            desc(Report.id)
        )
        .first()
    )


    previous_score = None


    if previous_analysis:
        previous_score = previous_analysis.health_score



    analysis_result = analyze_report(
        file_path,
        previous_score
    )



    new_report = Report(

        user_id=current_user.id,

        file_name=file.filename,

        health_score=analysis_result["health_score"],

        overall_status=analysis_result["overall_status"],

        risk_level=analysis_result["risk_level"],

        medical_summary=analysis_result["medical_summary"],

        analysis_data=str(analysis_result)

    )


    db.add(new_report)

    db.commit()

    db.refresh(new_report)




    report_analysis = ReportAnalysis(

        report_id=new_report.id,

        blood_values=analysis_result["blood_values"],

        analysis_result=analysis_result["analysis"],

        recommendations=analysis_result["recommendations"],


        enriched_report=analysis_result.get(
            "enriched_report",
            {}
        ),


        critical_alerts=analysis_result.get(
            "critical_alerts",
            []
        ),


        health_score=analysis_result["health_score"]

    )


    db.add(report_analysis)

    db.commit()

    db.refresh(report_analysis)


    # ==================================================
    # Auto Notifications
    # ==================================================

    notification_service.create_notification(
        db,
        current_user.id,
        title="Report uploaded",
        message=f"'{file.filename}' was uploaded successfully.",
        type="report_uploaded",
        priority="info",
    )

    notification_service.create_notification(
        db,
        current_user.id,
        title="AI analysis completed",
        message=f"Your analysis for '{file.filename}' is ready.",
        type="analysis_completed",
        priority="info",
    )

    if analysis_result["risk_level"] == "High":
        notification_service.create_notification(
            db,
            current_user.id,
            title="High-risk report detected",
            message=f"'{file.filename}' was flagged as high risk. Please review it.",
            type="high_risk_detected",
            priority="critical",
        )

    if previous_score is not None:

        new_score = analysis_result["health_score"]

        if new_score > previous_score:
            notification_service.create_notification(
                db,
                current_user.id,
                title="Health score improved",
                message=f"Your health score went from {previous_score} to {new_score}.",
                type="score_improved",
                priority="info",
            )

        elif new_score < previous_score:
            notification_service.create_notification(
                db,
                current_user.id,
                title="Health score decreased",
                message=f"Your health score dropped from {previous_score} to {new_score}.",
                type="score_decreased",
                priority="warning",
            )


    return {

        "message": "Report uploaded successfully",

        "report_id": new_report.id,

        "filename": new_report.file_name,

        "uploaded_by": current_user.email,

        **analysis_result

    }




# ==================================================
# Get My Reports
# ==================================================

@router.get(
    "/my-reports",
    response_model=list[ReportResponse]
)
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    reports = (

        db.query(Report)

        .filter(
            Report.user_id == current_user.id
        )

        .all()

    )


    return reports


# ==================================================
# Search Reports
#
# Registered before "/{report_id}" on purpose — FastAPI/Starlette
# matches routes in registration order, and "/{report_id}" would
# otherwise swallow "/reports/search" and 422 trying to parse
# "search" as an int.
#
# Only searches/filters columns that actually exist and are
# populated today (file_name, medical_summary, health_score,
# risk_level, overall_status, report_type, created_at, plus the
# account holder's name as a stand-in for "patient name"). OCR text,
# possible conditions, and AI diagnosis are computed at upload time
# but not currently persisted anywhere queryable, so they aren't
# searchable yet — see report_search_service.py.
# ==================================================

@router.get("/search", response_model=ReportSearchResponse)
def search_my_reports(
    q: str | None = Query(default=None, description="Free-text search"),
    risk_level: list[str] | None = Query(default=None),
    overall_status: list[str] | None = Query(default=None),
    report_type: list[str] | None = Query(default=None),
    min_score: int | None = Query(default=None, ge=0, le=100),
    max_score: int | None = Query(default=None, ge=0, le=100),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    quick_range: QuickRange | None = Query(default=None),
    sort: SortOption = Query(default="newest"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    print("===== SEARCH ENDPOINT =====")
    print("Current user:", current_user.email)
    return search_reports(
        db,
        current_user,
        q=q,
        risk_level=risk_level,
        overall_status=overall_status,
        report_type=report_type,
        min_score=min_score,
        max_score=max_score,
        date_from=date_from,
        date_to=date_to,
        quick_range=quick_range,
        sort=sort,
        page=page,
        page_size=page_size,
    )




# ==================================================
# Report Details
# ==================================================

@router.get("/{report_id}")
def get_report_details(

    report_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):


    report = (

        db.query(Report)

        .filter(
            Report.id == report_id,
            Report.user_id == current_user.id
        )

        .first()

    )


    if not report:

        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )



    analysis = (

        db.query(ReportAnalysis)

        .filter(
            ReportAnalysis.report_id == report.id
        )

        .first()

    )


    if not analysis:

        raise HTTPException(
            status_code=404,
            detail="Analysis not found"
        )



    return {


        "report_id": report.id,


        "filename": report.file_name,


        "uploaded_at": str(report.created_at),


        "health_score": report.health_score,


        "overall_status": report.overall_status,


        "risk_level": report.risk_level,


        "medical_summary": report.medical_summary,


        "blood_values": analysis.blood_values,


        "analysis": analysis.analysis_result,


        "recommendations": analysis.recommendations,


        "enriched_report": analysis.enriched_report,


        "critical_alerts": analysis.critical_alerts

    }




# ==================================================
# Download PDF
# ==================================================

@router.get("/{report_id}/download")
def download_report_pdf(

    report_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):


    report = (

        db.query(Report)

        .filter(
            Report.id == report_id,
            Report.user_id == current_user.id
        )

        .first()

    )


    if not report:

        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )



    analysis = (

        db.query(ReportAnalysis)

        .filter(
            ReportAnalysis.report_id == report.id
        )

        .first()

    )


    if not analysis:

        raise HTTPException(
            status_code=404,
            detail="Analysis not found"
        )



    pdf_path = generate_health_report_pdf(
        report,
        analysis
    )



    return FileResponse(

        path=pdf_path,

        media_type="application/pdf",

        filename=f"MediMind_Report_{report.id}.pdf"

    )