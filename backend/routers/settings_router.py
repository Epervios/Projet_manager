from fastapi import APIRouter, Depends, HTTPException
import os
from sqlalchemy import create_engine
import backend.models as models
from backend.routers.auth_router import get_current_user, require_role, ADMIN
from backend.config import load_config, save_config
from backend.auth import get_password_hash

settings_router = APIRouter(prefix="/api/settings", tags=["settings"])

@settings_router.get("/db/")
def get_db_settings(current_user: models.User = Depends(require_role([ADMIN]))):
    config = load_config()
    db_path = config.get("database_url", "sqlite:///./database/projet_manager.db")
    # Convert back to regular path for display
    if db_path.startswith("sqlite:///"):
        display_path = db_path.replace("sqlite:///", "")
    else:
        display_path = db_path
    return {"path": display_path}

@settings_router.post("/db/test/")
def test_db_connection(payload: dict, current_user: models.User = Depends(require_role([ADMIN]))):
    path = payload.get("path")
    if not path:
        raise HTTPException(status_code=400, detail="Le chemin est invalide.")

    url = f"sqlite:///{path}"

    try:
        # Just try creating an engine and connecting
        temp_engine = create_engine(url)
        with temp_engine.connect() as conn:
            pass
        return {"status": "success", "message": "Connexion réussie"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Base inaccessible ou dossier inexistant : {str(e)}")

@settings_router.put("/db/")
def update_db_settings(payload: dict, current_user: models.User = Depends(require_role([ADMIN]))):
    path = payload.get("path")
    if not path:
        raise HTTPException(status_code=400, detail="Chemin invalide.")

    url = f"sqlite:///{path}"
    config = load_config()
    config["database_url"] = url
    save_config(config)

    return {"status": "success", "message": "Chemin sauvegardé. Un redémarrage du backend est nécessaire."}

@settings_router.post("/db/init/")
def init_db(payload: dict, current_user: models.User = Depends(require_role([ADMIN]))):
    path = payload.get("path")
    if not path:
        raise HTTPException(status_code=400, detail="Chemin invalide.")

    # Ensure directory exists if it's a file path
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

        # Seed basic data
        from sqlalchemy.orm import sessionmaker
        SessionLocal = sessionmaker(bind=temp_engine)
        db = SessionLocal()

        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            hashed_pw = get_password_hash("admin")
            db.add(models.User(username="admin", hashed_password=hashed_pw, role="Administrateur"))

        categories = ["Projet comité", "Projet Cap", "Projet GEM", "Projet Spontis", "Projet Services-Div", "Projet TeCo"]
        for cat_name in categories:
            if not db.query(models.ProjectCategory).filter(models.ProjectCategory.name == cat_name).first():
                db.add(models.ProjectCategory(name=cat_name))

        db.commit()
        db.close()

        return {"status": "success", "message": "Base initialisée avec succès."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de l'initialisation : {str(e)}")
