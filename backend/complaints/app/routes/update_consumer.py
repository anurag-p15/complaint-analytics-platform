from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import pandas as pd
import numpy as np
from pathlib import Path
from fastapi import APIRouter

BASE_DIR = Path(__file__).resolve().parent.parent
CONSUMER_FILE = BASE_DIR / "data" / "consumer.csv"
COMPLAINT_FILE = BASE_DIR / "data" / "complaints.csv"

router=APIRouter()

def update_consumer(new_complaint=None):
    # ---------------- LOAD COMPLAINTS ---------------- #
    complaints = pd.read_csv(COMPLAINT_FILE)

    # Append new complaint if provided
    if new_complaint is not None:
        complaints = pd.concat([complaints, pd.DataFrame([new_complaint])], ignore_index=True)

    # Ensure date is datetime
    complaints["Date received"] = pd.to_datetime(complaints["Date received"], format="%d-%m-%Y")

    # Ensure numeric columns exist
    for col in ["Feedback Score", "Sentiment_Feedback_Score", "Aggressiveness_Score", "EscalationRisk"]:
        if col not in complaints.columns:
            complaints[col] = np.nan

    # Convert 'Resolved' to numeric: 1 = Yes, 0 = No, NaN → 0
    if "Resolved" in complaints.columns:
        complaints["Resolved_numeric"] = complaints["Resolved"].map({"Yes": 1, "No": 0}).fillna(0)
    else:
        complaints["Resolved_numeric"] = 0

    # ---------------- COMPUTE USER METRICS ---------------- #
    agg_funcs = {
        "Complaint Length": "mean",
        "Sentiment_Complaint_Score": ["mean", lambda x: x.var(ddof=0)],
        "Aggressiveness_Score": "mean",
        "EscalationRisk": "mean",
        "Feedback Score": ["mean", lambda x: x.var(ddof=0)],
        "Sentiment_Feedback_Score": "mean",
        "Resolved_numeric": lambda x: x.mean() * 100
    }

    user_metrics = complaints.groupby("UserId").agg(agg_funcs)
    # Flatten multi-index columns
    user_metrics.columns = [
        "Avg_Complaint_Length", "Avg_Sentiment_Score", "Sentiment_Variance",
        "Aggressive_Score", "Avg_Risk_Level",
        "Avg_Feedback_Score", "Feedback_Variance",
        "Average_Feedback_Sentiment", "Resolution_Rate"
    ][:len(user_metrics.columns)]

    # ---------------- EXTRA RATIOS ---------------- #
    complaints["is_high_severity"] = complaints["Escalation_label"].isin(["High", "Medium"]).astype(int)
    complaints["is_high_risk"] = (complaints["EscalationRisk"] >= 0.7).astype(int)

    user_extra = complaints.groupby("UserId").agg({
        "is_high_severity": "mean",
        "is_high_risk": "mean",
        "Date received": ["count", lambda x: (x.max() - x.min()).days if len(x) > 1 else 1]
    })
    user_extra.columns = ["High_Severity_Ratio", "High_Risk_Complaint_Ratio", "Total_Complaints", "Span_Days"]

    # Complaint Frequency Index
    user_extra["Complaint_Frequency_Index"] = (user_extra["Total_Complaints"] / (user_extra["Span_Days"] + 1)) * 30

    # Average days between complaints
    def avg_days(group):
        dates = group.sort_values()
        diffs = dates.diff().dt.days.dropna()
        return diffs.mean() if len(diffs) > 0 else np.nan

    avg_days_between = complaints.groupby("UserId")["Date received"].apply(avg_days)
    user_extra["Avg_Days_Between_Complaints"] = avg_days_between

    # ---------------- COMBINE METRICS ---------------- #
    user_df = pd.concat([user_metrics, user_extra], axis=1).reset_index()

    # ---------------- UPDATE CONSUMER CSV ---------------- #
    consumer = pd.read_csv(CONSUMER_FILE)
    for _, row in user_df.iterrows():
        uid = row["UserId"]
        for col in row.index:
            if col != "UserId" and col in consumer.columns:
                consumer.loc[consumer["UserId"] == uid, col] = row[col]

    # ---------------- USER RISK PROFILE ---------------- #
    def minmax(s):
        return (s - s.min()) / (s.max() - s.min() + 1e-9)

    consumer["risk_mm"] = minmax(consumer["Avg_Risk_Level"].fillna(consumer["Avg_Risk_Level"].median()))
    consumer["highrisk_mm"] = minmax(consumer["High_Risk_Complaint_Ratio"].fillna(0))
    consumer["aggr_mm"] = minmax(consumer["Aggressive_Score"].fillna(consumer["Aggressive_Score"].median()))
    consumer["sent_mm"] = minmax((-consumer["Avg_Sentiment_Score"]).fillna((-consumer["Avg_Sentiment_Score"]).median()))

    consumer["Composite_Risk_Score"] = (
        0.45 * consumer["risk_mm"] +
        0.25 * consumer["highrisk_mm"] +
        0.20 * consumer["aggr_mm"] +
        0.10 * consumer["sent_mm"]
    )

    q1, q2 = consumer["Composite_Risk_Score"].quantile([0.33, 0.66])
    def risk_cat(x):
        if x <= q1: return 1
        elif x <= q2: return 2
        else: return 3
    consumer["User_Risk_Profile"] = consumer["Composite_Risk_Score"].apply(risk_cat)

    consumer.drop(columns=["risk_mm","highrisk_mm","aggr_mm","sent_mm","Composite_Risk_Score"], inplace=True)

    # ---------------- CONDITIONAL CLUSTERING ---------------- #
    total_global = len(complaints)
    if total_global % 500 == 0:
        features = [
            "Total_Complaints","Avg_Complaint_Length","Avg_Sentiment_Score",
            "Sentiment_Variance","High_Severity_Ratio","Complaint_Frequency_Index",
            "Avg_Days_Between_Complaints","Aggressive_Score","Avg_Risk_Level",
            "High_Risk_Complaint_Ratio","Avg_Feedback_Score","Feedback_Variance",
            "Resolution_Rate","Average_Feedback_Sentiment","User_Risk_Profile"
        ]
        X = consumer[features].fillna(consumer[features].median())
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        consumer["Cluster_ID"] = kmeans.fit_predict(X_scaled)

        cluster_labels = {
            0: "Balanced users (moderate complaints, mixed sentiment, low escalation risk)",
            1: "Frequent dissatisfied users (higher complaint volume, mostly negative sentiment)",
            2: "High-risk escalators (high risk profile, aggressive tone, lower resolution)",
            3: "One-time intense cases (few complaints but highly negative; often resolved)"
        }
        consumer["Cluster_Profile"] = consumer["Cluster_ID"].map(cluster_labels)
        consumer.drop(columns=["Cluster_ID"], inplace=True)

    # Save updated consumer CSV
    consumer.to_csv(CONSUMER_FILE, index=False)
