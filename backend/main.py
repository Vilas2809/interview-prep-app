from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from models import InterviewRequest
from data import interview_data
import random

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_mock_ai_text(request: InterviewRequest, interview_type_data: dict) -> str:
    topics = interview_type_data.get("topics", [])
    algorithms = interview_type_data.get("algorithms", [])
    behavioral = interview_type_data.get("behavioral", [])
    system_design = interview_type_data.get("system_design", [])

    question_pool = []

    for topic in topics:
        question_pool.append(f"Explain the concept of {topic} and where it is used.")
        question_pool.append(f"What are the main challenges in working with {topic}?")

    for algo in algorithms:
        question_pool.append(f"How would you solve a problem using {algo}?")
        question_pool.append(f"What is the time complexity of {algo}, and when would you use it?")

    for behavior in behavioral:
        question_pool.append(f"Tell me about a time when you demonstrated {behavior}.")
        question_pool.append(f"Describe a situation where {behavior} helped you succeed.")

    for design in system_design:
        question_pool.append(f"How would you design a system for {design}?")
        question_pool.append(f"What are the key trade-offs when designing {design}?")

    if len(question_pool) >= 5:
        selected_questions = random.sample(question_pool, 5)
    else:
        selected_questions = question_pool[:]

    while len(selected_questions) < 5:
        selected_questions.append("Tell me about a challenging technical problem you solved.")

    study_plan_days = []

    if topics:
        study_plan_days.append(f"Day 1: Review core topics such as {', '.join(topics[:3])}.")
    else:
        study_plan_days.append("Day 1: Review the fundamentals related to the role.")

    if algorithms:
        study_plan_days.append(f"Day 2: Practice algorithms like {', '.join(algorithms[:3])}.")
    else:
        study_plan_days.append("Day 2: Practice problem-solving and coding questions.")

    if system_design:
        study_plan_days.append(f"Day 3: Study system design concepts such as {', '.join(system_design[:2])}.")
    else:
        study_plan_days.append("Day 3: Focus on architecture and design basics.")

    if behavioral:
        study_plan_days.append(f"Day 4: Prepare behavioral stories around {', '.join(behavioral[:3])}.")
    else:
        study_plan_days.append("Day 4: Prepare common HR and behavioral interview answers.")

    study_plan_days.append("Day 5: Take a mock interview and answer questions aloud.")
    study_plan_days.append("Day 6: Review weak areas and revise important concepts.")
    study_plan_days.append("Day 7: Do a light revision and focus on confidence and clarity.")

    tips = [
        "Practice answering clearly and keep your explanations structured.",
        "Use real examples from projects or coursework whenever possible.",
        "Revise fundamentals before moving to advanced topics."
    ]

    if request.interview_type.lower() == "behavioral":
        tips = [
            "Use the STAR method for answering behavioral questions.",
            "Prepare examples that show leadership, teamwork, and problem-solving.",
            "Keep your answers concise but specific."
        ]
    elif request.interview_type.lower() == "system_design":
        tips = [
            "Start with requirements clarification before jumping into architecture.",
            "Discuss scalability, trade-offs, and database choices clearly.",
            "Use diagrams or step-by-step explanation while answering."
        ]
    elif request.interview_type.lower() == "coding":
        tips = [
            "Clarify the problem before writing code.",
            "Explain brute force first, then optimize.",
            "Always discuss time and space complexity."
        ]

    formatted_output = f"""
Interview Questions
1. {selected_questions[0]}
2. {selected_questions[1]}
3. {selected_questions[2]}
4. {selected_questions[3]}
5. {selected_questions[4]}

1-Week Study Plan
{chr(10).join(study_plan_days)}

Preparation Tips
1. {tips[0]}
2. {tips[1]}
3. {tips[2]}
"""

    return formatted_output.strip()


@app.get("/")
def home():
    return {"message": "Interview Prep API is running"}


@app.post("/recommend-prep")
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

    ai_text = generate_mock_ai_text(request, interview_type_data)

    return {
        "company": request.company,
        "role": request.role,
        "level": request.level,
        "interview_type": request.interview_type,
        "prep_plan": interview_type_data,
        "ai_generated": ai_text
    }