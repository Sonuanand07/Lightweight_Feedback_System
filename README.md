Lightweight_Feedback_System
Deployment.

# 💬 Lightweight Feedback System

A lightweight web-based feedback system that enables managers to collect, view, and analyze feedback from team members. Built with **FastAPI (backend)** and **React with Vite (frontend)**. Deployed on **Vercel** and **GitHub**. Uses **SQLite** for persistent storage.

---

## 🚀 Features

- 🧑‍💼 Manager login and feedback dashboard
- 👥 Team management and user-based feedback access
- 📊 Feedback collection and visual summary
- 🔒 JWT-based secure authentication
- 📦 SQLite database for local development
- 📹 Optional: Integrated video recorder for feedback (extension script)

---

## 📸 Demo

Live Site: [https://your-vercel-link.vercel.app](https://your-vercel-link.vercel.app)  
Backend: `localhost:8000` (or deployed backend URL)

![Feedback Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExanI5b2hiMWt2Y2o5ZHZ6Zm41OWd1NmJoa2twMnptZWU1d2M3bnQzeiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/NKIhw5eYBqpQ6VRZgH/giphy.gif)

---

## 🛠️ Tech Stack

| Frontend     | Backend    | Database | Deployment |
|--------------|------------|----------|------------|
| React + Vite | FastAPI    | SQLite   | Vercel, GitHub |

---

## 📂 Folder Structure

Lightweight_Feedback_System/
├── frontend/ # React + Vite frontend
│ └── ...
├── backend/ # FastAPI backend
│ ├── main.py
│ ├── models.py
│ ├── schemas.py
│ └── ...
└── README.md

yaml
Copy
Edit

---

## ⚙️ Installation & Run

### 📦 Prerequisites

- Python 3.10+
- Node.js v18+
- Git installed

---

### 🧪 Local Development

#### 🔹 Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
🔹 Frontend (Vite + React)
bash
Copy
Edit
cd frontend
npm install
npm run dev
Default frontend runs on: http://localhost:5173
Backend: http://localhost:8000

🧭 API Routes
POST /login – JWT login

POST /feedback – Submit feedback

GET /feedback – Get all feedback for a manager

GET /users/team – Get team members

GET /dashboard/stats – Feedback statistics

🐞 Common Issues
🔹 sqlalchemy.exc.ArgumentError
Cause: You're trying to query using Pydantic schema instead of SQLAlchemy model.
Fix: Replace db.query(Schema.Feedback) with db.query(Models.Feedback).

🚀 Deployment
🔹 GitHub Setup
bash
Copy
Edit
git init
git add .
git commit -m "Initial commit"
git push -u origin main
🔹 Vercel (Frontend)
Go to vercel.com

Import GitHub project

Select frontend folder for deployment

Add build command: npm run build and output: dist

