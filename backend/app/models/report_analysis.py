from sqlalchemy import Column, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class ReportAnalysis(Base):
    __tablename__ = "report_analysis"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    report_id = Column(
        Integer,
        ForeignKey("reports.id"),
        nullable=False,
        index=True
    )

    blood_values = Column(
        JSON,
        nullable=False
    )

    analysis_result = Column(
        JSON,
        nullable=False
    )

    recommendations = Column(
        JSON,
        nullable=True
    )

    # NEW
    enriched_report = Column(
        JSON,
        nullable=True
    )

    # NEW
    critical_alerts = Column(
        JSON,
        nullable=True
    )

    health_score = Column(
        Integer,
        nullable=False
    )

    report = relationship(
        "Report",
        back_populates="analysis"
    )