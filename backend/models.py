from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="Lecteur") # Administrateur, Éditeur, Lecteur
    # Add password hash for future if needed

class ProjectCategory(Base):
    __tablename__ = "project_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    projects = relationship("Project", back_populates="category")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("project_categories.id"), nullable=False)

    description = Column(Text)
    objective = Column(Text)
    scope = Column(Text)

    sponsor = Column(String)
    manager = Column(String, nullable=False) # responsable
    stakeholders = Column(Text) # parties prenantes

    status = Column(String, nullable=False, default="Idée / à initier")
    priority = Column(String, default="Moyenne")
    alert_level = Column(String, default="Vert")

    start_date = Column(Date)
    target_date = Column(Date)

    progress_percentage = Column(Float, default=0.0)
    general_comment = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    archived_at = Column(DateTime, nullable=True)

    category = relationship("ProjectCategory", back_populates="projects")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    decisions = relationship("Decision", back_populates="project", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)

    planned_date = Column(Date)
    actual_date = Column(Date)

    status = Column(String, default="À venir")
    comment = Column(Text)
    display_order = Column(Integer, default=0)

    project = relationship("Project", back_populates="milestones")

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    date = Column(Date, nullable=False)
    time = Column(String) # e.g., "14:00"
    title = Column(String, nullable=False)
    meeting_type = Column(String)

    participants = Column(Text)
    agenda = Column(Text)
    summary = Column(Text)
    decisions_made = Column(Text)
    actions_decided = Column(Text)
    comment = Column(Text)

    project = relationship("Project", back_populates="meetings")
    decisions = relationship("Decision", back_populates="meeting")
    tasks = relationship("Task", back_populates="meeting")

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=True)

    decision_date = Column(Date, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)

    decision_type = Column(String)
    origin = Column(String)
    decider = Column(String)
    impact = Column(Text)

    implementation_status = Column(String, default="À faire")

    project = relationship("Project", back_populates="decisions")
    meeting = relationship("Meeting", back_populates="decisions")
    tasks = relationship("Task", back_populates="decision")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=True)

    title = Column(String, nullable=False)
    description = Column(Text)
    assignee = Column(String) # responsable

    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(Date)

    priority = Column(String, default="Moyenne")
    status = Column(String, default="À faire")
    origin = Column(String)
    comment = Column(Text)

    project = relationship("Project", back_populates="tasks")
    meeting = relationship("Meeting", back_populates="tasks")
    decision = relationship("Decision", back_populates="tasks")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    title = Column(String, nullable=False)
    document_type = Column(String)

    file_path = Column(String, nullable=False) # Local path or internal URL
    version = Column(String, default="1.0")

    date = Column(Date)
    author = Column(String)
    comment = Column(Text)

    project = relationship("Project", back_populates="documents")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    user = Column(String)
    action = Column(String, nullable=False)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
