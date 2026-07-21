INTERVIEW_QUESTION_PROMPT = """
You are a senior technical interviewer.

Generate 5 interview questions for the following candidate.

Role:
{role}

Experience:
{experience}

Return ONLY valid JSON in this format:

{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5"
  ]
}

Rules:
- Questions should match the role.
- Mix conceptual and practical questions.
- Do not include explanations.
- Return only JSON.
"""