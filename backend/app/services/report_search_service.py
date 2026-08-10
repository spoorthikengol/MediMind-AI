from datetime import datetime, timedelta

from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.report_analysis import ReportAnalysis
from app.models.user import User


PAGE_SIZE_OPTIONS = {10, 20, 50, 100}

# report_type lives inside the blood_values JSON column, not as its
# own column — this is the same json_extract approach used to read it
# elsewhere, kept consistent rather than reinventing it.
REPORT_TYPE_EXPR = func.json_extract(ReportAnalysis.blood_values, "$.report_type")


def _apply_quick_range(query, quick_range: str | None):
    if not quick_range:
        return query

    now = datetime.utcnow()

    if quick_range == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif quick_range == "week":
        start = now - timedelta(days=7)
    elif quick_range == "month":
        start = now - timedelta(days=30)
    else:
        return query

    return query.filter(Report.created_at >= start)


def _apply_sort(query, sort: str):
    if sort == "oldest":
        return query.order_by(Report.created_at.asc())
    if sort == "score_desc":
        return query.order_by(Report.health_score.desc())
    if sort == "score_asc":
        return query.order_by(Report.health_score.asc())
    if sort == "name_asc":
        return query.order_by(Report.file_name.asc())
    if sort == "name_desc":
        return query.order_by(Report.file_name.desc())
    return query.order_by(Report.created_at.desc())


def get_filter_options(db: Session, user: User) -> dict:
    """Distinct values actually present in this user's own reports —
    never a hardcoded guess, so the UI never offers a filter option
    that silently returns zero results."""

    risk_levels = [
        row[0]
        for row in db.query(Report.risk_level).filter(Report.user_id == user.id).distinct().all()
        if row[0]
    ]

    overall_statuses = [
        row[0]
        for row in db.query(Report.overall_status).filter(Report.user_id == user.id).distinct().all()
        if row[0]
    ]

    report_types = [
        row[0]
        for row in (
            db.query(REPORT_TYPE_EXPR)
            .join(Report, Report.id == ReportAnalysis.report_id)
            .filter(Report.user_id == user.id)
            .distinct()
            .all()
        )
        if row[0]
    ]

    return {
        "risk_levels": risk_levels,
        "overall_statuses": overall_statuses,
        "report_types": sorted(report_types),
    }


def search_reports(
    db: Session,
    user: User,
    q: str | None = None,
    risk_level: list[str] | None = None,
    overall_status: list[str] | None = None,
    report_type: list[str] | None = None,
    min_score: int | None = None,
    max_score: int | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    quick_range: str | None = None,
    sort: str = "newest",
    page: int = 1,
    page_size: int = 20,
) -> dict:

    page_size = page_size if page_size in PAGE_SIZE_OPTIONS else 20
    page = max(page, 1)

    query = db.query(Report).filter(Report.user_id == user.id)

    # report_type filtering requires the join, but only bring it in
    # when actually needed — most searches won't use it.
    if report_type:
        query = query.join(ReportAnalysis, Report.id == ReportAnalysis.report_id).filter(
            REPORT_TYPE_EXPR.in_(report_type)
        )

    if q:
        like = f"%{q}%"

        name_matches = bool(user.full_name) and q.lower() in user.full_name.lower()

        if not name_matches:
            query = query.filter(
                or_(
                    Report.file_name.ilike(like),
                    Report.medical_summary.ilike(like),
                )
            )

    if risk_level:
        query = query.filter(Report.risk_level.in_(risk_level))

    if overall_status:
        query = query.filter(Report.overall_status.in_(overall_status))

    if min_score is not None:
        query = query.filter(Report.health_score >= min_score)

    if max_score is not None:
        query = query.filter(Report.health_score <= max_score)

    if date_from is not None:
        query = query.filter(Report.created_at >= date_from)

    if date_to is not None:
        query = query.filter(Report.created_at <= date_to)

    query = _apply_quick_range(query, quick_range)

    total = query.count()

    query = _apply_sort(query, sort)

    reports = query.offset((page - 1) * page_size).limit(page_size).all()

    report_ids = [r.id for r in reports]
    analyses = {
        a.report_id: a
        for a in db.query(ReportAnalysis).filter(ReportAnalysis.report_id.in_(report_ids)).all()
    }

    items = []
    for r in reports:
        analysis = analyses.get(r.id)
        r_type = None
        if analysis and analysis.blood_values:
            r_type = analysis.blood_values.get("report_type")

        items.append({
            "id": r.id,
            "file_name": r.file_name,
            "patient_name": user.full_name,
            "report_type": r_type,
            "health_score": r.health_score,
            "overall_status": r.overall_status,
            "risk_level": r.risk_level,
            "summary_snippet": (r.medical_summary or "")[:220],
            "created_at": r.created_at,
        })

    total_pages = max((total + page_size - 1) // page_size, 1)

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "filter_options": get_filter_options(db, user),
    }