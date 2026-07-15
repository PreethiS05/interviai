from pydantic import BaseModel
from typing import List


class InterviewEvaluationRequest(BaseModel):
    question: str
    answer: str
    job_role: str


class InterviewEvaluationResponse(BaseModel):
    overall_score: int
    technical_score: int
    communication_score: int
    confidence_score: int
    strengths: List[str]
    weaknesses: List[str]
    feedback: str
    ideal_answer: str