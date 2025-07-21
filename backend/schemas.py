from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UserBase(BaseModel):
    username: str
    email: str
    role: str

class UserCreate(UserBase):
    manager_id: Optional[int] = None

class User(UserBase):
    id: int
    manager_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class FeedbackBase(BaseModel):
    strengths: str
    improvements: str
    sentiment: str

class FeedbackCreate(FeedbackBase):
    employee_id: int

class FeedbackUpdate(BaseModel):
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    sentiment: Optional[str] = None

class Feedback(FeedbackBase):
    id: int
    employee_id: int
    manager_id: int
    acknowledged: bool
    created_at: datetime
    updated_at: datetime
    employee: User
    manager: User
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class DashboardStats(BaseModel):
    total_feedback: int
    positive_feedback: int
    neutral_feedback: int
    negative_feedback: int
    unacknowledged_feedback: int