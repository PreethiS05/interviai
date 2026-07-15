from fastapi import APIRouter

from app.models.interview_models import (
    InterviewEvaluationRequest,
    InterviewEvaluationResponse,
)
from app.services.interview_evaluator import evaluate_answer

router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"],
)


@router.post(
    "/evaluate",
    response_model=InterviewEvaluationResponse,
)
def evaluate(request: InterviewEvaluationRequest):
    result = evaluate_answer(
        question=request.question,
        answer=request.answer,
        job_role=request.job_role,
    )

    return result