from fastapi import FastAPI
from app.config.settings import settings
from app.api.routes.health import router as health_router
from app.utils.logger import logger


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)


@app.on_event("startup")
async def startup_event():
    logger.info("ResearchMind AI Backend Started")


@app.get("/")
def root():
    return {
        "message": "ResearchMind AI Running"
    }


app.include_router(health_router)