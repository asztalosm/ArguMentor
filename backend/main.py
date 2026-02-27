"""
ArguMentor – Backend (FastAPI + Azure OpenAI)
Run: uvicorn main:app --reload
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal
from openai import AsyncAzureOpenAI

load_dotenv()

app = FastAPI(title="ArguMentor API")

# Allow all origins for easy local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Azure OpenAI client
client = AsyncAzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-08-07"),
)

DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5-nano")

# System prompt for each mode
PROMPTS = {
    "debate": (
        "You are ArguMentor in Debate Mode — a sharp devil's advocate. "
        "Always argue the OPPOSITE of what the user says. Be persuasive and rigorous. "
        "Keep responses to 2-3 paragraphs and end with a challenging question."
    ),
    "teach": (
        "You are ArguMentor in Teach Mode — an eager student. "
        "The user is your teacher. Listen, ask clarifying questions, summarise what "
        "you've understood, and acknowledge corrections. Show you're learning."
    ),
    "mistake_hunter": (
        "You are ArguMentor in Mistake Hunter Mode — an expert editor. "
        "Analyse the user's text for grammar, spelling, logic, and factual errors. "
        "List each issue with the original, the problem, and a correction. "
        "If there are no errors, explain what makes the text strong."
    ),
}

# --- Schemas ---

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    message: str
    mode: Literal["debate", "teach", "mistake_hunter"]
    history: List[Message] = []

# --- Endpoints ---

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat(body: ChatRequest):
    messages = [{"role": "system", "content": PROMPTS[body.mode]}]
    for m in body.history[-20:]:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": body.message})

    response = await client.chat.completions.create(
        model=DEPLOYMENT,
        messages=messages,
        temperature=1,
        max_completion_tokens=800,
    )

    return {"reply": response.choices[0].message.content.strip()}
