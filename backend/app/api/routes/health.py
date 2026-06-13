from fastapi import APIRouter
from sqlalchemy import text
from app.db.database import SessionLocal

router = APIRouter()


@router.get("/health")
def health_check():
    db = SessionLocal()

    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception:
        return {
            "status": "error",
            "database": "disconnected"
        }

    finally:
        db.close()