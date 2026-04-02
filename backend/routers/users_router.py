from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
import backend.models as models
import backend.schemas as schemas
from backend.routers.auth_router import get_current_user, require_role, ADMIN
from backend.auth import get_password_hash

users_router = APIRouter(prefix="/api/users", tags=["users"])

@users_router.get("/", response_model=List[schemas.User])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN]))):
    return db.query(models.User).all()

@users_router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN]))):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Ce nom d'utilisateur existe déjà.")

    hashed_password = get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@users_router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user_update: dict, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN]))):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    # Prevent removing the last admin's admin rights
    if user.role == ADMIN and user_update.get("role") != ADMIN:
        admin_count = db.query(models.User).filter(models.User.role == ADMIN).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Impossible de retirer les droits du dernier Administrateur.")

    if "username" in user_update:
        # Check if the new username already exists on a different user
        existing = db.query(models.User).filter(models.User.username == user_update["username"], models.User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ce nom d'utilisateur existe déjà.")
        user.username = user_update["username"]

    if "role" in user_update:
        user.role = user_update["role"]

    if "password" in user_update and user_update["password"]:
        user.hashed_password = get_password_hash(user_update["password"])

    db.commit()
    db.refresh(user)
    return user

@users_router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_role([ADMIN]))):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    if user.role == ADMIN:
        admin_count = db.query(models.User).filter(models.User.role == ADMIN).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Impossible de supprimer le dernier Administrateur.")

    db.delete(user)
    db.commit()
    return {"status": "success", "message": "Utilisateur supprimé"}
