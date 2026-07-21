from fastapi import APIRouter, HTTPException

from app.models.session_models import (
    CreateSessionRequest,
    InterviewSession,
    AnswerQuestionRequest,
)

from app.services.interview_session_service import (
    create_session,
    get_session,
    update_answer,
    complete_session,
)

router = APIRouter(
    prefix="/api/session",
    tags=["Interview Session"],
)


@router.post("/create")
async def create_interview_session(request: CreateSessionRequest):
    session = InterviewSession(
        user_name=request.user_name,
        role=request.role,
        experience=request.experience,
    )

    return await create_session(session)


@router.get("/{session_id}")
async def get_interview_session(session_id: str):
    session = await get_session(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session


@router.post("/{session_id}/answer")
async def submit_answer(
    session_id: str,
    request: AnswerQuestionRequest,
):
    # Save the answer first
    session = await update_answer(
        session_id=session_id,
        question_index=request.question_index,
        answer=request.answer,
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get the corresponding question
    question = session["questions"][request.question_index]["question"]

    # Evaluate using AI
    from app.services.interview_evaluator import evaluate_answer

    evaluation = evaluate_answer(
        question=question,
        answer=request.answer,
        job_role=session["role"],
    )

    # Save evaluation
    from app.services.interview_session_service import update_evaluation

    session = await update_evaluation(
        session_id=session_id,
        question_index=request.question_index,
        evaluation=evaluation,
    )

    return session
    session = await update_answer(
        session_id=session_id,
        question_index=request.question_index,
        answer=request.answer,
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session


@router.post("/{session_id}/complete")
async def finish_session(
    session_id: str,
    overall_score: int,
):
    session = await complete_session(
        session_id=session_id,
        overall_score=overall_score,
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session