import json

from groq import Groq

from app.prompts.interview_question_prompt import (
    INTERVIEW_QUESTION_PROMPT,
)
from app.services.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


def generate_questions(role: str, experience: str):
    prompt = (
        INTERVIEW_QUESTION_PROMPT
        .replace("{role}", role)
        .replace("{experience}", experience)
    )

    response = client.chat.completions.create(
        model=settings.MODEL,
        temperature=0.5,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content.strip()

    if content.startswith("```json"):
        content = content.replace("```json", "", 1)

    if content.startswith("```"):
        content = content.replace("```", "", 1)

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    return json.loads(content)["questions"]