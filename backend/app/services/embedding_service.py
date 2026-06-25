import google.generativeai as genai

from app.config.settings import settings

genai.configure(
    api_key=settings.GEMINI_API_KEY
)


def generate_embedding(text: str):

    response = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_document"
    )

    return response["embedding"]