from pathlib import Path
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
from urllib.parse import unquote

# ================= CONFIG =================
BASE_DIR = Path(__file__).resolve().parent.parent
COMPLAINTS_CSV = BASE_DIR / "data" / "complaints.csv"
SUMMARY_CSV = BASE_DIR / "data" / "summary.csv"

router= APIRouter()
# ================= GET EXISTING SUMMARY =================
@router.get("/get-summary/{product}")
def get_summary(product: str):

    product = unquote(product).strip()

    if not SUMMARY_CSV.exists():
        raise HTTPException(404, "Summary file not found")

    df = pd.read_csv(SUMMARY_CSV)

    df["product_category"] = df["product_category"].astype(str).str.strip()

    row = df[df["product_category"].str.lower() == product.lower()]

    if row.empty:
        raise HTTPException(404, "Summary not found")

    return {
        "product": product,
        "Key_Issues": row.iloc[0]["Key_Issues"],
        "Recommended_Actions": row.iloc[0]["Recommended_Actions"]
    }
