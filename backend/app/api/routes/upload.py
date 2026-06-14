from pypdf import PdfReader
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)

import shutil
import os
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import Document
from app.core.dependencies import (
    get_current_user
)

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


UPLOAD_FOLDER = "uploads"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def upload_document(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    allowed_types = [
        "application/pdf",
        "text/plain"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files allowed"
        )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    extracted_text = ""

    # PDF Extraction
    if file.content_type == "application/pdf":

        reader = PdfReader(file_path)

        for page in reader.pages:
            text = page.extract_text()

            if text:
                extracted_text += text + "\n"

    # TXT Extraction
    elif file.content_type == "text/plain":

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as txt_file:

            extracted_text = txt_file.read()

    document = Document(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        content=extracted_text
    )

    db.add(document)
    db.commit()

    return {
        "message": "File uploaded successfully",
        "file_name": file.filename,
        "preview": extracted_text[:500]
    }