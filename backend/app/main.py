from fastapi import FastAPI

app = FastAPI(
    title="ResearchMind AI",
    description="Production Grade AI Research Assistant",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "ResearchMind AI Backend Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }