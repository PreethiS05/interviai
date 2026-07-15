from typing import List
from pydantic import BaseModel


class ATSRequest(BaseModel):
    name: str
    job_description: str


class ATSResponse(BaseModel):
    ats_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    suggestions: List[str]