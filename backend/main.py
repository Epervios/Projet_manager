from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import backend.models as models
from backend.database import engine
from backend.routers import api, auth_router, settings_router

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Projet Manager API", description="API pour la gestion de portefeuille projets interne")

# CORS middleware for local intranet
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

app.include_router(auth_router.router)
app.include_router(api.router)
app.include_router(api.category_router)
app.include_router(api.milestone_router)
app.include_router(api.meeting_router)
app.include_router(api.decision_router)
app.include_router(api.task_router)
app.include_router(api.document_router)
app.include_router(api.dashboard_router)
app.include_router(settings_router.settings_router)

@app.get("/api/ping")
def ping():
    return {"status": "ok"}

# Serve the static files
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")
