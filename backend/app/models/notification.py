from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title = Column(String, nullable=False)

    message = Column(String, nullable=False)

    type = Column(String, nullable=False)

    priority = Column(String, nullable=False, default="info")

    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True
    )

    user = relationship(
        "User",
        back_populates="notifications"
    )