import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import os

router = APIRouter()
BASE_DIR = Path(__file__).resolve().parent.parent
CONSUMER_FILE = BASE_DIR / "data" / "consumer.csv"

# ===== Request Schema =====
class RegisterUser(BaseModel):
    name: str
    age: int
    gender: str


# ===== Helper Functions =====

def generate_user_id(df):
    if df.empty:
        return 1
    return int(df["UserId"].max()) + 1


def generate_email(name: str, user_id: int):
    parts = name.strip().lower().split()

    if len(parts) == 1:
        first = parts[0]
        last = ""
    else:
        first = parts[0]
        last = parts[-1]

    if last:
        email = f"{first}.{last}{user_id}@example.com"
    else:
        email = f"{first}{user_id}@example.com"

    return email


# ===== API =====

@router.post("/register")
def register_user(user: RegisterUser):

    if not os.path.exists(CONSUMER_FILE):
        raise HTTPException(status_code=500, detail="consumer.csv not found")

    df = pd.read_csv(CONSUMER_FILE)

    # Generate new UserId
    new_user_id = generate_user_id(df)

    # Generate email
    email = generate_email(user.name, new_user_id)

    # Create new row (only base fields filled, rest NaN)
    new_row = {
        "UserId": new_user_id,
        "User_name": user.name,
        "User_email": email,
        "Age": user.age,
        "Gender": user.gender
    }

    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)

    df.to_csv(CONSUMER_FILE, index=False)

    return {
        "message": "User registered successfully",
        "User_name": user.name,
        "User_email": email,
        "UserId": new_user_id
    }
