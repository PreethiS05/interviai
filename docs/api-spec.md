# API Specification

## Resume

POST /upload

Upload Resume

---

## Profile

GET /api/profile/{name}

Returns parsed profile.

---

## ATS

POST /api/ats/analyze

Returns ATS analysis.

---

## Interview

POST /api/interview/evaluate

Evaluates interview answers.

---

## Interview Session

POST /api/session/create

GET /api/session/{id}

POST /api/session/{id}/answer

POST /api/session/{id}/complete