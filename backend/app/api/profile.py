from fastapi import APIRouter
from app.database.collections import profiles

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("/{name}")
async def get_profile(name: str):
    profile = await profiles.find_one({"name": name})

    if profile is None:
        return {"message": "Profile not found"}

    profile["_id"] = str(profile["_id"])

    if "updated_at" in profile:
        profile["updated_at"] = profile["updated_at"].isoformat()

    return profile