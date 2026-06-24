from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db.database import SessionLocal
from app.db.models import Document
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    documents = (
        db.query(Document)
        .filter(
            Document.user_id == current_user.id
        )
        .order_by(Document.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(doc.id),
            "file_name": doc.file_name,
            "created_at": doc.created_at
        }
        for doc in documents
    ]
@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted"
    }