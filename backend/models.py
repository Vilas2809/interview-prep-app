from pydantic import BaseModel

class InterviewRequest(BaseModel):
    role: str
    experience: str
    interview_type: str
    message: str
    company: str   # ✅ NEW FIELD