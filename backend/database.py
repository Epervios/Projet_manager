from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

from backend.config import load_config

config = load_config()
DATABASE_URL = config.get("database_url", "sqlite:///./database/projet_manager.db")

# Create database engine
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_engine():
    return engine

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
