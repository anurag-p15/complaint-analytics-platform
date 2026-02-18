from pathlib import Path
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
from dotenv import load_dotenv
import os
import google.generativeai as genai

# ================= LOAD ENV =================
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / "app" / "config" / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in .env")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(GEMINI_MODEL)

# ================= PATHS =================
BASE2_DIR = Path(__file__).resolve().parent.parent
COMPLAINTS_CSV = BASE2_DIR / "data" / "complaints.csv"
SUMMARY_CSV = BASE2_DIR / "data" / "summary.csv"

router = APIRouter()

# ================= REQUEST MODEL =================
class SummaryRequest(BaseModel):
    product: str


# ================= CLEAN TEXT =================
def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""

    text = re.sub(r"\bX+\b", " ", text)
    text = re.sub(r"\b(FCRA|FDCPA|CFPB|USC)\b", " ", text, flags=re.I)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ================= PROMPT =================
def build_prompt(product, complaints_text):
    return f"""
You are acting as a business analyst reviewing customer feedback.

Context:
The following text contains multiple cleaned customer complaints related to the product category "{product}".

Customer Complaints:
{complaints_text}

Task:
1. Identify recurring operational and service issues.
2. Rewrite them in clear professional business language.
3. Do NOT include legal language or names.
4. Do NOT mention individual complaints.

Output Format:

Key Issues:
- 3-4 concise bullet points

Recommended Actions:
- 3-4 concise bullet points
"""


# ================= OUTPUT PARSER =================
def split_summary(text):
    key_match = re.search(r"Key Issues:(.*?)(Recommended Actions:|$)", text, re.S)
    rec_match = re.search(r"Recommended Actions:(.*)", text, re.S)

    key_issues = key_match.group(1).strip() if key_match else ""
    recommended = rec_match.group(1).strip() if rec_match else ""

    return key_issues, recommended


def normalize_bullets(text):
    lines = [
        re.sub(r"^[-•\d.\s]+", "", l).strip()
        for l in text.split("\n") if l.strip()
    ]
    return " | ".join(lines)


# ================= GEMINI CALL =================
def call_gemini(prompt: str) -> str:
    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "max_output_tokens": 900,
                "top_p": 0.9,
            }
        )

        if not response or not response.text:
            raise Exception("Empty Gemini response")

        return response.text.strip()

    except Exception as e:
        raise HTTPException(500, f"Gemini API error → {str(e)}")


# ================= ROUTE =================
@router.post("/generate-summary")
def generate_summary(req: SummaryRequest):

    product = req.product.strip()

    if not COMPLAINTS_CSV.exists():
        raise HTTPException(404, "Complaints file not found")

    df = pd.read_csv(COMPLAINTS_CSV)
    df["Product"] = df["Product"].astype(str).str.strip()

    df = df[df["Product"].str.lower() == product.lower()]
    df = df.dropna(subset=["Consumer complaint narrative"])
    df = df[df["Consumer complaint narrative"].astype(str).str.strip() != ""]

    if len(df) < 20:
        raise HTTPException(400, "Not enough complaints")

    complaints = df["Consumer complaint narrative"].tolist()
    cleaned = [
        clean_text(c) for c in complaints
        if len(str(c).split()) > 20
    ]

    if len(cleaned) < 20:
        raise HTTPException(400, "Not enough meaningful complaints")

    # ---------- LIMIT INPUT SIZE ----------
    # To avoid token overflow, cap at 300 complaints
    cleaned = cleaned[:300]

    complaints_text = "\n\n".join(cleaned)

    # ---------- SINGLE FINAL CALL ----------
    final_summary = call_gemini(build_prompt(product, complaints_text))

    key_issues, recommended = split_summary(final_summary)

    # ---------- SAVE ----------
    new_row = pd.DataFrame([{
        "product_category": product,
        "Key_Issues": normalize_bullets(key_issues),
        "Recommended_Actions": normalize_bullets(recommended)
    }])

    if SUMMARY_CSV.exists():
        summary_df = pd.read_csv(SUMMARY_CSV)
        summary_df = summary_df[
            summary_df["product_category"].str.lower() != product.lower()
        ]
        summary_df = pd.concat([summary_df, new_row], ignore_index=True)
    else:
        summary_df = new_row

    summary_df.to_csv(SUMMARY_CSV, index=False)

    return {
        "product": product,
        "Key_Issues": key_issues,
        "Recommended_Actions": recommended
    }
