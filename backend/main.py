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
    raise RuntimeError("GROQ_API_KEY not set")

client = OpenAI(
    api_key=groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

MODEL_NAME = "llama-3.1-8b-instant"

app = FastAPI(title="Interview Prep API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://interview-prep-app-steel.vercel.app",
        "https://interview-prep-r3cxm4714-vilas2809s-projects.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MockInterviewStartRequest(BaseModel):
    company: str = "General"
    role: str = "Software Engineer"
    interview_type: str = "Theory"
    experience_level: str = "Entry Level"


class MockInterviewAnswerRequest(BaseModel):
    company: str = "General"
    role: str = "Software Engineer"
    interview_type: str = "Theory"
    experience_level: str = "Entry Level"
    current_question: str
    user_answer: str


class MockInterviewNextRequest(BaseModel):
    company: str = "General"
    role: str = "Software Engineer"
    interview_type: str = "Theory"
    experience_level: str = "Entry Level"
    previous_question: str


@app.get("/")
def home():
    return {"message": "Interview Prep Backend Running with Groq"}


def get_type_instruction(interview_type: str) -> str:
    interview_type_lower = interview_type.lower().strip()

    if interview_type_lower in {"theory", "concepts", "fundamentals"}:
        return """
Ask a theory-based interview question.
Focus on definitions, concepts, comparisons, or fundamentals.
"""
    if interview_type_lower in {"coding", "dsa", "problem solving"}:
        return """
Ask a coding or problem-solving interview question.
Focus on algorithms, data structures, logic, or implementation.
"""
    if interview_type_lower in {"behavioral", "hr"}:
        return """
Ask a behavioral interview question.
Focus on teamwork, communication, leadership, deadlines, conflict, or challenges.
"""
    if interview_type_lower in {"system design", "design"}:
        return """
Ask a system design interview question.
Focus on scalability, architecture, APIs, caching, databases, and tradeoffs.
"""
    if interview_type_lower == "oop":
        return """
Ask an Object-Oriented Programming interview question.
Focus on inheritance, polymorphism, abstraction, encapsulation, interfaces, and design principles.
"""
    if interview_type_lower == "dbms":
        return """
Ask a DBMS interview question.
Focus on normalization, joins, indexing, transactions, SQL, and ACID properties.
"""
    if interview_type_lower == "os":
        return """
Ask an Operating Systems interview question.
Focus on processes, threads, scheduling, deadlocks, synchronization, and memory management.
"""
    if interview_type_lower in {"networks", "networking", "cn"}:
        return """
Ask a Computer Networks interview question.
Focus on TCP/IP, OSI model, DNS, HTTP/HTTPS, switching, routing, and protocols.
"""
    return f"""
Ask an interview question suitable for this custom interview type: {interview_type}.
Tailor the question accordingly.
"""


def call_groq(prompt: str, system_message: str, temperature: float = 0.7, max_tokens: int = 600) -> str:
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content.strip()


def extract_section(text: str, label: str) -> str:
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if line.lower().startswith(f"{label.lower()}:"):
            return line.split(":", 1)[1].strip()
    return ""


def extract_multiline_section(text: str, start_label: str, end_label: str | None = None) -> str:
    start_index = text.lower().find(f"{start_label.lower()}:")
    if start_index == -1:
        return ""

    content = text[start_index + len(start_label) + 1 :]

    if end_label:
        end_index = content.lower().find(f"{end_label.lower()}:")
        if end_index != -1:
            content = content[:end_index]

    return content.strip()


@app.post("/interview")
def start_mock_interview(request: MockInterviewStartRequest):
    company = request.company.strip() if request.company else "General"
    role = request.role.strip() if request.role else "Software Engineer"
    interview_type = request.interview_type.strip() if request.interview_type else "Theory"
    experience_level = request.experience_level.strip() if request.experience_level else "Entry Level"

    type_instruction = get_type_instruction(interview_type)

    prompt = f"""
You are acting as a professional mock interviewer.

Target Company: {company}
Role: {role}
Interview Type: {interview_type}
Experience Level: {experience_level}

{type_instruction}

Rules:
- Tailor the question to the selected company if possible
- Tailor the question to the selected role
- Tailor the difficulty to the experience level
- Entry Level = beginner-friendly fundamentals
- Mid Level = practical implementation, debugging, tradeoffs
- Senior Level = advanced concepts, architecture, leadership, tradeoffs
- Ask exactly one interview question only
- Do not add explanation
- Do not add feedback
- Do not add numbering
- Just ask the question
""".strip()

    try:
        question = call_groq(
            prompt=prompt,
            system_message="You are a professional interviewer.",
            temperature=0.8,
            max_tokens=180,
        )
        return {"question": question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/mock-interview/answer")
def answer_mock_interview(request: MockInterviewAnswerRequest):
    company = request.company.strip() if request.company else "General"
    role = request.role.strip() if request.role else "Software Engineer"
    interview_type = request.interview_type.strip() if request.interview_type else "Theory"
    experience_level = request.experience_level.strip() if request.experience_level else "Entry Level"
    current_question = request.current_question.strip()
    user_answer = request.user_answer.strip()

    if not current_question:
      raise HTTPException(status_code=400, detail="Current question is required.")

    if not user_answer:
      raise HTTPException(status_code=400, detail="User answer is required.")

    prompt = f"""
You are a strict but helpful mock interviewer.

Target Company: {company}
Role: {role}
Interview Type: {interview_type}
Experience Level: {experience_level}

Current Question:
{current_question}

Candidate Answer:
{user_answer}

Evaluate the answer based on the selected role, interview type, and experience level.

Respond in exactly this format:

Score: <score out of 10>
Feedback: <short practical constructive feedback>
Better Answer: <improved answer better suited to the role and experience level>
Next Question: <one next interview question suitable for the same company, role, interview type, and experience level>

Rules:
- Keep the score realistic
- Keep feedback concise but useful
- Make the better answer strong, clear, and interview-ready
- Ask only one next question
""".strip()

    try:
        result_text = call_groq(
            prompt=prompt,
            system_message="You are a strict but helpful interviewer.",
            temperature=0.7,
            max_tokens=900,
        )

        score = extract_section(result_text, "Score")
        feedback = extract_section(result_text, "Feedback")
        better_answer = extract_multiline_section(result_text, "Better Answer", "Next Question")
        next_question = extract_multiline_section(result_text, "Next Question")

        return {
            "score": score,
            "feedback": feedback,
            "better_answer": better_answer,
            "next_question": next_question,
            "raw_result": result_text,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/mock-interview/next")
def next_mock_interview_question(request: MockInterviewNextRequest):
    company = request.company.strip() if request.company else "General"
    role = request.role.strip() if request.role else "Software Engineer"
    interview_type = request.interview_type.strip() if request.interview_type else "Theory"
    experience_level = request.experience_level.strip() if request.experience_level else "Entry Level"
    previous_question = request.previous_question.strip()

    if not previous_question:
        raise HTTPException(status_code=400, detail="Previous question is required.")

    type_instruction = get_type_instruction(interview_type)

    prompt = f"""
You are acting as a professional mock interviewer.

Target Company: {company}
Role: {role}
Interview Type: {interview_type}
Experience Level: {experience_level}

{type_instruction}

Previous Question:
{previous_question}

Ask exactly one new interview question only.

Rules:
- Tailor it to the selected company and role
- Do not repeat the previous question
- Do not add explanation
- Do not add feedback
- Do not add numbering
- Just ask the next question
""".strip()

    try:
        question = call_groq(
            prompt=prompt,
            system_message="You are a professional interviewer.",
            temperature=0.8,
            max_tokens=180,
        )
        return {"question": question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))