from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# ============================
# Import Models
# ============================
from app.models.user import User
from app.models.report import Report
from app.models.report_analysis import ReportAnalysis
from app.models.notification import Notification

# ============================
# Create Database Tables
# ============================
Base.metadata.create_all(bind=engine)

# ============================
# Create FastAPI App
# ============================
app = FastAPI(
    title="MediMind AI API",
    version="1.0.0",
    description="AI-Powered Healthcare Assistant Backend"
)

# ============================
# CORS Configuration
# ============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# Import Routers
# ============================
from app.api import auth
from app.api import users
from app.api import reports
from app.api import dashboard
from app.api import history
from app.api import chat
from app.api import comparison
from app.api import doctor
from app.api import notifications
from app.api import insights
from app.routers import analyze

# ============================
# Register Routers
# ============================
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(reports.router)
app.include_router(dashboard.router)
app.include_router(history.router)
app.include_router(chat.router)
app.include_router(comparison.router)
app.include_router(doctor.router)
app.include_router(notifications.router)
app.include_router(insights.router)
app.include_router(analyze.router)

# ============================
# Root Endpoint
# ============================
@app.get("/", tags=["Home"])
def root():
    return {
        "message": "Welcome to MediMind AI API 🚀",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "Running Successfully"
    }