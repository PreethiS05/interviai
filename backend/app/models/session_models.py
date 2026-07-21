from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class SessionQuestion(BaseModel):
    question: str
    answer: str = ""
    evaluation: Optional[dict] = None


class CreateSessionRequest(BaseModel):
    user_name: str
    role: str
    experience: str


class InterviewSession(BaseModel):
    user_name: str
    role: str
    experience: str

    status: str = "IN_PROGRESS"

    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    overall_score: Optional[int] = None

    questions: List[SessionQuestion] = Field(default_factory=list)


class AnswerQuestionRequest(BaseModel):
    question_index: int
    answer: str