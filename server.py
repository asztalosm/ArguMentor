"""
AI Socratic Examiner - FastAPI Backend
======================================
Azure Services Used:
  - Azure OpenAI: Debate responses + feedback report generation
  - Azure Text Analytics: Sentiment analysis of user arguments
  - Azure Speech (placeholder): Uncommented for voice input support
"""

import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AzureOpenAI
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

# ─────────────────────────────────────────────
# CONFIGURATION — loaded from environment vars
# ─────────────────────────────────────────────
AZURE_OPENAI_ENDPOINT         = os.getenv("AZURE_OPENAI_ENDPOINT", "")
AZURE_OPENAI_KEY              = os.getenv("AZURE_OPENAI_KEY", "")
AZURE_OPENAI_DEPLOYMENT_NAME  = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")
AZURE_TEXT_ANALYTICS_ENDPOINT = os.getenv("AZURE_TEXT_ANALYTICS_ENDPOINT", "")
AZURE_TEXT_ANALYTICS_KEY      = os.getenv("AZURE_TEXT_ANALYTICS_KEY", "")

# ─────────────────────────────────────────────
# AZURE CLIENT INITIALIZATION
# ─────────────────────────────────────────────
def get_openai_client() -> AzureOpenAI:
    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_KEY:
        raise HTTPException(status_code=500, detail="Azure OpenAI credentials not configured.")
    return AzureOpenAI(
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_key=AZURE_OPENAI_KEY,
        api_version="2024-02-01"
    )

def get_text_analytics_client() -> Optional[TextAnalyticsClient]:
    if not AZURE_TEXT_ANALYTICS_ENDPOINT or not AZURE_TEXT_ANALYTICS_KEY:
        return None  # gracefully degrade if not configured
    return TextAnalyticsClient(
        endpoint=AZURE_TEXT_ANALYTICS_ENDPOINT,
        credential=AzureKeyCredential(AZURE_TEXT_ANALYTICS_KEY)
    )

# ─────────────────────────────────────────────
# SYSTEM PROMPTS
# ─────────────────────────────────────────────
EXAMINER_SYSTEM_PROMPT = """
You are a strict but fair teacher conducting a Socratic examination.
Your role: expose weak reasoning, demand evidence, force precise thinking.

RULES:
- Respond with ONE focused challenge or question per turn. Never multiple.
- Be direct. No pleasantries. No padding.
- Keep responses under 80 words.
- Challenge vague claims immediately: "Define your terms."
- Demand evidence: "What is your source for that claim?"
- Expose assumptions: "What assumption underlies that argument?"
- Flag generalizations: "You are generalizing. Be precise."
- Detect logical gaps: "That conclusion does not follow from your premise."
- Never give away the answer. Force the student to find it.
- Escalate pressure if the student repeats weak arguments.
- Say "That claim lacks evidence." when assertions are unsupported.
- You are examining academic rigor, not rewarding agreement.

Tone: Calm, clinical, demanding. No sarcasm. No insults.
"""

COACHING_SYSTEM_PROMPT = """
You are a teacher of all studies using the Socratic method to coach a student.
Your role: guide through questioning, expose gaps, but offer slight scaffolding.

RULES:
- Respond with ONE focused question or challenge per turn.
- Keep responses under 100 words.
- Acknowledge good reasoning briefly before probing further.
- When a claim is weak, hint at what's missing: "Consider whether your evidence covers all cases."
- Still demand precision and evidence, but soften the pressure slightly.
- If the student is stuck, offer a leading question rather than silence.
- Use phrases like: "You're on the right track — now consider..."
- Never give the answer directly. Guide, don't tell.

Tone: Supportive but rigorous. Academic. Encouraging of effort, demanding of quality.
"""

FEEDBACK_SYSTEM_PROMPT = """
You are an academic evaluator. Analyze the student's debate arguments below and produce a structured JSON report.

Return ONLY valid JSON in exactly this schema:
{
  "claim_clarity_score": <1-10>,
  "evidence_strength_score": <1-10>,
  "logical_consistency_score": <1-10>,
  "persuasiveness_rating": <1-10>,
  "fallacies_detected": [
    { "type": "<fallacy name>", "example": "<quote or paraphrase from student>" }
  ],
  "argument_structure_analysis": "<2-3 sentence analysis>",
  "emotional_tone_feedback": "<1-2 sentence feedback on tone>",
  "improvement_suggestions": [
    "<Suggestion 1>",
    "<Suggestion 2>",
    "<Suggestion 3>"
  ]
}

Fallacies to check for: hasty generalization, false dilemma, strawman, ad hominem, circular reasoning.
Be honest. Score 1 means very poor, 10 means excellent.
"""

