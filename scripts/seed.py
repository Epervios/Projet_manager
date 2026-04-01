import sys
import os

# Add parent dir to path to import backend modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.orm import Session
from backend.database import engine, SessionLocal
from backend.models import Base, ProjectCategory, User

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

def seed_data():
    db: Session = SessionLocal()

    print("Seeding Users...")
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        admin_user = User(username="admin", role="Administrateur")
        db.add(admin_user)

    print("Seeding Project Categories...")
    categories = [
        "Projet comité",
        "Projet Cap",
        "Projet GEM",
        "Projet Spontis",
        "Projet Services-Div",
        "Projet TeCo"
    ]

    for cat_name in categories:
        existing_cat = db.query(ProjectCategory).filter(ProjectCategory.name == cat_name).first()
        if not existing_cat:
            cat = ProjectCategory(name=cat_name)
            db.add(cat)

    try:
        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_data()
