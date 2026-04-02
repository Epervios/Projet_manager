from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import backend.models as models
from backend.config import load_config, save_config
from backend.auth import get_password_hash
from pydantic import BaseModel

system_router = APIRouter(prefix="/api/system", tags=["system"])

class SetupExistingPath(BaseModel):
    path: str

class SetupNewPath(BaseModel):
    path: str
    admin_username: str
    admin_password: str

@system_router.get("/status/")
def get_system_status():
    config = load_config()
    db_path = config.get("database_url", "sqlite:///./database/projet_manager.db")

    # Check if we can connect and if an admin exists
    try:
        temp_engine = create_engine(db_path)
        with temp_engine.connect() as conn:
            # Check if users table exists and has an admin
            SessionLocal = sessionmaker(bind=temp_engine)
            db = SessionLocal()
            try:
                admin_count = db.query(models.User).filter(models.User.role == "Administrateur").count()
                db.close()
                if admin_count > 0:
                    return {"status": "ok", "message": "Base de données valide et configurée."}
            except Exception:
                db.close()
                pass # Table doesn't exist
    except Exception:
        pass

    return {"status": "unconfigured", "message": "Base de données introuvable ou invalide."}

@system_router.post("/setup_existing/")
def setup_existing_db(payload: SetupExistingPath):
    status_check = get_system_status()
    if status_check["status"] == "ok":
        raise HTTPException(status_code=400, detail="L'application est déjà configurée.")

    path = payload.path
    if not path:
        raise HTTPException(status_code=400, detail="Chemin invalide.")

    url = f"sqlite:///{path}"

    try:
        temp_engine = create_engine(url)
        SessionLocal = sessionmaker(bind=temp_engine)
        db = SessionLocal()
        try:
            admin_count = db.query(models.User).filter(models.User.role == "Administrateur").count()
            if admin_count == 0:
                raise Exception("Aucun administrateur trouvé.")
        except Exception as e:
            raise HTTPException(status_code=400, detail="La base spécifiée ne semble pas être une base Projet Manager valide.")
        finally:
            db.close()

        config = load_config()
        config["database_url"] = url
        save_config(config)
        return {"status": "success", "message": "Base connectée avec succès. Redémarrez le backend pour appliquer."}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Impossible de se connecter : {str(e)}")

@system_router.post("/setup_new/")
def setup_new_db(payload: SetupNewPath):
    status_check = get_system_status()
    if status_check["status"] == "ok":
        raise HTTPException(status_code=400, detail="L'application est déjà configurée.")

    path = payload.path
    if not path or not payload.admin_username or len(payload.admin_password) < 4:
        raise HTTPException(status_code=400, detail="Données invalides. Le mot de passe doit faire au moins 4 caractères.")

    dir_path = os.path.dirname(path)
    if dir_path and not os.path.exists(dir_path):
        try:
            os.makedirs(dir_path, exist_ok=True)
        except Exception:
            raise HTTPException(status_code=400, detail=f"Impossible de créer le dossier : {dir_path}")

    url = f"sqlite:///{path}"

    try:
        temp_engine = create_engine(url)
        models.Base.metadata.create_all(bind=temp_engine)

        SessionLocal = sessionmaker(bind=temp_engine)
        db = SessionLocal()

        hashed_pw = get_password_hash(payload.admin_password)
        db.add(models.User(username=payload.admin_username, hashed_password=hashed_pw, role="Administrateur"))

        categories = ["Projet comité", "Projet Cap", "Projet GEM", "Projet Spontis", "Projet Services-Div", "Projet TeCo"]
        for cat_name in categories:
            db.add(models.ProjectCategory(name=cat_name))

        db.commit()
        db.close()

        config = load_config()
        config["database_url"] = url
        save_config(config)

        return {"status": "success", "message": "Base créée avec succès. Redémarrez le backend pour appliquer."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de la création : {str(e)}")
