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
    context,
    memory=""
):

    prompt = f"""
You are an AI Research Assistant.

Your job:
- Answer ONLY using provided context
- Use previous conversation memory
- Give structured answers
- Be concise and professional
- Never hallucinate

Previous Conversation:
{memory}

Document Context:
{context}

Question:
{question}

Answer:
"""

    response = model.generate_content(
        prompt
    )

    return response.text


def stream_answer(
    question,
    context,
    conversation_memory=""
):

    prompt = f"""
    Previous Conversation:
    {conversation_memory}

    Context:
    {context}

    Question:
    {question}

    Answer using only provided context.
    If information is unavailable,
    say so clearly.
    """

    response = model.generate_content(
        prompt,
        stream=True
    )

    for chunk in response:

        if hasattr(
            chunk,
            "text"
        ) and chunk.text:

            yield chunk.text
