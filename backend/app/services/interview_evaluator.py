import json

from groq import Groq

from app.prompts.interview_evaluation_prompt import (
    INTERVIEW_EVALUATION_PROMPT,
)
from app.services.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


def evaluate_answer(question: str, answer: str, job_role: str):
    prompt = (
        INTERVIEW_EVALUATION_PROMPT
        .replace("{question}", question)
        .replace("{answer}", answer)
        .replace("{job_role}", job_role)
    )

    response = client.chat.completions.create(
        model=settings.MODEL,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    content = response.choices[0].message.content.strip()

    print("\n========== RAW GROQ RESPONSE ==========")
    print(content)
    print("=======================================\n")

    # Remove markdown if the model returns it
    if content.startswith("```json"):
        content = content.replace("```json", "", 1)

    if content.startswith("```"):
        content = content.replace("```", "", 1)

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    try:
        return json.loads(content)

    except json.JSONDecodeError:
        raise Exception(f"Groq returned invalid JSON:\n\n{content}")