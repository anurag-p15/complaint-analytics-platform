from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ===== LOAD DATASET ON STARTUP =====
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CONSUMER_CSV = os.path.join(BASE_DIR, "data", "consumer.csv")

try:
    consumer_df = pd.read_csv(CONSUMER_CSV)
except:
    consumer_df = pd.DataFrame()


# ===== REQUEST MODEL =====
class LoginRequest(BaseModel):
    name: str
    email: str


# ===== LOGIN API =====
@app.post("/login")
def login_user(payload: LoginRequest):

    name = payload.name.strip().lower()
    email = payload.email.strip().lower()

    # ---- ADMIN CHECK ----
    if name == "admin" and email == "admin@abc.in":
        return {
            "role": "admin",
            "message": "Admin login successful"
        }
    consumer_df=pd.read_csv(CONSUMER_CSV)

    # ---- USER CHECK ----
    if not consumer_df.empty:

        match = consumer_df[
            (consumer_df["User_name"].str.lower() == name) &
            (consumer_df["User_email"].str.lower() == email)
        ]

        if not match.empty:
            return {
                "role": "user",
                "message": "User login successful"
            }

    # ---- INVALID ----
    raise HTTPException(
        status_code=401,
        detail="Invalid credentials"
    )
