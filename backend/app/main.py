from fastapi import FastAPI

from app.api.resume import router as resume_router
from app.database.mongodb import client
from app.api.profile import router as profile_router
from app.api.ats import router as ats_router
from app.api.interview import router as interview_router



app = FastAPI(title="InterviAI API")


@app.on_event("startup")
async def startup():
    await client.admin.command("ping")
    print("✅ MongoDB Connected")


app.include_router(resume_router)
app.include_router(profile_router)
app.include_router(ats_router)    
app.include_router(interview_router)                                                                                                                                                                          

@app.get("/")
async def root():
    return {"message": "InterviAI Backend Running"}