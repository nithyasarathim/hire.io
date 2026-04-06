from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routes.resume_routes import router as resume_router
from routes.job_routes import router as job_router
from config import RESUMES_DIR, JDS_DIR

app = FastAPI(title="Resume ↔ Job Matcher API")

for directory in [RESUMES_DIR, JDS_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

app.mount("/resumes", StaticFiles(directory=RESUMES_DIR), name="resumes")

origins = [
    "http://localhost:5173",
    "http://localhost:5000",  
    "http://localhost:8000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)
app.include_router(job_router)

@app.get("/")
async def root():
    return {"message": "Neuron Matching Engine is Online", "static_files": "/resumes"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)