from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd
import requests
import os
import time

from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent
COMPLAINTS_CSV = BASE_DIR / "data" / "complaints.csv"

HF_TOKEN = os.getenv("HF_API_TOKEN")
HF_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}

def get_sentiment(text: str):
    """Get sentiment with better error handling and fallback"""
    
    if not HF_TOKEN:
        print("WARNING: HF_API_TOKEN not found in environment variables")
        # Return default sentiment instead of failing
        return "neutral", 0.5
    
    try:
        payload = {"inputs": text}
        
        response = requests.post(
            HF_URL, 
            headers=HEADERS, 
            json=payload, 
            timeout=30  # Increased timeout
        )
        
        # Handle model loading state
        if response.status_code == 503:
            print("Model is loading, waiting 5 seconds...")
            time.sleep(5)
            # Retry once
            response = requests.post(
                HF_URL, 
                headers=HEADERS, 
                json=payload, 
                timeout=30
            )
        
        if response.status_code != 200:
            print(f"Hugging Face API error: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            # Return default sentiment instead of failing
            return "neutral", 0.5
        
        result = response.json()
        
        # Handle different response formats
        if isinstance(result, list) and len(result) > 0:
            if isinstance(result[0], list):
                scores = result[0]
            else:
                scores = result
        else:
            scores = result
            
        best = max(scores, key=lambda x: x["score"])
        return best["label"], best["score"]
        
    except requests.exceptions.Timeout:
        print("Hugging Face API timeout")
        return "neutral", 0.5
    except requests.exceptions.ConnectionError:
        print("Hugging Face API connection error")
        return "neutral", 0.5
    except Exception as e:
        print(f"Unexpected error in sentiment API: {str(e)}")
        return "neutral", 0.5

@router.post("/submit-feedback")
def submit_feedback(data: dict):
    complaint_id = data["complaint_id"]
    feedback = data["feedback"]
    rating = data["rating"]
    
    if not COMPLAINTS_CSV.exists():
        raise HTTPException(404, "Complaints file not found")
    
    df = pd.read_csv(COMPLAINTS_CSV)
    
    # Convert both to strings for comparison
    df['Complaint ID'] = df['Complaint ID'].astype(str).str.strip()
    mask = df["Complaint ID"] == str(complaint_id).strip()
    
    if not mask.any():
        raise HTTPException(404, f"Complaint not found with ID: {complaint_id}")
    
    # ---- SENTIMENT with fallback ----
    try:
        label, score = get_sentiment(feedback)
        print(f"Sentiment result: {label}, {score}")
    except Exception as e:
        print(f"Sentiment analysis failed, using defaults: {str(e)}")
        label = "neutral"
        score = 0.5
    
    # ---- UPDATE CSV ----
    df.loc[mask, "Feedback Text"] = feedback
    df.loc[mask, "Rating"] = rating
    df.loc[mask, "Sentiment_Feedback_Label"] = label
    df.loc[mask, "Sentiment_Feedback_Score"] = score
    
    df.to_csv(COMPLAINTS_CSV, index=False)
    
    # Update consumer.csv
    CONSUMER_CSV = BASE_DIR / "data" / "consumer.csv"
    if CONSUMER_CSV.exists():
        try:
            consumer_df = pd.read_csv(CONSUMER_CSV)
            user_id = df.loc[mask, "UserId"].iloc[0]
            user_feedback = df[(df["UserId"] == user_id) & (df["Feedback Text"].notna())]
            
            if not user_feedback.empty:
                ratings = pd.to_numeric(user_feedback["Rating"], errors="coerce")
                sentiments = pd.to_numeric(user_feedback["Sentiment_Feedback_Score"], errors="coerce")
                
                avg_rating = ratings.mean() if not pd.isna(ratings.mean()) else 0
                avg_sentiment = sentiments.mean() if not pd.isna(sentiments.mean()) else 0
                variance = sentiments.var() if not pd.isna(sentiments.var()) else 0
                
                consumer_df.loc[consumer_df["UserId"] == user_id, "average_feedback_score"] = round(avg_rating, 3)
                consumer_df.loc[consumer_df["UserId"] == user_id, "average_feedback_sentiment"] = round(avg_sentiment, 4)
                consumer_df.loc[consumer_df["UserId"] == user_id, "feedback_variance"] = round(variance, 4)
                
                consumer_df.to_csv(CONSUMER_CSV, index=False)
        except Exception as e:
            print(f"Error updating consumer.csv: {str(e)}")
    
    return {
        "status": "ok",
        "sentiment": label,
        "score": score,
        "message": "Feedback submitted successfully"
    }