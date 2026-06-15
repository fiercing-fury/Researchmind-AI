from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from app.services.llm_service import (
    generate_answer
)
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
            similarity = cosine_similarity(question_embedding, emb)
            if i < len(content_chunks):
                top_chunks.append((similarity, content_chunks[i]))

    top_chunks.sort(reverse=True, key=lambda x: x[0])

    unique_chunks = []
    seen = set()
    for score, chunk in top_chunks:
        if chunk not in seen:
            unique_chunks.append(chunk)
            seen.add(chunk)
        if len(unique_chunks) == 3:
            break

    final_answer = " ".join(unique_chunks)

    ai_response = generate_answer(
    question,
    final_answer,
    conversation_memory
)

    chat = ChatHistory(user_id=current_user.id, question=question, answer=ai_response)
    db.add(chat)
    db.commit()

    return {"question": question, "answer": ai_response}