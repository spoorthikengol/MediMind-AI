# 🏥 MediMind AI

### AI-Powered Healthcare Assistant for Medical Report Analysis, Health Insights & Health Tracking

MediMind AI is an AI-powered healthcare platform designed to help users understand their medical reports, track health information over time and receive AI-generated health insights in a simple and accessible way.

The platform combines a modern web interface, FastAPI backend services, medical report processing and AI-powered analysis to transform complex medical information into easier-to-understand insights.

> ⚠️ **Medical Disclaimer:** MediMind AI is an educational and informational platform. It does not replace professional medical advice, diagnosis or treatment. Users should always consult qualified healthcare professionals for medical decisions.

---

## ✨ Features

### 🔐 Secure Authentication
- User registration
- User login
- Password protection
- JWT-based authentication
- Protected application routes
- User profile management

### 📄 Medical Report Management
- Upload medical reports
- Store report information
- View previous reports
- Report history
- Generated report summaries
- Report search
- Advanced filtering
- Pagination

### 🤖 AI-Powered Medical Analysis
- AI-assisted medical report interpretation
- Medical parameter extraction
- Medical terminology simplification
- Health insights
- Risk analysis
- AI-generated recommendations
- Critical health alerts
- Health trend analysis

### 📊 Health Dashboard
- Overall health score
- Health statistics
- Recent reports
- Health trends
- Recent activity
- Recommendations
- Quick actions

### 🔬 Medical Report Comparison
- Compare medical reports
- Compare medical parameters
- Track parameter changes
- Identify improving parameters
- Identify declining parameters
- Health score comparison
- Risk comparison
- Progression timeline
- AI comparison summary
- Visual comparison charts

### 💬 AI Healthcare Assistant
- AI-powered healthcare conversation
- Ask questions about health information
- Understand medical terminology
- Get simplified explanations
- Context-aware assistance

### 📈 Health Insights
- Health score evolution
- Risk analysis
- Trend analysis
- Smart recommendations
- Health progression
- Important health indicators

### 🔎 Advanced Search
- Search medical reports
- Search by report information
- Highlighted search results
- Quick filters
- Advanced filters
- Search pagination

### 🔔 Notifications
- Health notifications
- Critical alerts
- Notification badges
- Notification panel
- Read/unread notification states

### 👨‍⚕️ Doctor Module
- Doctor-oriented functionality
- Patient-related information
- Healthcare workflow support

---

# 🧠 How MediMind AI Works

The basic workflow of MediMind AI is:

```text
                    ┌──────────────────┐
                    │      USER        │
                    └────────┬─────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   React Frontend      │
                 │   TypeScript + Vite   │
                 └───────────┬───────────┘
                             │
                             │ REST API
                             ▼
                 ┌───────────────────────┐
                 │     FastAPI Backend   │
                 └───────────┬───────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
      ┌────────────┐  ┌────────────┐  ┌──────────────┐
      │   Report   │  │ AI / ML    │  │   Database   │
      │ Processing │  │ Services   │  │   Services   │
      └──────┬─────┘  └──────┬─────┘  └──────────────┘
             │               │
             └───────┬───────┘
                     ▼
             ┌─────────────────┐
             │ Health Insights │
             │ Risk Analysis   │
             │ Recommendations │
             └─────────────────┘
```

---

# 🏗️ System Architecture

MediMind AI follows a modular full-stack architecture.

```text
MediMind-AI/
│
├── Frontend
│   └── React + TypeScript + Vite
│
├── Backend
│   └── FastAPI + Python
│
├── API Layer
│   ├── Authentication
│   ├── Reports
│   ├── Chat
│   ├── Comparison
│   ├── Dashboard
│   ├── Doctor
│   ├── History
│   ├── Insights
│   ├── Notifications
│   └── Users
│
├── Service Layer
│   ├── AI Services
│   ├── Report Analysis
│   ├── Report Parsing
│   ├── Health Analysis
│   ├── Health Score
│   ├── Health Trends
│   ├── Comparison
│   ├── Recommendations
│   ├── Medical Insights
│   └── Notifications
│
├── Database Layer
│   └── SQLAlchemy + SQLite
│
└── AI Integration
    └── Gemini-based services
```

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe development |
| Vite | Frontend development and build |
| Tailwind CSS | Styling |
| React Router | Application routing |
| Framer Motion | Animations |
| Reusable UI Components | Consistent interface |

## Backend

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| SQLAlchemy | ORM |
| Pydantic | Data validation |
| SQLite | Local database |
| JWT | Authentication |

## AI & Processing

| Technology / Module | Purpose |
|---|---|
| Gemini AI Services | AI-powered analysis |
| Medical Engine | Medical processing |
| Report Parser | Report data extraction |
| Report Analyzer | Medical report analysis |
| Health Analyzer | Health analysis |
| Health Score | Health scoring |
| Health Trends | Trend detection |
| Recommendation Service | Personalized recommendations |
| Critical Alerts | Important health alerts |

## Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Python Virtual Environment
- PowerShell

---

# 📁 Project Structure

```text
MediMind-AI/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── comparison.py
│   │   │   ├── dashboard.py
│   │   │   ├── doctor.py
│   │   │   ├── history.py
│   │   │   ├── insights.py
│   │   │   ├── notifications.py
│   │   │   ├── reports.py
│   │   │   └── users.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── dependencies.py
│   │   │   ├── jwt.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── chat.py
│   │   │   ├── notification.py
│   │   │   ├── report.py
│   │   │   ├── report_analysis.py
│   │   │   └── user.py
│   │   │
│   │   ├── routers/
│   │   │   ├── analyze.py
│   │   │   ├── api.py
│   │   │   ├── auth.py
│   │   │   └── users.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── chat.py
│   │   │   ├── comparison.py
│   │   │   ├── dashboard.py
│   │   │   ├── history.py
│   │   │   ├── insights.py
│   │   │   ├── notification.py
│   │   │   ├── report.py
│   │   │   ├── report_search.py
│   │   │   └── user.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── chat_service.py
│   │   │   ├── comparison_service.py
│   │   │   ├── critical_alerts.py
│   │   │   ├── dashboard_service.py
│   │   │   ├── doctor_service.py
│   │   │   ├── gemini_parser.py
│   │   │   ├── gemini_service.py
│   │   │   ├── health_analyzer.py
│   │   │   ├── health_score.py
│   │   │   ├── health_trends.py
│   │   │   ├── history_service.py
│   │   │   ├── insights_service.py
│   │   │   ├── medical_engine.py
│   │   │   ├── medical_insights.py
│   │   │   ├── medical_reference.py
│   │   │   ├── notification_service.py
│   │   │   ├── pdf_service.py
│   │   │   ├── recommendation_service.py
│   │   │   ├── report_analyzer.py
│   │   │   ├── report_parser.py
│   │   │   ├── report_search_service.py
│   │   │   ├── report_service.py
│   │   │   └── summary_service.py
│   │   │
│   │   └── utils/
│   │       ├── dependencies.py
│   │       ├── hashing.py
│   │       ├── jwt.py
│   │       └── security.py
│   │
│   ├── requirements.txt
│   └── test_*.py
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── comparison/
│   │   │   ├── dashboard/
│   │   │   ├── insights/
│   │   │   ├── notifications/
│   │   │   ├── reports/
│   │   │   ├── search/
│   │   │   ├── shared/
│   │   │   └── ui/
│   │   │
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── router.tsx
│   │   ├── server.ts
│   │   ├── start.ts
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

# 🚀 Installation & Setup

## Prerequisites

Make sure you have the following installed:

- Python 3.11+
- Node.js
- npm
- Git
- Visual Studio Code

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/spoorthikengol/MediMind-AI.git
```

Navigate into the project:

```bash
cd MediMind-AI
```

---

# 2️⃣ Backend Setup

Open a terminal in the project directory.

```powershell
cd backend
```

### Create virtual environment

```powershell
python -m venv venv
```

### Activate virtual environment

```powershell
.\venv\Scripts\Activate.ps1
```

### Install dependencies

```powershell
pip install -r requirements.txt
```

### Start the FastAPI server

```powershell
uvicorn app.main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI interactive documentation:

```text
http://127.0.0.1:8000/docs
```

Alternative API documentation:

```text
http://127.0.0.1:8000/redoc
```

---

# 3️⃣ Frontend Setup

Open a **new terminal**.

Navigate to the frontend:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Vite will display the local development URL in the terminal.

Usually:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

MediMind AI uses environment variables for sensitive configuration.

Create a local:

```text
.env
```

file when required by the backend.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///./medimind.db
```

### Important

Never commit real API keys, passwords, tokens or other secrets to GitHub.

Use:

```text
.env.example
```

to document required environment variables without exposing their values.

---

# 🔒 Security

MediMind AI includes several security-oriented practices:

- Password hashing
- JWT authentication
- Protected routes
- Environment-based secrets
- Git-ignored `.env` files
- Git-ignored databases
- Git-ignored uploaded files
- Git-ignored generated reports
- Backend/frontend separation

Sensitive files should never be committed to the public repository.

---

# 🧪 Testing

Backend test files are included in the project.

Examples include:

```text
backend/test_analyzer.py
backend/test_file.py
backend/test_gemini.py
backend/test_models.py
backend/test_parser.py
backend/test_pdf.py
backend/test_pipeline.py
backend/test_report_service.py
```

Tests can be executed using the project's configured Python testing environment.

---

# 📊 Main Application Modules

