from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd
from datetime import datetime
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

   
    df["Complaint ID"] = df["Complaint ID"].astype(str)
    complaint_id = str(complaint_id)

    row_index = df[df["Complaint ID"] == complaint_id].index

    if len(row_index) == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")

    df.loc[row_index, "Resolved"] = "Yes"

    current_time = datetime.now().strftime("%d-%m-%Y")
    print(current_time)

    df.loc[row_index, "Resolved Date"] = current_time

    df.to_csv(COMPLAINTS_CSV, index=False)
    
    CONSUMER_CSV = BASE_DIR / "data" / "consumer.csv"

    if CONSUMER_CSV.exists():
        try:
            consumer_df = pd.read_csv(CONSUMER_CSV)

            # Get user id of this complaint
            user_id = df.loc[row_index, "UserId"].iloc[0]

            user_complaints = df[df["UserId"] == user_id]

            total_complaints = len(user_complaints)
            resolved_count = len(user_complaints[user_complaints["Resolved"] == "Yes"])

            resolution_rate = (
                resolved_count / total_complaints
                if total_complaints > 0 else 0
            )

            consumer_df.loc[
                consumer_df["UserId"] == user_id,
                "Resolution_Rate"
            ] = round(resolution_rate, 4)

            consumer_df.to_csv(CONSUMER_CSV, index=False)

        except Exception as e:
            print(f"Error updating resolution rate: {str(e)}")

    return {
        "message": "Complaint marked as resolved",
        "resolution_rate_updated": True
    }
