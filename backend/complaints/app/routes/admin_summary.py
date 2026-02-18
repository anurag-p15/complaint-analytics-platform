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


# ================= CHUNKING =================
def chunk_complaints(texts, chunk_size=100):
    return [
        "\n".join(f"{i+1}. {t}" for i, t in enumerate(texts[x:x + chunk_size]))
        for x in range(0, len(texts), chunk_size)
    ]


# ================= PROMPTS =================
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


def build_final_prompt(product, chunk_outputs):
    return f"""
You are a senior business analyst.

Below are partial analyses for product category "{product}":

{chr(10).join(chunk_outputs)}

Consolidate into final summary.

STRICT FORMAT:

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
    """
    Plug your Gemini API call here
    """
    raise NotImplementedError("Add Gemini call")


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


# ================= GENERATE SUMMARY =================
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
        raise HTTPException(400, "Not enough complaints for summarisation")

    complaints = df["Consumer complaint narrative"].tolist()

    cleaned = [clean_text(c) for c in complaints if len(str(c).split()) > 20]

    if len(cleaned) < 20:
        raise HTTPException(400, "Not enough meaningful complaints")

    # ---------- CHUNK ----------
    chunks = chunk_complaints(cleaned, 100)

    chunk_outputs = []

    for chunk in chunks:
        prompt = build_prompt(product, chunk)
        try:
            output = call_gemini(prompt)
            chunk_outputs.append(output)
        except Exception:
            continue

    if not chunk_outputs:
        raise HTTPException(500, "Gemini failed to generate chunk summaries")

    # ---------- FINAL SUMMARY ----------
    final_prompt = build_final_prompt(product, chunk_outputs)

    try:
        final_summary = call_gemini(final_prompt)
    except Exception:
        raise HTTPException(500, "Gemini failed to generate final summary")

    key_issues, recommended = split_summary(final_summary)

    # ---------- SAVE TO CSV ----------
    new_row = pd.DataFrame([{
        "product_category": product,
        "Key_Issues": normalize_bullets(key_issues),
        "Recommended_Actions": normalize_bullets(recommended)
    }])

    if SUMMARY_CSV.exists():
        summary_df = pd.read_csv(SUMMARY_CSV)
        summary_df["product_category"] = summary_df["product_category"].astype(str).str.strip()
        summary_df = summary_df[summary_df["product_category"].str.lower() != product.lower()]
        summary_df = pd.concat([summary_df, new_row], ignore_index=True)
    else:
        summary_df = new_row

    summary_df.to_csv(SUMMARY_CSV, index=False)

    return {
        "product": product,
        "Key_Issues": key_issues,
        "Recommended_Actions": recommended
    }
