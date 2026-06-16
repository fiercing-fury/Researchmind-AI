from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from app.services.llm_service import (
    generate_answer
)
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
                top_chunks.append((final_score, chunk))

    top_chunks.sort(reverse=True, key=lambda x: x[0])

    unique_chunks = []
    chunk_scores = []
    seen = set()

    for score, chunk in top_chunks:

        if chunk not in seen:

            unique_chunks.append(
                chunk
            )

            chunk_scores.append(
                (
                    score,
                    chunk
                )
            )

            seen.add(chunk)

        if len(unique_chunks) == 3:
            break

    final_answer = " ".join(unique_chunks)
    best_chunk = ""

    question_words = (
        question.lower()
        .replace("?", "")
        .split()
    )

    best_overlap = 0

    for chunk in unique_chunks:

        chunk_lower = (
            chunk.lower()
        )

        overlap = sum(
            1
            for word
            in question_words
            if word in chunk_lower
        )

        if overlap > best_overlap:

            best_overlap = overlap
            best_chunk = chunk

    source_reference = (
        best_chunk
        .replace("\n", " ")
        .replace("  ", " ")
        .strip()
    )

    source_reference = (
        source_reference
        .replace("\n", " ")
        .replace("  ", " ")
        .strip()
    )

    words = (
        source_reference
        .split()
    )

    max_words = 50

    source_reference = (
        " ".join(
            words[:max_words]
        )
    )

    if len(words) > max_words:
        source_reference += "..."

        source_reference = (
            " ".join(
                words[:50]
            )
            + "..."
        )

    if len(source_reference) > 300:
        source_reference = (
            source_reference[:300]
            + "..."
        )

    ai_response = generate_answer(
        question,
        final_answer,
        conversation_memory
    )

    ai_response += (
        f"\n\nSource:\n"
        f"{source_reference}"
    )

    chat = ChatHistory(user_id=current_user.id, question=question, answer=ai_response)
    db.add(chat)
    db.commit()

    return {"question": question, "answer": ai_response}