| Module | Description |
|---|---|
| 🔐 Authentication | Registration, login and user security |
| 🏠 Dashboard | Health overview and activity |
| 📄 Reports | Upload and manage medical reports |
| 🤖 AI Analysis | AI-powered report interpretation |
| 🔬 Comparison | Compare reports and health parameters |
| 💬 Assistant | AI healthcare assistant |
| 📈 Insights | Health trends and recommendations |
| 🔎 Search | Search and filter reports |
| 📜 History | View previous health records |
| 🔔 Notifications | Important health notifications |
| 👨‍⚕️ Doctor | Doctor-related functionality |
| 👤 Profile | User profile management |

---

# 🧩 AI Processing Pipeline

A simplified report-processing workflow:

```text
Medical Report
      │
      ▼
   Upload
      │
      ▼
  PDF Processing
      │
      ▼
 Report Parsing
      │
      ▼
 Medical Data Extraction
      │
      ▼
   AI Analysis
      │
      ├───────────────┐
      ▼               ▼
Health Analysis   Risk Analysis
      │               │
      └───────┬───────┘
              ▼
       Health Insights
              │
              ▼
      Recommendations
              │
              ▼
       User Dashboard
```

---

# 📈 Report Comparison Workflow

MediMind AI allows users to compare medical reports across different dates.

```text
Report 1 ──────────────┐
                       │
                       ▼
                 Comparison Engine
                       │
                       ├── Parameter Changes
                       ├── Health Score
                       ├── Risk Changes
                       ├── Trends
                       └── AI Summary
                       │
                       ▼
                  Comparison View
                       │
                       ▼
                 Health Progression
```

This helps users understand how selected health parameters change over time.

---

# 🌟 User Experience

The application focuses on providing:

- Clean modern UI
- Responsive layouts
- Accessible information
- Clear health indicators
- Visual health trends
- Easy navigation
- Simplified medical terminology
- Interactive report comparison
- AI-assisted explanations

---

# 📸 Screenshots

Screenshots can be added here as the project UI is finalized.

Example:

```markdown
![MediMind Dashboard](docs/screenshots/dashboard.png)

![Report Analysis](docs/screenshots/report-analysis.png)

![Report Comparison](docs/screenshots/comparison.png)

![Health Insights](docs/screenshots/insights.png)
```

---

# 🗺️ Development Roadmap

### ✅ Completed

- [x] User authentication
- [x] Dashboard
- [x] Medical report management
- [x] Report analysis
- [x] AI services
- [x] Health insights
- [x] Health scoring
- [x] Report comparison
- [x] Advanced search
- [x] History
- [x] Notifications
- [x] AI assistant
- [x] Doctor module
- [x] GitHub repository

### 🚧 Future Enhancements

- [ ] Multimodal medical image analysis
- [ ] Explainable AI visualizations
- [ ] Voice-based AI assistant
- [ ] Mobile application
- [ ] Cloud deployment
- [ ] EHR integration
- [ ] Federated learning
- [ ] Advanced clinical decision support
- [ ] Real-time health monitoring
- [ ] Wearable device integration
- [ ] Advanced analytics
- [ ] Doctor-patient collaboration
- [ ] Multi-language expansion

---

# 🏆 Project & Hackathon

MediMind AI was developed as part of an AI-focused healthcare technology project.

### Team

**Team:** ClassOfEquipments

### Domain

**AI for Medical Imaging / Healthcare AI**

### Institution

**JNN College of Engineering**

---

# 👥 Contributors

### Spoorthi K P
Project development, frontend/backend development and AI integration.

### Sumukha S H
Team member and project contributor.

### Vishal Prakash
Team member and project contributor.

---

# 🤝 Contributing

Contributions, suggestions and improvements are welcome.

### Development workflow

```bash
git checkout -b feature/your-feature
```

Make your changes and test them.

Then:

```bash
git add .
git commit -m "Add: your feature"
git push origin feature/your-feature
```

Create a Pull Request on GitHub.

---

# 📜 License

This project currently does not specify an open-source license.

If the project is later released as open source, an appropriate license such as MIT may be added.

---

# ⚠️ Medical Disclaimer

MediMind AI is intended for educational and informational purposes.

AI-generated health insights may contain errors or incomplete information.

MediMind AI:

- Does not provide medical diagnosis.
- Does not replace doctors or healthcare professionals.
- Should not be used for emergency medical decisions.
- Should not be used as a substitute for professional medical treatment.

For medical concerns, always consult a qualified healthcare professional.

---

# 📬 Contact

### Project

**MediMind AI**

### GitHub

https://github.com/spoorthikengol/MediMind-AI

---

<div align="center">

## 🏥 MediMind AI

### Making healthcare information easier to understand with AI.

**Built with ❤️ using React, TypeScript, Python, FastAPI and AI**

</div>