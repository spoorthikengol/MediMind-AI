from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.api.users import get_current_user

from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    UnreadCountResponse,
)

from app.services import notification_service


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.get("/", response_model=list[NotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.get_notifications(db, current_user.id)


@router.get("/unread-count", response_model=UnreadCountResponse)
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = notification_service.get_unread_count(db, current_user.id)
    return {"count": count}


@router.post("/", response_model=NotificationResponse)
def create_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.create_notification(
        db,
        current_user.id,
        title=payload.title,
        message=payload.message,
        type=payload.type,
        priority=payload.priority,
    )


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.mark_as_read(db, current_user.id, notification_id)


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification_service.mark_all_as_read(db, current_user.id)
    return {"message": "All notifications marked as read"}


@router.delete("/clear")
def clear_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification_service.clear_all_notifications(db, current_user.id)
    return {"message": "All notifications cleared"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification_service.delete_notification(db, current_user.id, notification_id)
    return {"message": "Notification deleted"}