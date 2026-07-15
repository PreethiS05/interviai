import json

from groq import Groq

from app.prompts.ats_prompt import ATS_PROMPT
from app.services.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


def analyze_resume(profile: dict, job_description: str):
    # Build the prompt safely
    prompt = (
        ATS_PROMPT
        .replace("{resume}", json.dumps(profile, indent=2))
        .replace("{job_description}", job_description)
    )

    print("\n========== FINAL PROMPT ==========")
    print(prompt)
    print("==================================\n")

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

    # Remove markdown fences if present
    if content.startswith("```json"):
        content = content.replace("```json", "", 1)

    if content.startswith("```"):
        content = content.replace("```", "", 1)

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    try:
        return json.loads(content)

    except json.JSONDecodeError as e:
        print("\n===== JSON PARSE ERROR =====")
        print(e)
        print(content)
        raise Exception(f"Groq returned invalid JSON:\n\n{content}")