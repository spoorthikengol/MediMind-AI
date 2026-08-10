from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException

from app.models.notification import Notification
from app.schemas.notification import NotificationType, NotificationPriority


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    type: NotificationType,
    priority: NotificationPriority = "info",
) -> Notification:

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        priority=priority,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def get_notifications(db: Session, user_id: int):

    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(desc(Notification.created_at))
        .all()
    )


def get_unread_count(db: Session, user_id: int) -> int:

    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .count()
    )


def _get_owned_notification(db: Session, user_id: int, notification_id: int) -> Notification:

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


def mark_as_read(db: Session, user_id: int, notification_id: int) -> Notification:

    notification = _get_owned_notification(db, user_id, notification_id)

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


def mark_all_as_read(db: Session, user_id: int) -> None:

    (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .update({"is_read": True})
    )

    db.commit()


def delete_notification(db: Session, user_id: int, notification_id: int) -> None:

    notification = _get_owned_notification(db, user_id, notification_id)

    db.delete(notification)
    db.commit()


def clear_all_notifications(db: Session, user_id: int) -> None:

    (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .delete()
    )

    db.commit()