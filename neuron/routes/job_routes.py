from fastapi import APIRouter, Form, Query, HTTPException
import uuid
import os
from models.meta import load_meta, save_meta
from services.text_processing import preprocess_text
from services.embedding import encode_text, compute_similarity, score_label
from config import JDS_DIR, JD_META, RESUME_META

router = APIRouter()

@router.post("/upload/jobs")
async def upload_job(company: str = Form(...), job_title: str = Form(...), description: str = Form(...)):
    meta = load_meta(JD_META)
    job_id = str(uuid.uuid4())[:8]
    filename = f"{job_id}.txt"
    path = os.path.join(JDS_DIR, filename)
    with open(path, "w", encoding="utf-8") as f: f.write(description)

    processed = preprocess_text(description)
    embedding = encode_text(processed)

    meta[job_id] = {
        "id": job_id,
        "company": company,
        "job_title": job_title,
        "filename": filename,
        "text": processed,
        "embedding": embedding
    }
    save_meta(JD_META, meta)
    return {"job_id": job_id}

@router.get("/match/candidates")
async def match_candidates(jobid: str, count: int = Query(5, gt=0)):
    jd_meta = load_meta(JD_META)
    res_meta = load_meta(RESUME_META)
    if jobid not in jd_meta: raise HTTPException(status_code=404, detail="Job ID not found.")

    jd_emb = jd_meta[jobid]["embedding"]
    pool_ids = list(res_meta.keys())
    pool_embs = [res_meta[i]["embedding"] for i in pool_ids]
    matches = compute_similarity(jd_emb, pool_embs, pool_ids)[:count]

    return [
        {
            "user_id": res_meta[rid]["user_id"],
            "username": res_meta[rid]["username"],
            "resume": res_meta[rid]["filename"],
            "accuracy": round(score*100,2),
            "match": score_label(round(score*100,2)),
            "job_id": jobid,
            "job_name": jd_meta[jobid]["job_title"]
        } for rid, score in matches
    ]

@router.get("/match/jobs")
async def match_jobs(resumeId: str, count: int = Query(5, gt=0)):
    res_meta = load_meta(RESUME_META)
    jd_meta = load_meta(JD_META)
    if resumeId not in res_meta: raise HTTPException(status_code=404, detail="Resume ID not found.")

    res_emb = res_meta[resumeId]["embedding"]
    pool_ids = list(jd_meta.keys())
    pool_embs = [jd_meta[i]["embedding"] for i in pool_ids]
    matches = compute_similarity(res_emb, pool_embs, pool_ids)[:count]

    return [
        {
            "job_id": jid,
            "company": jd_meta[jid]["company"],
            "job_title": jd_meta[jid]["job_title"],
            "accuracy": round(score*100,2),
            "match": score_label(round(score*100,2)),
            "resume_id": resumeId,
            "username": res_meta[resumeId]["username"]
        } for jid, score in matches
    ]
