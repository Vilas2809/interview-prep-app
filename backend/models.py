from pydantic import BaseModel

class InterviewRequest(BaseModel):
    company: str
    role: str
    level: str
    interview_type: str