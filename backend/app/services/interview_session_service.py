from datetime import datetime
from bson import ObjectId
from app.services.interview_question_service import generate_questions

from app.database.mongodb import db
from app.models.session_models import InterviewSession
interview_sessions_collection = db["interview_sessions"]


async def create_session(session: InterviewSession):
    """
    Create a new interview session with AI-generated questions.
    """

    # Generate interview questions
    questions = generate_questions(
        session.role,
        session.experience,
    )

    # Attach questions to the session
    session.questions = [
        {
            "question": question,
            "answer": "",
            "evaluation": None,
        }
        for question in questions
    ]

    session_dict = session.model_dump()

    result = await interview_sessions_collection.insert_one(session_dict)

    session_dict["_id"] = str(result.inserted_id)

    return session_dict


async def get_session(session_id: str):
    """
    Fetch an interview session by ID.
    """
    session = await interview_sessions_collection.find_one(
        {"_id": ObjectId(session_id)}
    )

    if not session:
        return None

    session["_id"] = str(session["_id"])
    return session


async def update_answer(session_id: str, question_index: int, answer: str):
    """
    Save the user's answer for a question.
    """
    await interview_sessions_collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                f"questions.{question_index}.answer": answer
            }
        },
    )

    return await get_session(session_id)


async def update_evaluation(session_id: str, question_index: int, evaluation: dict):
    """
    Save AI evaluation for a question.
    """
    await interview_sessions_collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                f"questions.{question_index}.evaluation": evaluation
            }
        },
    )

    return await get_session(session_id)


async def complete_session(session_id: str, overall_score: int):
    """
    Mark interview as completed.
    """
    await interview_sessions_collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "status": "COMPLETED",
                "overall_score": overall_score,
                "completed_at": datetime.utcnow(),
            }
        },
    )

    return await get_session(session_id)