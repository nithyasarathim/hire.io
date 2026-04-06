from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid
from io import BytesIO
import json
from models.meta import load_meta, save_meta
from services.text_processing import extract_text_from_pdf_bytes, preprocess_text, extract_skills
from services.embedding import encode_text
from config import RESUMES_DIR, RESUME_META
import os

router = APIRouter()

@router.post("/upload/resume")
async def upload_resume(user_id: str = Form(...), username: str = Form(...), skills: str = Form("[]"), resume: UploadFile = File(...)):
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF resumes allowed.")

    meta = load_meta(RESUME_META)
    existing_id = next((rid for rid, entry in meta.items() if entry["username"].lower() == username.lower()), None)
    if existing_id:
        old_path = os.path.join(RESUMES_DIR, meta[existing_id]["filename"])
        if os.path.exists(old_path):
            os.remove(old_path)
        del meta[existing_id]

    resume_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(resume.filename)[1] or ".pdf"
    filename = f"{resume_id}{ext}"
    path = os.path.join(RESUMES_DIR, filename)
    
    content = await resume.read()
    with open(path, "wb") as f: f.write(content)

    text = extract_text_from_pdf_bytes(BytesIO(content))
    processed = preprocess_text(text)
    embedding = encode_text(processed)
    declared_skills = json.loads(skills or "[]")
    extracted_skills = extract_skills(text, declared_skills)

    meta[resume_id] = {
        "id": resume_id,
        "user_id": user_id,
        "username": username,
        "filename": filename,
        "text": processed,
        "embedding": embedding,
        "skills": extracted_skills
    }
    save_meta(RESUME_META, meta)
    return {"resume_id": resume_id}
