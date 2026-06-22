from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from app.services.llm_service import (
    generate_answer,
    stream_answer   
)
import time
from fastapi.responses import StreamingResponse
from rapidfuzz import fuzz
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import (
    Document,
    ChatHistory
)
from app.core.dependencies import (
    get_current_user
)
 
from app.services.embedding_service import (
    generate_embedding
)

from app.utils.chunker import (
    chunk_text
)

import json
import numpy as np


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)

    return np.dot(a, b) / (
        np.linalg.norm(a)
        * np.linalg.norm(b)
    )


@router.post("/")
def chat(
    question: str,
    current_user=Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .all()
    )

    if not documents:
        raise HTTPException(status_code=404, detail="No documents found")

    previous_chats = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(5)
        .all()
    )

    conversation_memory = ""
    for chat in reversed(previous_chats):
        conversation_memory += f"User: {chat.question}\nAssistant: {chat.answer}\n"

    question_embedding = generate_embedding(question)

    top_chunks = []
    for doc in documents:
        if not doc.embedding:
            continue

        embeddings = json.loads(doc.embedding)
        content_chunks = chunk_text(doc.content)

        for i, emb in enumerate(embeddings):
            semantic_score = cosine_similarity(question_embedding, emb)

            if i < len(content_chunks):
                chunk = content_chunks[i]
                keyword_score = fuzz.partial_ratio(
                    question.lower(),
                    chunk.lower()
                ) / 100

                final_score = (0.7 * semantic_score) + (0.3 * keyword_score)
                page_metadata = json.loads(doc.page_metadata)

                page_number = 1

                if i < len(page_metadata):
                    page_number = (
                        page_metadata[i]
                        .get("page", 1)
                    )

                top_chunks.append(
                    (
                        final_score,
                        chunk,
                        page_number,
                        doc.file_name
                    )
                )

    top_chunks.sort(reverse=True, key=lambda x: x[0])

    unique_chunks = []
    chunk_scores = []
    seen = set()

    for score, chunk, page_num, file_name in top_chunks:
        if chunk not in seen:
            unique_chunks.append(chunk)
            chunk_scores.append(
                (
                    score,
                    chunk,
                    page_num,
                    file_name
                )
            )
            seen.add(chunk)

        if len(unique_chunks) == 3:
            break

        final_answer = " ".join(unique_chunks)

    best_page = 1
    best_file = "unknown document"


    question_words = (
        question.lower()
        .replace("?", "")
        .split()
    )

    best_overlap = 0

    for score, chunk, page_num, file_name in chunk_scores:

        chunk_lower = chunk.lower()

        overlap = sum(
            1
            for word in question_words
            if word in chunk_lower
        )

        if overlap > best_overlap:

            best_overlap = overlap
            best_page = page_num
            best_file = file_name
    def generate_stream():

        full_response = ""

        for chunk in stream_answer(
            question,
            final_answer,
            conversation_memory
        ):

            full_response += chunk

            time.sleep(0.2)

            yield chunk

        source_text = (
            f"\n\nSource:\n"
            f"{best_file}"
            f"Page {best_page}"
        )

        full_response += source_text

        yield source_text

        chat = ChatHistory(
            user_id=current_user.id,
            question=question,
            answer=full_response
        )

        db.add(chat)
        db.commit()

    return StreamingResponse(
        generate_stream(),
        media_type="text/plain"
    )
 
@router.post("/compare")
def compare_documents(
    current_user=Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    documents = (
        db.query(Document)
        .filter(
            Document.user_id
            == current_user.id
        )
        .all()
    )

    if len(documents) < 2:

        raise HTTPException(
            status_code=400,
            detail="Upload at least 2 documents"
        )

    comparison_context = ""

    for doc in documents:

        comparison_context += (
            f"\nDocument: {doc.file_name}\n"
        )

        comparison_context += (
            doc.content[:2000]
        )

        comparison_context += "\n\n"

    prompt = f"""
    Compare the following documents.

    Highlight:

    - Key differences
    - Strengths
    - Weaknesses
    - Important insights

    Documents:

    {comparison_context}
    """

    result = generate_answer(
        "Compare these documents",
        comparison_context
    )

    return {
        "comparison": result
    }