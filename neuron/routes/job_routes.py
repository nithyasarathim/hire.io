from fastapi import APIRouter, Form, Query, HTTPException
import uuid
import os
from models.meta import load_meta, save_meta
from services.text_processing import preprocess_text, extract_skills
from services.embedding import encode_text, compute_similarity, score_label
from config import JDS_DIR, JD_META, RESUME_META

router = APIRouter()

@router.post("/upload/jobs")
async def upload_job(
    company: str = Form(...),
    job_title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    salary_range: str = Form(""),
    experience_level: str = Form(""),
    job_type: str = Form(...),
):
    meta = load_meta(JD_META)
    job_id = str(uuid.uuid4())[:8]
    filename = f"{job_id}.txt"
    path = os.path.join(JDS_DIR, filename)

    with open(path, "w", encoding="utf-8") as f:
        f.write(description)

    processed = preprocess_text(description)
    embedding = encode_text(processed)
    extracted_skills = extract_skills(description)

    meta[job_id] = {
        "id": job_id,
        "company": company,
        "job_title": job_title,
        "description": description,
        "location": location,
        "salary_range": salary_range,
        "experience_level": experience_level,
        "job_type": job_type,
        "filename": filename,
        "text": processed,
        "embedding": embedding,
        "skills": extracted_skills,
    }

    save_meta(JD_META, meta)

    return {"job_id": job_id, "message": "Job uploaded successfully."}

def build_skill_gap(resume_skills, job_skills):
    resume_set = set(resume_skills or [])
    job_set = set(job_skills or [])
    return sorted(resume_set & job_set), sorted(job_set - resume_set)

@router.get("/match/candidates")
async def match_candidates(jobid: str, count: int = Query(5, gt=0)):
    jd_meta = load_meta(JD_META)
    res_meta = load_meta(RESUME_META)

    if jobid not in jd_meta:
        raise HTTPException(status_code=404, detail="Job ID not found.")

    jd_emb = jd_meta[jobid]["embedding"]
    pool_ids = list(res_meta.keys())
    pool_embs = [res_meta[i]["embedding"] for i in pool_ids]
    matches = compute_similarity(jd_emb, pool_embs, pool_ids)[:count]

    job_data = jd_meta[jobid]

    candidates = []
    for rid, score in matches:
        matched_skills, missing_skills = build_skill_gap(
            res_meta[rid].get("skills", []),
            job_data.get("skills", [])
        )
        candidates.append({
            "user_id": res_meta[rid]["user_id"],
            "username": res_meta[rid]["username"],
            "resume": res_meta[rid]["filename"],
            "accuracy": round(score * 100, 2),
            "match": score_label(round(score * 100, 2)),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
        })

    return {
        "job": {
            "job_id": job_data["id"],
            "job_title": job_data["job_title"],
            "company": job_data["company"],
            "description": job_data["description"],
            "location": job_data.get("location"),
            "salary_range": job_data.get("salary_range"),
            "experience_level": job_data.get("experience_level"),
            "job_type": job_data.get("job_type"),
            "skills": job_data.get("skills", []),
        },
        "candidates": candidates,
    }

@router.get("/match/jobs")
async def match_jobs(resumeId: str, count: int = Query(5, gt=0)):
    res_meta = load_meta(RESUME_META)
    jd_meta = load_meta(JD_META)

    if resumeId not in res_meta:
        raise HTTPException(status_code=404, detail="Resume ID not found.")

    res_emb = res_meta[resumeId]["embedding"]
    pool_ids = list(jd_meta.keys())
    pool_embs = [jd_meta[i]["embedding"] for i in pool_ids]
    matches = compute_similarity(res_emb, pool_embs, pool_ids)[:count]

    resume_user = res_meta[resumeId]["username"]

    job_matches = []
    for jid, score in matches:
        matched_skills, missing_skills = build_skill_gap(
            res_meta[resumeId].get("skills", []),
            jd_meta[jid].get("skills", [])
        )
        job_matches.append({
            "job_id": jid,
            "company": jd_meta[jid]["company"],
            "job_title": jd_meta[jid]["job_title"],
            "description": jd_meta[jid].get("description"),
            "location": jd_meta[jid].get("location"),
            "salary_range": jd_meta[jid].get("salary_range"),
            "experience_level": jd_meta[jid].get("experience_level"),
            "job_type": jd_meta[jid].get("job_type"),
            "accuracy": round(score * 100, 2),
            "match": score_label(round(score * 100, 2)),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
        })

    return {
        "resume_id": resumeId,
        "username": resume_user,
        "matches": job_matches,
    }
