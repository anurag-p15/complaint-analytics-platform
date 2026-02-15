from click import Path
from app.routes.update_consumer import update_consumer
from fastapi import APIRouter
import pandas as pd
import numpy as np
from datetime import datetime
import joblib
import os
import requests
from nrclex import NRCLex
from pathlib import Path

router = APIRouter()

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent  
env_path = BASE_DIR / "app" / "config" / ".env"

load_dotenv(dotenv_path=env_path)
HF_TOKEN = os.getenv("HF_TOKEN")
print("HF TOKEN:", HF_TOKEN)

# Files and models
BASE_DIR = Path(__file__).resolve().parent.parent
CONSUMER_FILE = BASE_DIR / "data" / "consumer.csv"
COMPLAINT_FILE = BASE_DIR / "data" / "complaints.csv"
model = joblib.load(BASE_DIR / "models" / "classification_model.joblib")
label_encoder = joblib.load(BASE_DIR / "models" / "label_encoder.joblib")

# ---------------- SENTIMENT ---------------- #
def get_sentiment(text):
    HF_URL = "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest"
    headers = {"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"}
    response = requests.post(HF_URL, headers=headers, json={"inputs": text}, timeout=30)
    
    if response.status_code != 200:
        return "LABEL_1", 0.0, 0.0

    data = response.json()
    result = data[0]
    top = max(result, key=lambda x: x["score"])
    label = top["label"]
    score = top["score"]

    signed = 0.0
    if label == "LABEL_0":
        signed = -score
    elif label == "LABEL_2":
        signed = score

    return label, score, signed

# ---------------- EMBEDDING ---------------- #
from sentence_transformers import SentenceTransformer
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(product: str, subproduct: str, issue: str, complaint: str):
    # Each field separately encoded and concatenated
    emb_product = embed_model.encode(product)
    emb_subproduct = embed_model.encode(subproduct)
    emb_issue = embed_model.encode(issue)
    emb_complaint = embed_model.encode(complaint)
    combined_embedding = np.concatenate([emb_product, emb_subproduct, emb_issue, emb_complaint])
    return combined_embedding  # shape matches model input

# ---------------- KEYWORDS ---------------- #
def extract_keywords(text):
    words = text.split()
    return list(set(words))[:5]

# ---------------- AGGRESSIVENESS ---------------- #
AGGRESSIVE_WORDS = [
    "fraud","scam","criminal","theft","illegal","lawsuit","sue",
    "court","harassment","threat","unacceptable","worst",
    "final warning","refund now","resolve this now"
]

def aggressiveness_score(text):
    text_lower = text.lower()
    keyword_hits = sum(word in text_lower for word in AGGRESSIVE_WORDS)
    keyword_score = min(keyword_hits / 5, 1.0)
    capitals = sum(1 for c in text if c.isupper())
    capital_ratio = capitals / max(len(text), 1)
    capital_score = min(capital_ratio * 5, 1.0)
    exclamations = text.count("!")
    exclamation_score = min(exclamations / 3, 1.0)
    aggression = 0.5 * keyword_score + 0.3 * exclamation_score + 0.2 * capital_score
    return round(min(aggression, 1.0), 3)

# ---------------- NORMALIZATION ---------------- #
def normalize(score):
    return (score + 1) / 2

# ---------------- MAIN ROUTE ---------------- #
@router.post("/register-complaint")
def register_complaint(data: dict):
    df = pd.read_csv(COMPLAINT_FILE)

    # Map frontend keys to backend CSV column names
    product = data.get("product", "")
    subproduct = data.get("subproduct", "")
    issue = data.get("issue", "")
    company = data.get("company", "")
    state = data.get("state", "")
    zipcode = data.get("zipcode", "")
    complaint_text = data.get("complaint", "")
    user_id_value = data.get("userId")  # 🔑 match frontend key

    # Complaint length
    complaint_length = len(complaint_text.split())

    # Sentiment
    sent_label, sent_score, signed_sent = get_sentiment(complaint_text)

    # Emotions
    emotions = NRCLex(complaint_text).raw_emotion_scores

    # Keywords
    keywords = extract_keywords(complaint_text)

    # Embedding → Sub-issue
    embedding_vector = get_embedding(product, subproduct, issue, complaint_text).reshape(1, -1)
    probs = model.predict_proba(embedding_vector)[0]

    top_indices = probs.argsort()[::-1]
    top_scores = probs[top_indices]
    top_labels = label_encoder.inverse_transform(top_indices)

    best_label = top_labels[0]
    best_score = float(top_scores[0])

    second_score = float(top_scores[1])
    gap = best_score - second_score

    # 🔧 TUNABLE THRESHOLDS
    CONFIDENCE_THRESHOLD = 0.45
    GAP_THRESHOLD = 0.15

    if best_score < CONFIDENCE_THRESHOLD and gap < GAP_THRESHOLD:
        sub_issue_label = "Other"
    else:
        sub_issue_label = best_label

    # Aggression
    aggressive = aggressiveness_score(complaint_text)

    # Risk & escalation
    norm_sent = normalize(signed_sent)
    risk = 1 - norm_sent
    escalation = 0.65 * risk + 0.35 * aggressive
    if escalation < 0.5:
        escalation_label = "Low"
    elif escalation < 0.7:
        escalation_label = "Medium"
    else:
        escalation_label = "High"

    # Complaint ID
    complaint_id = int(df["Complaint ID"].max()) + 1 if not df.empty else 1
    date_now = datetime.now().strftime("%d-%m-%Y")

    # New row
    new_row = {
        "Date received": date_now,
        "Product": product,
        "Sub-product": subproduct,
        "Issue": issue,
        "Sub-issue": sub_issue_label,
        "Consumer complaint narrative": complaint_text,
        "Company": company,
        "State": state,
        "ZIP code": zipcode,
        "Complaint ID": complaint_id,
        "UserId": user_id_value,  # ✅ correctly stored
        "Complaint Length": complaint_length,
        "Sentiment_Complaint_Label": sent_label,
        "Sentiment_Complaint_Score": sent_score,
        "Aggressiveness_Score": aggressive,
        "Complaint_Keywords": keywords,
        "normalize sentiment": norm_sent,
        "Risk Score": risk,
        "EscalationRisk": escalation,
        "Escalation_label": escalation_label,
        "nrc_emotions": emotions,
        "Feedback Score": np.nan,
        "Sentiment_Feedback_Score": np.nan,
        "Resolved": np.nan
    }

    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    df.to_csv(COMPLAINT_FILE, index=False)

    # Update consumer file
    # Update consumer file
    update_consumer(new_complaint=new_row)


    return {
        "message": "Complaint registered successfully",
        "complaint_id": int(complaint_id),
        "escalation": escalation_label
    }
