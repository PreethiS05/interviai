from datetime import datetime
import traceback

from fastapi import APIRouter, HTTPException

from app.database.collections import profiles, reports
from app.models.ats import ATSRequest
from app.services.ats_service import analyze_resume

router = APIRouter(prefix="/api/ats", tags=["ATS"])


@router.post("/analyze")
async def ats_analysis(request: ATSRequest):
    try:
        print("Received request:", request)

        profile = await profiles.find_one({"name": request.name})

        if profile is None:
            return {"message": "Profile not found"}

        profile["_id"] = str(profile["_id"])

        if "updated_at" in profile:
            profile["updated_at"] = profile["updated_at"].isoformat()

        print("Profile loaded successfully")

        result = analyze_resume(profile, request.job_description)

        print("ATS Result:", result)

        await reports.insert_one({
            "name": request.name,
            "job_description": request.job_description,
            **result,
            "created_at": datetime.utcnow()
        })

        return result

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))