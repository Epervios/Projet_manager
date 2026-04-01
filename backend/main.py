from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import backend.models as models
from backend.database import engine
from backend.routers import api

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Projet Manager API", description="API pour la gestion de portefeuille projets interne")

# CORS middleware for local development if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router)
app.include_router(api.category_router)
app.include_router(api.milestone_router)
app.include_router(api.meeting_router)
app.include_router(api.decision_router)
app.include_router(api.task_router)
app.include_router(api.document_router)
app.include_router(api.dashboard_router)

@app.get("/api/ping")
def ping():
    return {"status": "ok"}

# Serve the static files
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")
