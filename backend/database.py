from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import sqlite3
import os

# Create SQLite database
DATABASE_URL = "sqlite:///./feedback.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String)  # "manager" or "employee"
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    team_members = relationship("User", backref="manager", remote_side=[id])
    feedbacks_given = relationship("Feedback", foreign_keys="Feedback.manager_id", back_populates="manager")
    feedbacks_received = relationship("Feedback", foreign_keys="Feedback.employee_id", back_populates="employee")

class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    manager_id = Column(Integer, ForeignKey("users.id"))
    strengths = Column(Text)
    improvements = Column(Text)
    sentiment = Column(String)  # "positive", "neutral", "negative"
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employee = relationship("User", foreign_keys=[employee_id], back_populates="feedbacks_received")
    manager = relationship("User", foreign_keys=[manager_id], back_populates="feedbacks_given")

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize with sample data
def init_sample_data():
    db = SessionLocal()
    
    # Check if data already exists
    try:
        # Clear existing data for fresh start
        db.query(Feedback).delete()
        db.query(User).delete()
        db.commit()
    except:
        pass
    
    # Create sample users
    manager1 = User(username="john_manager", email="john@company.com", role="manager")
    manager2 = User(username="sarah_manager", email="sarah@company.com", role="manager")
    
    db.add(manager1)
    db.add(manager2)
    db.commit()
    db.refresh(manager1)
    db.refresh(manager2)
    
    # Create employees
    emp1 = User(username="alice_emp", email="alice@company.com", role="employee", manager_id=manager1.id)
    emp2 = User(username="bob_emp", email="bob@company.com", role="employee", manager_id=manager1.id)
    emp3 = User(username="charlie_emp", email="charlie@company.com", role="employee", manager_id=manager2.id)
    
    db.add(emp1)
    db.add(emp2)
    db.add(emp3)
    db.commit()
    db.refresh(emp1)
    db.refresh(emp2)
    db.refresh(emp3)
    
    # Create sample feedback
    feedback1 = Feedback(
        employee_id=emp1.id,
        manager_id=manager1.id,
        strengths="Excellent communication skills and team collaboration",
        improvements="Could improve time management and project planning",
        sentiment="positive"
    )
    
    feedback2 = Feedback(
        employee_id=emp2.id,
        manager_id=manager1.id,
        strengths="Strong technical skills and problem-solving ability",
        improvements="Should work on presentation skills and client interaction",
        sentiment="neutral"
    )
    
    db.add(feedback1)
    db.add(feedback2)
    db.commit()
    db.close()
    print("Sample data initialized successfully!")

# Initialize sample data on startup
try:
    init_sample_data()
except Exception as e:
    print(f"Error initializing sample data: {e}")