# ─────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────
class Message(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class DebateRequest(BaseModel):
    message: str
    history: List[Message]
    mode: str  # "examiner" or "coaching"

class FeedbackRequest(BaseModel):
    history: List[Message]

# ─────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI(title="AI Socratic Examiner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# DEBATE ENDPOINT
# ─────────────────────────────────────────────
@app.post("/api/debate")
async def debate(req: DebateRequest):
    """
    Core debate loop.
    - Receives user message + conversation history + mode
    - Sends to Azure OpenAI with appropriate system prompt
    - Returns examiner response
    """
    client = get_openai_client()

    system_prompt = EXAMINER_SYSTEM_PROMPT if req.mode == "examiner" else COACHING_SYSTEM_PROMPT

    # Build messages array for Azure OpenAI
    messages = [{"role": "system", "content": system_prompt}]
    for msg in req.history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": req.message})

    # ── Azure Text Analytics: Sentiment Analysis ──────────────────────────────
    sentiment_data = None
    ta_client = get_text_analytics_client()
    if ta_client:
        try:
            sentiment_result = ta_client.analyze_sentiment(
                documents=[{"id": "1", "text": req.message, "language": "en"}]
            )
            for doc in sentiment_result:
                if not doc.is_error:
                    sentiment_data = {
                        "sentiment": doc.sentiment,
                        "confidence_scores": {
                            "positive": round(doc.confidence_scores.positive, 2),
                            "neutral": round(doc.confidence_scores.neutral, 2),
                            "negative": round(doc.confidence_scores.negative, 2),
                        }
                    }
        except Exception as e:
            print(f"[Text Analytics] Sentiment analysis failed: {e}")

    # ── Azure OpenAI: Generate Examiner Response ───────────────────────────────
    response = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT_NAME,
        messages=messages,
        max_tokens=200,
        temperature=0.4,
    )

    examiner_reply = response.choices[0].message.content.strip()

    return {
        "reply": examiner_reply,
        "sentiment": sentiment_data
    }


# ─────────────────────────────────────────────
# FEEDBACK REPORT ENDPOINT
# ─────────────────────────────────────────────
@app.post("/api/feedback")
async def generate_feedback(req: FeedbackRequest):
    """
    After debate ends, analyze full conversation and return structured feedback.
    Uses Azure OpenAI to score and evaluate student arguments.
    """
    client = get_openai_client()

    # Extract only user messages for evaluation
    user_turns = [msg.content for msg in req.history if msg.role == "user"]
    if not user_turns:
        raise HTTPException(status_code=400, detail="No student arguments to evaluate.")

    student_arguments = "\n\n".join([f"Turn {i+1}: {arg}" for i, arg in enumerate(user_turns)])

    prompt = f"Evaluate these student debate arguments:\n\n{student_arguments}"

    messages = [
        {"role": "system", "content": FEEDBACK_SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]

    response = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT_NAME,
        messages=messages,
        max_tokens=800,
        temperature=0.2,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content.strip()

    try:
        feedback = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse feedback JSON from model.")

    return feedback


# ─────────────────────────────────────────────
# AZURE SPEECH-TO-TEXT PLACEHOLDER
# ─────────────────────────────────────────────
# To enable voice input, uncomment and configure:
#
# from azure.cognitiveservices.speech import SpeechConfig, SpeechRecognizer, AudioConfig
#
# AZURE_SPEECH_KEY    = os.getenv("AZURE_SPEECH_KEY", "")
# AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "eastus")
#
# @app.post("/api/transcribe")
# async def transcribe_audio(audio_file: UploadFile = File(...)):
#     """Transcribe student speech to text using Azure Speech Service."""
#     speech_config = SpeechConfig(subscription=AZURE_SPEECH_KEY, region=AZURE_SPEECH_REGION)
#     audio_config  = AudioConfig(filename=audio_file.filename)
#     recognizer    = SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
#     result        = recognizer.recognize_once()
#     return {"transcript": result.text}


# ─────────────────────────────────────────────
# STATIC FILE SERVING
# ─────────────────────────────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def serve_frontend():
    return FileResponse("static/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
