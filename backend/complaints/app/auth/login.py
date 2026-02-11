from fastapi import APIRouter, HTTPException
import pandas as pd
from app.models.schemas import LoginRequest

router = APIRouter()
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CONSUMER_CSV = BASE_DIR / "data" / "consumer.csv"


@router.post("/login")
def login_user(payload: LoginRequest):

    name = payload.name.strip().lower()
    email = payload.email.strip().lower()

    # ADMIN
    if name == "admin" and email == "admin@abc.in":
        return {"role": "admin"}

    consumer_df = pd.read_csv(CONSUMER_CSV)

    match = consumer_df[
        (consumer_df["User_name"].str.lower() == name) &
        (consumer_df["User_email"].str.lower() == email)
    ]

    if not match.empty:
        return {"role": "user"}

    raise HTTPException(401, "Invalid credentials")
