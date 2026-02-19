from pathlib import Path
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
from dotenv import load_dotenv
import os
from google import genai

# ================= LOAD ENV =================
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / "app" / "config" / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=GEMINI_API_KEY)

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
You are a senior business analyst.

You are given a large set of real customer complaints for the product category: "{product}".

Each complaint represents a real operational failure.

YOUR GOAL:
Extract deep, recurring, business-level problem themes — NOT generic summaries.

STRICT INSTRUCTIONS:

Each bullet point MUST:
- be 18–30 words long
- describe the ROOT operational issue
- mention the affected process
- be written in professional business language
- be complete sentences

Key Issues:
- exactly 4 bullets

Recommended Actions:
- exactly 4 bullets
- each action must directly solve the matching issue
- must be specific and implementable
- complete sentences

Do not stop mid-sentence.

Customer Complaints:
{complaints_text}
"""


# ================= OUTPUT PARSER =================
def split_summary(text):

    text = clean_model_output(text)

    if "Recommended Actions:" not in text:
        raise HTTPException(500, "Structured sections missing")

    parts = text.split("Recommended Actions:")

    key_issues = parts[0].replace("Key Issues:", "").strip()
    actions = parts[1].strip()

    return key_issues, actions


def normalize_bullets(text):
    lines = [
        re.sub(r"^[-•\d.*\s]+", "", l).strip()
        for l in text.split("\n") if l.strip()
    ]
    return " | ".join(lines)

def clean_model_output(text: str) -> str:

    # Remove anything before "Key Issues:"
    key_index = text.find("Key Issues:")
    if key_index != -1:
        text = text[key_index:]

    # Remove markdown bold and extra symbols
    text = re.sub(r"\*\*", "", text)
    text = re.sub(r"\*", "", text)
    text = re.sub(r"#+", "", text)

    # Remove multiple blank lines
    text = re.sub(r"\n\s*\n", "\n", text)

    return text.strip()


# ================= GEMINI CALL =================
def call_gemini(prompt: str, retries=3):

    for _ in range(retries):

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={
                "temperature": 0.2,
                "max_output_tokens": 1800,
                "top_p": 0.9,
            }
        )

        try:
            text = response.candidates[0].content.parts[0].text.strip()
        except:
            text = ""

        # Only check structure presence (not ending character)
        if "Key Issues:" in text and "Recommended Actions:" in text:
            return text

    raise HTTPException(500, "Model returned incomplete structured output")


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

    if len(df) < 0:
        raise HTTPException(400, "Not enough complaints")

    complaints = df["Consumer complaint narrative"].tolist()

    cleaned = [
        clean_text(c) for c in complaints
        if len(str(c).split()) > 0
    ]

    if len(cleaned) < 0:
        raise HTTPException(400, "Not enough meaningful complaints")

    cleaned = cleaned[:120]

    complaints_text = "\n\n".join(cleaned)

    # ---------- MODEL CALL ----------
    final_summary = call_gemini(build_prompt(product, complaints_text))

    print("\n===== GEMINI RAW OUTPUT =====\n")
    print(final_summary)
    print("\n=============================\n")

    key_issues, actions = split_summary(final_summary)

    # ---------- SAVE ----------
    new_row = pd.DataFrame([{
        "product_category": product,
        "Key_Issues": normalize_bullets(key_issues),
        "Recommended_Actions": normalize_bullets(actions)
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
        "Recommended_Actions": actions
    }
