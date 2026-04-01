from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime
from backend.database import get_db
import backend.models as models
import backend.schemas as schemas
from backend.routers.auth_router import get_current_user, require_role, ADMIN, EDITOR, READER

router = APIRouter(prefix="/api/projects", tags=["projects"])

# GET are mostly accessible to all roles including READER
@router.get("/", response_model=List[schemas.ProjectDetail])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR, READER]))):
    return db.query(models.Project).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    try:
        db.commit()
        db.refresh(db_project)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating project. Code might be duplicate.")

    # Log activity
    user_name = current_user.username if current_user else "System"
    log = models.ActivityLog(project_id=db_project.id, user=user_name, action="Create Project")
    db.add(log)
    db.commit()

    return db_project

@router.get("/{project_id}", response_model=schemas.ProjectDetail)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR, READER]))):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=schemas.Project)
def update_project(project_id: int, project: schemas.ProjectUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)

    # Log activity
    user_name = current_user.username if current_user else "System"
    log = models.ActivityLog(project_id=db_project.id, user=user_name, action="Update Project")
    db.add(log)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}", response_model=dict)
def archive_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN]))):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    db_project.archived_at = datetime.utcnow()
    db_project.status = "Archivé"

    user_name = current_user.username if current_user else "System"
    log = models.ActivityLog(project_id=db_project.id, user=user_name, action="Archive Project")
    db.add(log)
    db.commit()
    return {"status": "success"}

# --- Categories ---
category_router = APIRouter(prefix="/api/categories", tags=["categories"])

@category_router.get("/", response_model=List[schemas.ProjectCategory])
def get_categories(db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR, READER]))):
    return db.query(models.ProjectCategory).all()

@category_router.post("/", response_model=schemas.ProjectCategory)
def create_category(category: schemas.ProjectCategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN]))):
    db_cat = models.ProjectCategory(**category.dict())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

# --- Milestones ---
milestone_router = APIRouter(prefix="/api/milestones", tags=["milestones"])

@milestone_router.post("/", response_model=schemas.Milestone)
def create_milestone(milestone: schemas.MilestoneCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_milestone = models.Milestone(**milestone.dict())
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@milestone_router.put("/{milestone_id}", response_model=schemas.Milestone)
def update_milestone(milestone_id: int, milestone: schemas.MilestoneBase, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_milestone = db.query(models.Milestone).filter(models.Milestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    for k, v in milestone.dict(exclude_unset=True).items():
        setattr(db_milestone, k, v)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@milestone_router.delete("/{milestone_id}")
def delete_milestone(milestone_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_milestone = db.query(models.Milestone).filter(models.Milestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(db_milestone)
    db.commit()
    return {"status": "success"}

# --- Meetings ---
meeting_router = APIRouter(prefix="/api/meetings", tags=["meetings"])

@meeting_router.post("/", response_model=schemas.Meeting)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_meeting = models.Meeting(**meeting.dict())
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@meeting_router.put("/{meeting_id}", response_model=schemas.Meeting)
def update_meeting(meeting_id: int, meeting: schemas.MeetingBase, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    for k, v in meeting.dict(exclude_unset=True).items():
        setattr(db_meeting, k, v)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@meeting_router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(db_meeting)
    db.commit()
    return {"status": "success"}

# --- Decisions ---
decision_router = APIRouter(prefix="/api/decisions", tags=["decisions"])

@decision_router.post("/", response_model=schemas.Decision)
def create_decision(decision: schemas.DecisionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_decision = models.Decision(**decision.dict())
    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)
    return db_decision

@decision_router.put("/{decision_id}", response_model=schemas.Decision)
def update_decision(decision_id: int, decision: schemas.DecisionBase, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not db_decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    for k, v in decision.dict(exclude_unset=True).items():
        setattr(db_decision, k, v)
    db.commit()
    db.refresh(db_decision)
    return db_decision

@decision_router.delete("/{decision_id}")
def delete_decision(decision_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not db_decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    db.delete(db_decision)
    db.commit()
    return {"status": "success"}

# --- Tasks ---
task_router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@task_router.post("/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@task_router.put("/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskBase, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in task.dict(exclude_unset=True).items():
        setattr(db_task, k, v)
    db.commit()
    db.refresh(db_task)
    return db_task

@task_router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"status": "success"}

# --- Documents ---
document_router = APIRouter(prefix="/api/documents", tags=["documents"])

@document_router.post("/", response_model=schemas.Document)
def add_document(document: schemas.DocumentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_doc = models.Document(**document.dict())
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@document_router.put("/{document_id}", response_model=schemas.Document)
def update_document(document_id: int, document: schemas.DocumentBase, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    for k, v in document.dict(exclude_unset=True).items():
        setattr(db_doc, k, v)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@document_router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR]))):
    db_doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(db_doc)
    db.commit()
    return {"status": "success"}

# --- Dashboard ---
dashboard_router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@dashboard_router.get("/", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN, EDITOR, READER]))):
    total_projects = db.query(models.Project).count()

    categories = db.query(models.ProjectCategory).all()
    projects_by_category = {}
    for c in categories:
        count = db.query(models.Project).filter(models.Project.category_id == c.id).count()
        projects_by_category[c.name] = count

    statuses = ["Idée / à initier", "En préparation", "En cours", "En attente", "Bloqué", "Terminé", "Archivé", "Abandonné"]
    projects_by_status = {}
    for s in statuses:
        count = db.query(models.Project).filter(models.Project.status == s).count()
        projects_by_status[s] = count

    today = date.today()
    overdue_tasks = db.query(models.Task).filter(models.Task.due_date < today, models.Task.status != "Terminée").count()

    upcoming_milestones = db.query(models.Milestone).filter(models.Milestone.planned_date >= today).count()

    recent_decisions = db.query(models.Decision).order_by(models.Decision.id.desc()).limit(5).all()
    recent_meetings = db.query(models.Meeting).order_by(models.Meeting.id.desc()).limit(5).all()

    return {
        "total_projects": total_projects,
        "projects_by_category": projects_by_category,
        "projects_by_status": projects_by_status,
        "overdue_tasks": overdue_tasks,
        "upcoming_milestones": upcoming_milestones,
        "recent_decisions": recent_decisions,
        "recent_meetings": recent_meetings
    }
