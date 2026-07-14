import json
from app.models.resume import Resume
from groq import Groq
from app.services.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


def parse_resume(text: str):
    prompt = f"""
Extract the following information from this resume.

Return ONLY valid JSON.

Fields:
- name
- skills
- education
- experience
- projects
- certifications

Resume:

{text}
"""

    response = client.chat.completions.create(
        model=settings.MODEL,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content

    # Remove markdown fences if present
    content = (
        content.replace("```json", "")
               .replace("```", "")
               .strip()
    )

    data = json.loads(content)

    resume = Resume(**data)

    return resume.model_dump()