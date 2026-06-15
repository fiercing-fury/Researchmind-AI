import google.generativeai as genai  # type: ignore[import]

from app.config.settings import (
    settings
)

genai.configure(
    api_key=settings.GEMINI_API_KEY
)

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash"
)


def generate_answer(
    question,
    context
):

    prompt = f"""
You are an AI Research Assistant.

Answer ONLY using the provided context.

If the answer is not found,
say:
"I could not find relevant information."

Context:
{context}

Question:
{question}

Answer:
"""

    response = model.generate_content(
        prompt
    )

    return response.text