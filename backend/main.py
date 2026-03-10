from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import InterviewRequest
from data import interview_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http:/127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Interview Prep API is running"}

@app.post("/recommend")
def generate_prep(request: InterviewRequest):
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

    return {
        "company": request.company,
        "role": request.role,
        "level": request.level,
        "interview_type": request.interview_type,
        "prep_plan": interview_type_data
    }