from datetime import datetime
import traceback

from fastapi import APIRouter, UploadFile, File

from app.database.collections import profiles, resumes
from app.services.pdf_loader import extract_pdf_text
from app.services.openai_parser import parse_resume

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        # Read uploaded file
        file_bytes = await file.read()

        # Extract text from PDF
        text = extract_pdf_text(file_bytes)

        print("✅ PDF extracted successfully")
        print(text[:300])

        # Parse resume using AI
        parsed_resume = parse_resume(text)

        print("✅ Resume parsed successfully")
        print(type(parsed_resume))

        # parse_resume currently returns a dictionary
        resume_data = parsed_resume

        print("💾 Saving resume to MongoDB...")

        # Save uploaded resume
        await resumes.insert_one({
            "filename": file.filename,
            "raw_text": text,
            "parsed_data": resume_data,
            "uploaded_at": datetime.utcnow()
        })

        print("✅ Resume saved")

        # Create or update profile
        await profiles.update_one(
            {"name": resume_data["name"]},
            {
                "$set": {
                    **resume_data,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )

        print("✅ Profile updated")

        return {
            "message": "Resume uploaded successfully",
            "data": resume_data
        }

    except Exception as e:
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }