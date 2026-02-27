# AI Socratic Examiner

A web-based AI debate and exam coach that simulates a strict Socratic history teacher.
Built with FastAPI, Azure OpenAI, and Azure Text Analytics.

---

## Folder Structure

```
ai-socratic-examiner/
├── server.py           ← FastAPI backend (debate loop, feedback, sentiment)
├── requirements.txt    ← Python dependencies
├── .env.example        ← Environment variable template
├── README.md
└── static/
    └── index.html      ← Frontend (single-file HTML/CSS/JS)
```

---

## Setup Instructions

### 1. Prerequisites
- Python 3.10+
- Azure subscription with:
  - **Azure OpenAI** resource (GPT-4 deployment)
  - **Azure Language / Text Analytics** resource

### 2. Clone / copy project files
```bash
cd ai-socratic-examiner
```

### 3. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure environment variables
```bash
cp .env.example .env
# Edit .env and fill in your Azure credentials
```

Then export them (or use python-dotenv):
```bash
# Mac/Linux:
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
export AZURE_OPENAI_KEY="your-key"
export AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"
export AZURE_TEXT_ANALYTICS_ENDPOINT="https://your-lang.cognitiveservices.azure.com/"
export AZURE_TEXT_ANALYTICS_KEY="your-key"

# Windows (PowerShell):
$env:AZURE_OPENAI_ENDPOINT = "https://your-resource.openai.azure.com/"
$env:AZURE_OPENAI_KEY = "your-key"
...
```

**Or use python-dotenv** — add `from dotenv import load_dotenv; load_dotenv()` at the top of server.py and install with `pip install python-dotenv`.

### 6. Run the server
```bash
python server.py
# or
uvicorn server:app --reload --port 8000
```

### 7. Open in browser
```
http://localhost:8000
```

---

## How Azure Services Are Used

| Service | Role | Where in Code |
|---|---|---|
| **Azure OpenAI (GPT-4)** | Generates Examiner debate responses | `POST /api/debate` |
| **Azure OpenAI (GPT-4)** | Generates structured JSON feedback report | `POST /api/feedback` |
| **Azure Text Analytics** | Sentiment analysis of each student argument | Inside `/api/debate`, result shown as tone badge |
| **Azure Speech (placeholder)** | Voice-to-text for spoken arguments | Commented out in server.py + JS |

---

## Features

- **Debate Loop**: Continuous Socratic Q&A until you end the session
- **Examiner Mode**: Zero hints, maximum pressure, strict challenges
- **Coaching Mode**: Slight scaffolding, still rigorous
- **Sentiment Badge**: Azure Text Analytics labels your tone per message
- **Final Report** includes:
  - 4 scored dimensions (1–10)
  - Fallacy detection (5 types)
  - Argument structure analysis
  - Emotional tone feedback
  - 3 concrete improvement suggestions

---

## Enabling Azure Speech (Voice Input)

1. Create an Azure Speech resource
2. Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` env vars
3. Uncomment the `#── Azure Speech-to-Text PLACEHOLDER` block in `server.py`
4. Uncomment the `//── Azure Speech Placeholder` block in `static/index.html`
5. Add a microphone button to the UI
