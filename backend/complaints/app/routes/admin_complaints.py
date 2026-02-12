from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd
from fastapi.encoders import jsonable_encoder
import numpy as np

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent
COMPLAINTS_CSV = BASE_DIR / "data" / "complaints.csv"

# GET ALL COMPLAINTS (ADMIN)
# ==============================
@router.get("/admin-complaints")
def get_all_complaints():

    if not COMPLAINTS_CSV.exists():
        return []

    df = pd.read_csv(COMPLAINTS_CSV)

    # 🔥 FORCE CLEAN EVERYTHING
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.replace({np.nan: None})

    # Convert Complaint Id properly
    if "Complaint ID" in df.columns:
        df["Complaint ID"] = df["Complaint ID"].astype(str)

    data = df.to_dict(orient="records")

    # 🔥 THIS LINE SOLVES IT COMPLETELY
    return jsonable_encoder(data)
