from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
from models import InterviewRequest
from data import interview_data
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Interview Prep API is running"}

@app.post("/recommend")
def recommend_prep(request: InterviewRequest):
    company_data = interview_data.get(request.company)
    if not company_data:
        return {"error": "Company not found"}

    role_data = company_data.get(request.role)
    if not role_data:
        return {"error": "Role not found"}

    level_data = role_data.get(request.level)
    if not level_data:
        return {"error": "Level not found"}

    interview_type_data = level_data.get(request.interview_type)
    if not interview_type_data:
        return {"error": "Interview type not found"}

    prompt = f"""
You are an interview preparation coach.

Create:
1. 5 realistic interview questions
2. A short 1-week study plan
3. 3 important preparation tips

Candidate target:
- Company: {request.company}
- Role: {request.role}
- Level: {request.level}
- Interview Type: {request.interview_type}

Base preparation data:
Topics: {interview_type_data.get("topics", [])}
Algorithms: {interview_type_data.get("algorithms", [])}
Behavioral: {interview_type_data.get("behavioral", [])}
System Design: {interview_type_data.get("system_design", [])}

Format the output clearly with headings:
Interview Questions
1-Week Study Plan
Preparation Tips
"""

    ai_text = ""

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt
        )
        ai_text = response.output_text
    except Exception as e:
        ai_text = f"AI generation failed: {str(e)}"

    return {
        "company": request.company,
        "role": request.role,
        "level": request.level,
        "interview_type": request.interview_type,
        "prep_plan": interview_type_data,
        "ai_generated": ai_text
    }