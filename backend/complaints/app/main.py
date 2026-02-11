from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# IMPORT ROUTERS AFTER CORS
from app.auth.login import router as login_router
from app.routes.complaints import router as complaint_router

app.include_router(login_router)
app.include_router(complaint_router)
