from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

from database import get_db, User, Feedback
from schemas import *
from auth import authenticate_user, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

app = FastAPI(title="Feedback System API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://localhost:5173", "https://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("Starting Feedback System API...")
    print("Initializing database...")
    from database import init_sample_data
    try:
        init_sample_data()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Database initialization error: {e}")
@app.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    print(f"Login attempt for username: {login_data.username}")
    user = authenticate_user(login_data.username, db)
    if not user:
        print(f"Authentication failed for: {login_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User '{login_data.username}' not found. Please check your username."
        )
    
    print(f"Login successful for: {login_data.username}")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/auth/register", response_model=LoginResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Create new user
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        role=user_data.role,
        manager_id=user_data.manager_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }
@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/users/managers", response_model=List[User])
async def get_managers(db: Session = Depends(get_db)):
    managers = db.query(User).filter(User.role == "manager").all()
    return managers
@app.get("/users/team", response_model=List[User])
async def get_team_members(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view team members")
    
    team_members = db.query(User).filter(User.manager_id == current_user.id).all()
    return team_members

@app.post("/feedback", response_model=Feedback)
async def create_feedback(
    feedback: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create feedback")
    
    # Verify employee is in manager's team
    employee = db.query(User).filter(
        User.id == feedback.employee_id,
        User.manager_id == current_user.id
    ).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found in your team")
    
    db_feedback = Feedback(
        employee_id=feedback.employee_id,
        manager_id=current_user.id,
        strengths=feedback.strengths,
        improvements=feedback.improvements,
        sentiment=feedback.sentiment
    )
    
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

@app.get("/feedback", response_model=List[Feedback])
async def get_feedback(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "manager":
        # Manager sees all feedback they've given
        feedback = db.query(Feedback).filter(Feedback.manager_id == current_user.id).all()
    else:
        # Employee sees only their feedback
        feedback = db.query(Feedback).filter(Feedback.employee_id == current_user.id).all()
    
    return feedback

@app.get("/feedback/employee/{employee_id}", response_model=List[Feedback])
async def get_employee_feedback(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view employee feedback")
    
    # Verify employee is in manager's team
    employee = db.query(User).filter(
        User.id == employee_id,
        User.manager_id == current_user.id
    ).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found in your team")
    
    feedback = db.query(Feedback).filter(
        Feedback.employee_id == employee_id,
        Feedback.manager_id == current_user.id
    ).all()
    
    return feedback

@app.put("/feedback/{feedback_id}", response_model=Feedback)
async def update_feedback(
    feedback_id: int,
    feedback_update: FeedbackUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can update feedback")
    
    db_feedback = db.query(Feedback).filter(
        Feedback.id == feedback_id,
        Feedback.manager_id == current_user.id
    ).first()
    
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    update_data = feedback_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_feedback, field, value)
    
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

@app.put("/feedback/{feedback_id}/acknowledge")
async def acknowledge_feedback(
    feedback_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can acknowledge feedback")
    
    db_feedback = db.query(Feedback).filter(
        Feedback.id == feedback_id,
        Feedback.employee_id == current_user.id
    ).first()
    
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    db_feedback.acknowledged = True
    db.commit()
    
    return {"message": "Feedback acknowledged successfully"}

@app.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "manager":
        # Manager dashboard stats
        feedback_query = db.query(Feedback).filter(Feedback.manager_id == current_user.id)
    else:
        # Employee dashboard stats
        feedback_query = db.query(Feedback).filter(Feedback.employee_id == current_user.id)
    
    total_feedback = feedback_query.count()
    positive_feedback = feedback_query.filter(Feedback.sentiment == "positive").count()
    neutral_feedback = feedback_query.filter(Feedback.sentiment == "neutral").count()
    negative_feedback = feedback_query.filter(Feedback.sentiment == "negative").count()
    unacknowledged_feedback = feedback_query.filter(Feedback.acknowledged == False).count()
    
    return DashboardStats(
        total_feedback=total_feedback,
        positive_feedback=positive_feedback,
        neutral_feedback=neutral_feedback,
        negative_feedback=negative_feedback,
        unacknowledged_feedback=unacknowledged_feedback
    )

@app.get("/")
async def root():
    return {"message": "Feedback System API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)