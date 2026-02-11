from fastapi import APIRouter
from pathlib import Path
import pandas as pd
import numpy as np

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent
COMPLAINTS_CSV = BASE_DIR / "data" / "complaints.csv"
CONSUMER_CSV = BASE_DIR / "data" / "consumer.csv"


@router.get("/user-complaints/{email}")
def get_user_complaints(email: str):

    if not COMPLAINTS_CSV.exists() or not CONSUMER_CSV.exists():
        return []

    df = pd.read_csv(COMPLAINTS_CSV)
    consumer_df = pd.read_csv(CONSUMER_CSV)

    email = email.lower().strip()

    # ---- FIND USER IN CONSUMER ----
    user_row = consumer_df[
        consumer_df["User_email"].str.lower() == email
    ]

    if user_row.empty:
        return []

    # ---- GET USER ID ----
    user_id = str(user_row.iloc[0]["UserId"])

    # ---- FILTER COMPLAINTS ----
    user_df = df[df["UserId"].astype(str) == user_id]

    # ---- CLEAN EVERYTHING FOR JSON ----
    user_df = user_df.replace([np.inf, -np.inf], None)
    user_df = user_df.where(pd.notnull(user_df), None)

    # Convert all columns to string EXCEPT numbers
    for col in user_df.columns:
        user_df[col] = user_df[col].astype(str)

    return user_df.to_dict(orient="records")
