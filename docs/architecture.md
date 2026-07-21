# InterviAI Architecture

## Overview

InterviAI is an AI-powered interview preparation platform built using FastAPI, React, MongoDB, and Groq LLM.

The system helps users:

- Upload resumes
- Parse resumes
- Analyze ATS compatibility
- Generate interview questions
- Evaluate interview answers
- Conduct complete interview sessions

---

## Architecture

```
                User
                  │
                  ▼
      React Frontend (TanStack)
                  │
                  ▼
          FastAPI Backend
                  │
      ┌───────────┼───────────┐
      │           │           │
 Resume API   ATS API   Interview API
      │           │           │
      └───────────┼───────────┘
                  │
              Groq LLM
                  │
             MongoDB Atlas
```

## Technologies

- FastAPI
- React
- TanStack Router
- MongoDB
- Motor
- Groq API
- Python
- TypeScript