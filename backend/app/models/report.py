from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Report(Base):

    __tablename__ = "reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    file_name = Column(
        String,
        nullable=False
    )

    health_score = Column(
        Integer,
        nullable=False
    )

    overall_status = Column(
        String,
        nullable=False
    )

    risk_level = Column(
        String,
        nullable=False
    )

    medical_summary = Column(
        Text,
        nullable=True
    )

    analysis_data = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship(
        "User",
        back_populates="reports"
    )

    analysis = relationship(
        "ReportAnalysis",
        back_populates="report",
        uselist=False,
        cascade="all, delete-orphan"
    )