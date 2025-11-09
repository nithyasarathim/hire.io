from fastapi import FastAPI
from routes.resume_routes import router as resume_router
from routes.job_routes import router as job_router

app = FastAPI(title="Resume ↔ Job Matcher API")

app.include_router(resume_router)
app.include_router(job_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
