from fastapi import APIRouter, UploadFile, File
from app.services.pdf_loader import extract_pdf_text
from app.services.openai_parser import parse_resume
import traceback

router = APIRouter()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()

        text = extract_pdf_text(file_bytes)

        print("PDF extracted successfully")
        print(text[:300])

        parsed_resume = parse_resume(text)

        return parsed_resume

    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}