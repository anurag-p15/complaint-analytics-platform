from pathlib import Path
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
from dotenv import load_dotenv
import os
from google import genai
from typing import List, Dict, Optional
import json
import time
from concurrent.futures import ThreadPoolExecutor

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


# ================= SIMPLE CHUNKING =================
def create_chunks(complaints: List[str], chunk_size: int = 100) -> List[List[str]]:
    """Split complaints into smaller chunks"""
    chunks = []
    for i in range(0, len(complaints), chunk_size):
        chunk = complaints[i:i + chunk_size]
        if chunk:
            chunks.append(chunk)
    return chunks


# ================= SIMPLIFIED PROMPTS =================
def get_chunk_issues_prompt(product: str, chunk_complaints: List[str]) -> str:
    """Ultra-simple prompt to ensure complete JSON"""
    
    complaints_text = "\n\n".join(chunk_complaints)
    
    return f"""Extract exactly 3 operational issues from these {product} complaints.

Return ONLY this JSON format with no other text:
{{"issues":["issue 1","issue 2","issue 3"]}}

Each issue must be 20-30 words describing a root problem.

Complaints:
{complaints_text}"""


def get_final_prompt(product: str, all_issues: List[str]) -> str:
    """Generate final 4 issues and 4 actions"""
    
    issues_text = "\n".join([f"- {issue}" for issue in all_issues[:10]])
    
    return f"""Based on these issues from {product} complaints, create:
1. 4 key problems (synthesized from the issues)
2. 4 recommended actions

Return ONLY this JSON format:
{{
    "key_issues": ["issue 1","issue 2","issue 3","issue 4"],
    "actions": ["action 1","action 2","action 3","action 4"]
}}

Each item: 20-30 words.

Issues to analyze:
{issues_text}"""


# ================= SIMPLE GEMINI CALL =================
def call_gemini_simple(prompt: str, retries=3) -> Optional[str]:
    """Simple Gemini call with no JSON parsing"""
    
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config={
                    "temperature": 0.2,
                    "max_output_tokens": 2048,
                    "top_p": 0.9,
                }
            )
            
            text = response.candidates[0].content.parts[0].text.strip()
            
            # Extract JSON from response (in case model adds text)
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json_match.group()
            
            return text
            
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            time.sleep(1)
    
    return None


def extract_issues_from_chunk(prompt: str) -> List[str]:
    """Extract issues from a chunk with multiple fallbacks"""
    
    response_text = call_gemini_simple(prompt)
    
    if not response_text:
        return []
    
    # Try to parse as JSON
    try:
        data = json.loads(response_text)
        if isinstance(data, dict):
            if "issues" in data:
                return data["issues"]
            elif isinstance(data.get("chunk_issues"), list):
                return data["chunk_issues"]
            elif isinstance(data.get("issues"), list):
                return data["issues"]
    except:
        pass
    
    # If JSON parsing fails, extract quoted strings
    quotes = re.findall(r'"([^"]*)"', response_text)
    if quotes:
        return [q for q in quotes if len(q.split()) > 5][:3]
    
    # Last resort: split by lines and take meaningful lines
    lines = response_text.split('\n')
    issues = []
    for line in lines:
        line = line.strip()
        if line and len(line.split()) > 5 and not line.startswith('{') and not line.startswith('}'):
            clean = re.sub(r'[\[\],]', '', line)
            issues.append(clean)
        if len(issues) >= 3:
            break
    
    return issues[:3]


def process_chunk(args):
    """Process a single chunk"""
    chunk_id, chunk, product = args
    
    print(f"Processing chunk {chunk_id} ({len(chunk)} complaints)")
    
    prompt = get_chunk_issues_prompt(product, chunk)
    issues = extract_issues_from_chunk(prompt)
    
    print(f"  → Got {len(issues)} issues")
    return issues


# ================= MAIN FUNCTION =================
def generate_summary(product: str, complaints: List[str]) -> Dict:
    """Generate summary using ultra-simple approach"""
    
    # Clean complaints
    cleaned = [clean_text(c) for c in complaints if len(c.split()) > 5]
    cleaned = cleaned[:50]  # Use fewer complaints
    
    if len(cleaned) < 5:
        raise HTTPException(400, "Not enough complaints")
    
    # Create small chunks
    chunks = create_chunks(cleaned, chunk_size=100)
    print(f"\nCreated {len(chunks)} chunks")
    
    # Process chunks
    all_issues = []
    chunk_args = [(i, chunk, product) for i, chunk in enumerate(chunks)]
    
    with ThreadPoolExecutor(max_workers=2) as executor:
        results = executor.map(process_chunk, chunk_args)
        for issues in results:
            all_issues.extend(issues)
    
    if not all_issues:
        # Fallback issues
        all_issues = [
            f"Data verification failures in {product} processes",
            f"Inadequate dispute resolution for {product} issues",
            f"Poor communication between {product} stakeholders",
            f"Systemic data quality problems in {product} reporting",
            f"Delayed updates after {product} resolution"
        ]
    
    # Get final synthesis
    final_prompt = get_final_prompt(product, all_issues)
    final_response = call_gemini_simple(final_prompt)
    
    # Parse final response
    key_issues = []
    actions = []
    
    if final_response:
        try:
            data = json.loads(final_response)
            key_issues = data.get("key_issues", [])
            actions = data.get("actions", [])
        except:
            # Extract from text
            issues_match = re.search(r'key_issues["\s]*:["\s]*\[(.*?)\]', final_response, re.DOTALL)
            if issues_match:
                issues_text = issues_match.group(1)
                key_issues = [i.strip('" ') for i in issues_text.split(',') if i.strip()]
            
            actions_match = re.search(r'actions["\s]*:["\s]*\[(.*?)\]', final_response, re.DOTALL)
            if actions_match:
                actions_text = actions_match.group(1)
                actions = [a.strip('" ') for a in actions_text.split(',') if a.strip()]
    
    # Ensure we have 4 each
    while len(key_issues) < 4:
        key_issues.append(f"Operational issue requiring attention in {product}")
    while len(actions) < 4:
        actions.append(f"Implement systematic review of {product} processes")
    
    key_issues = key_issues[:4]
    actions = actions[:4]
    
    return {
        "key_issues": key_issues,
        "recommended_actions": actions
    }


# ================= ROUTE =================
@router.post("/generate-summary")
def generate_summary_endpoint(req: SummaryRequest):
    
    product = req.product.strip()
    print(f"\n=== Generating summary for: {product} ===")
    
    # Load data
    if not COMPLAINTS_CSV.exists():
        raise HTTPException(404, "Complaints file not found")
    
    df = pd.read_csv(COMPLAINTS_CSV)
    df["Product"] = df["Product"].astype(str).str.strip()
    df = df[df["Product"].str.lower() == product.lower()]
    df = df.dropna(subset=["Consumer complaint narrative"])
    
    if len(df) == 0:
        raise HTTPException(400, f"No complaints found for {product}")
    
    complaints = df["Consumer complaint narrative"].tolist()
    print(f"Found {len(complaints)} complaints")
    
    # Generate summary
    result = generate_summary(product, complaints)
    
    # Save to CSV
    key_issues_str = " | ".join(result["key_issues"])
    actions_str = " | ".join(result["recommended_actions"])
    
    new_row = pd.DataFrame([{
        "product_category": product,
        "Key_Issues": key_issues_str,
        "Recommended_Actions": actions_str
    }])
    
    if SUMMARY_CSV.exists():
        summary_df = pd.read_csv(SUMMARY_CSV)
        summary_df = summary_df[summary_df["product_category"].str.lower() != product.lower()]
        summary_df = pd.concat([summary_df, new_row], ignore_index=True)
    else:
        summary_df = new_row
    
    summary_df.to_csv(SUMMARY_CSV, index=False)
    
    return {
        "product": product,
        "Key_Issues": result["key_issues"],
        "Recommended_Actions": result["recommended_actions"]
    }