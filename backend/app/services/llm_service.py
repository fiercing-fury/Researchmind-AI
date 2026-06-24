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
You are an AI Research Assistant. Use the following document context to answer the question.

Rules:
1. Answer only from the provided document context.
2. If the answer is not present, say:
   "I could not find this information in the document."
3. Use bullet points when appropriate.
4. Prefer exact facts from the document.
5. Do not invent information.
6. Cite the relevant page if available.

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
