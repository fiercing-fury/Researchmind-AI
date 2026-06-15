from fastapi import FastAPI
from app.config.settings import settings
from app.api.routes.health import router as health_router
from app.utils.logger import logger
from app.db.database import engine
from app.db.base import Base
from app.api.routes.upload import router as upload_router
from app.api.routes.auth import router as auth_router
from app.api.routes.user import router as user_router
from app.api.routes.chat import router as chat_router 
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)
Base.metadata.create_all(bind=engine)


@app.on_event("startup")
async def startup_event():
    logger.info("ResearchMind AI Backend Started")


@app.get("/")
def root():
    return {
        "message": "ResearchMind AI Running"
    }


app.include_router(health_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(upload_router)
app.include_router(chat_router)