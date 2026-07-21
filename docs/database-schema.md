# Database Schema

## Collections

### resumes

Stores parsed resume information.

```
_id
name
skills
projects
education
experience
certifications
updated_at
```

---

### interview_sessions

Stores interview sessions.

```
_id
user_name
role
experience
status
created_at
completed_at
overall_score
questions[]
```

---

### interview_results

Stores evaluation for each question.

```
question
answer
technical_score
communication_score
confidence_score
feedback
ideal_answer
```