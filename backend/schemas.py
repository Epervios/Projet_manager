from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    username: str
    role: str = "Lecteur"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# Models
class ProjectCategoryBase(BaseModel):
    name: str

class ProjectCategoryCreate(ProjectCategoryBase):
    pass

class ProjectCategory(ProjectCategoryBase):
    id: int

    class Config:
        from_attributes = True

# Milestone
class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    planned_date: Optional[date] = None
    actual_date: Optional[date] = None
    status: str = "À venir"
    comment: Optional[str] = None
    display_order: int = 0

class MilestoneCreate(MilestoneBase):
    project_id: int

class Milestone(MilestoneBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# Meeting
class MeetingBase(BaseModel):
    date: date
    time: Optional[str] = None
    title: str
    meeting_type: Optional[str] = None
    participants: Optional[str] = None
    agenda: Optional[str] = None
    summary: Optional[str] = None
    decisions_made: Optional[str] = None
    actions_decided: Optional[str] = None
    comment: Optional[str] = None

class MeetingCreate(MeetingBase):
    project_id: int

class Meeting(MeetingBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# Decision
class DecisionBase(BaseModel):
    decision_date: date
    title: str
    description: Optional[str] = None
    decision_type: Optional[str] = None
    origin: Optional[str] = None
    decider: Optional[str] = None
    impact: Optional[str] = None
    implementation_status: str = "À faire"
    meeting_id: Optional[int] = None

class DecisionCreate(DecisionBase):
    project_id: int

class Decision(DecisionBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# Task
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[date] = None
    priority: str = "Moyenne"
    status: str = "À faire"
    origin: Optional[str] = None
    comment: Optional[str] = None
    meeting_id: Optional[int] = None
    decision_id: Optional[int] = None

class TaskCreate(TaskBase):
    project_id: int

class Task(TaskBase):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Document
class DocumentBase(BaseModel):
    title: str
    document_type: Optional[str] = None
    file_path: str
    version: str = "1.0"
    date: Optional[date] = None
    author: Optional[str] = None
    comment: Optional[str] = None

class DocumentCreate(DocumentBase):
    project_id: int

class Document(DocumentBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# Project
class ProjectBase(BaseModel):
    code: str
    name: str
    category_id: int
    description: Optional[str] = None
    objective: Optional[str] = None
    scope: Optional[str] = None
    sponsor: Optional[str] = None
    manager: str
    stakeholders: Optional[str] = None
    status: str = "Idée / à initier"
    priority: str = "Moyenne"
    alert_level: str = "Vert"
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    progress_percentage: float = 0.0
    general_comment: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Activity Log
class ActivityLogBase(BaseModel):
    project_id: Optional[int] = None
    user: Optional[str] = None
    action: str
    details: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ProjectDetail(Project):
    category: ProjectCategory
    milestones: List[Milestone] = []
    meetings: List[Meeting] = []
    decisions: List[Decision] = []
    tasks: List[Task] = []
    documents: List[Document] = []
    activity_logs: List[ActivityLog] = []

    class Config:
        from_attributes = True

# Dashboard
class DashboardStats(BaseModel):
    total_projects: int
    projects_by_category: dict
    projects_by_status: dict
    overdue_tasks: int
    upcoming_milestones: int
    recent_decisions: List[Decision]
    recent_meetings: List[Meeting]
