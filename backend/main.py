import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    raise RuntimeError("WARNING: GROQ_API_KEY not set")

client = OpenAI(
    api_key=groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

app = FastAPI(title="Interview Prep API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://interview-prep-ai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COMPANIES = [
    "General",
    "Google",
    "Amazon",
    "Microsoft",
    "Meta",
    "Apple",
    "Netflix",
    "Tesla",
]

INTERVIEW_TYPES = [
    "Technical",
    "HR",
    "Behavioral",
    "DSA",
    "OOP",
]

EXPERIENCE_LEVELS = [
    "Entry Level",
    "Mid Level",
    "Senior Level",
]

MODEL_NAME = "llama-3.1-8b-instant"


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    company: str = "General"
    messages: list[ChatMessage]


class MockInterviewStartRequest(BaseModel):
    company: str = "General"
    interview_type: str = "Technical"
    experience_level: str = "Entry Level"


class MockInterviewAnswerRequest(BaseModel):
    company: str = "General"
    interview_type: str = "Technical"
    experience_level: str = "Entry Level"
    current_question: str
    user_answer: str


class MockInterviewNextRequest(BaseModel):
    company: str = "General"
    interview_type: str = "Technical"
    experience_level: str = "Entry Level"
    previous_question: str


@app.get("/")
def home():
    return {"message": "Interview Prep Backend Running with Groq"}


@app.get("/companies")
def get_companies():
    return {"companies": COMPANIES}


@app.get("/interview-types")
def get_interview_types():
    return {"interview_types": INTERVIEW_TYPES}


@app.get("/experience-levels")
def get_experience_levels():
    return {"experience_levels": EXPERIENCE_LEVELS}


@app.post("/mock-interview/start")
def start_mock_interview(request: MockInterviewStartRequest):
    company = request.company.strip() if request.company else "General"
    interview_type = (
        request.interview_type.strip() if request.interview_type else "Technical"
    )
    experience_level = (
        request.experience_level.strip()
        if request.experience_level
        else "Entry Level"
    )

    prompt = f"""
You are acting as a mock interviewer.

Company: {company}
Interview type: {interview_type}
Experience level: {experience_level}

Ask exactly one interview question only.

Rules:
- Match the difficulty to the experience level
- Entry Level = fundamentals, simple practical questions
- Mid Level = practical implementation, debugging, tradeoffs
- Senior Level = architecture, system design, leadership, tradeoffs

Do not add explanation.
Do not add feedback.
Do not add numbering.
Just ask the first interview question.
""".strip()

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a professional interviewer."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=120,
        )

        return {"question": response.choices[0].message.content.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/mock-interview/answer")
def answer_mock_interview(request: MockInterviewAnswerRequest):
    company = request.company.strip() if request.company else "General"
    interview_type = (
        request.interview_type.strip() if request.interview_type else "Technical"
    )
    experience_level = (
        request.experience_level.strip()
        if request.experience_level
        else "Entry Level"
    )
    current_question = request.current_question.strip()
    user_answer = request.user_answer.strip()

    if not current_question:
        raise HTTPException(status_code=400, detail="Current question is required.")

    if not user_answer:
        raise HTTPException(status_code=400, detail="User answer is required.")

    prompt = f"""
You are a mock interviewer.

Company: {company}
Interview type: {interview_type}
Experience level: {experience_level}

Current question:
{current_question}

Candidate answer:
{user_answer}

Evaluate the answer based on the selected experience level.

Now respond in exactly this format:

Score: <score out of 10>
Feedback: <short constructive feedback>
Better Answer: <improved version of the user's answer based on the selected experience level>
Next Question: <ask one next interview question suitable for the same company, interview type, and experience level>

Keep feedback practical, clear, and beginner-friendly.
""".strip()

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a strict but helpful interviewer."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=700,
        )

        return {"result": response.choices[0].message.content.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/mock-interview/next")
def next_mock_interview_question(request: MockInterviewNextRequest):
    company = request.company.strip() if request.company else "General"
    interview_type = (
        request.interview_type.strip() if request.interview_type else "Technical"
    )
    experience_level = (
        request.experience_level.strip()
        if request.experience_level
        else "Entry Level"
    )
    previous_question = request.previous_question.strip()

    if not previous_question:
        raise HTTPException(status_code=400, detail="Previous question is required.")

    prompt = f"""
You are acting as a mock interviewer.

Company: {company}
Interview type: {interview_type}
Experience level: {experience_level}

Previous question:
{previous_question}

Ask exactly one new interview question only.
Do not repeat the previous question.
Do not add explanation.
Do not add feedback.
Do not add numbering.
Just ask the next question.
""".strip()

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a professional interviewer."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=120,
        )

        return {"question": response.choices[0].message.content.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))