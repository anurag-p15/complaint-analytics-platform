from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- FIX: Add both localhost and 127.0.0.1 to CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# IMPORT ROUTERS AFTER CORS
from app.auth.login import router as login_router
from app.routes.complaints import router as complaint_router
from app.routes.feedback import router as feedback_router
from app.routes.admin_complaints import router as admin_router
from app.routes.resolved import router as resolved_router

app.include_router(feedback_router)
app.include_router(login_router)
app.include_router(complaint_router)
app.include_router(admin_router)
app.include_router(resolved_router)