from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd
from fastapi.encoders import jsonable_encoder
import numpy as np
router = APIRouter() 
BASE_DIR = Path(__file__).resolve().parent.parent 
COMPLAINTS_CSV = BASE_DIR / "data" / "complaints.csv"
# MARK AS RESOLVED
# ==============================
@router.put("/mark-resolved/{complaint_id}")
def mark_resolved(complaint_id: str):

    if not COMPLAINTS_CSV.exists():
        raise HTTPException(status_code=404, detail="File not found")

    df = pd.read_csv(COMPLAINTS_CSV)

    # ✅ Use EXACT SAME COLUMN NAME everywhere
    df["Complaint ID"] = df["Complaint ID"].astype(str)
    complaint_id = str(complaint_id)

    row_index = df[df["Complaint ID"] == complaint_id].index

    if len(row_index) == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")

    df.loc[row_index, "Resolved"] = "Yes"

    df.to_csv(COMPLAINTS_CSV, index=False)

    return {"message": "Complaint marked as resolved"}
