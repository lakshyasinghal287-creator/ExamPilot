# ADR-001: Choice of Backend Web Framework (FastAPI)

## Status
* **Status:** Accepted
* **Date:** 2026-09-19
* **Authors:** Lakshya, Vaibhav Rawat
* **Deciders:** Project Team

---

## 1. Context and Problem Statement
ExamPilot requires an asynchronous backend API service capable of handling:
1. Long-running AI generation tasks communicating with external LLM endpoints.
2. Concurrent user interactions during simulated CAT mock tests without thread blocking.
3. Rigid JSON schema validation for both incoming requests and structured LLM responses.
4. Clean, auto-generated OpenAPI contracts for seamless frontend integration between two developers.

Which Python backend framework best balances asynchronous performance, schema safety, development velocity, and academic defensibility?

---

## 2. Decision Drivers (Forces)
* **Type Safety & Data Validation:** High risk of AI hallucination requires first-class schema enforcement on all payloads.
* **Asynchronous Concurrency:** LLM API calls have variable network latency (1s - 5s); synchronous blocking would cripple server throughput.
* **Contract Clarity:** Independent frontend development (React) requires an unambiguous, self-documenting API interface.
* **Team Velocity & Complexity:** Avoid heavyweight monolithic overhead while providing modern Python idioms.

---

## 3. Considered Options
* **Option A:** Flask (WSGI Microframework)
* **Option B:** Django (Batteries-Included Full-Stack Framework)
* **Option C:** FastAPI (ASGI Modern Async Framework)

---

## 4. Decision Outcome
* **Chosen Option:** Option C — **FastAPI**
* **Rationale:** FastAPI leverages Python 3.10+ type hints and Pydantic v2 natively. It executes on an ASGI server (`uvicorn`), natively supports `async`/`await` for external API and database I/O, and automatically generates interactive Swagger/OpenAPI documentation at `/docs`.

---

## 5. Pros and Cons of the Options

### Option A: Flask
* **Good:** Minimalist, mature ecosystem, large volume of beginner tutorials.
* **Bad:** Synchronous WSGI by default; async support is retrofitted. Requires third-party libraries (e.g., Marshmallow, Flask-RESTful, Flask-Swagger) which lead to fragmented boilerplate and no unified type system.

### Option B: Django + Django REST Framework (DRF)
* **Good:** Powerful built-in admin dashboard, battle-tested ORM, built-in auth and permissions.
* **Bad:** Heavy monolithic footprint. Django ORM is primarily synchronous (async support is partial). Unnecessary complexity for an API-only service consumed by an independent React SPA.

### Option C: FastAPI
* **Good:**
  - Native Pydantic v2 data models used simultaneously for validation, serialization, and OpenAPI documentation.
  - Native ASGI asynchronous performance comparable to Go/Node.js.
  - Dependency Injection system simplifies mocking external services (e.g., swapping live Gemini API for a deterministic mock during automated tests).
* **Bad:**
  - Newer ecosystem compared to Django/Flask.
  - Requires developers to understand async programming and avoid blocking calls in the event loop.

---

## 6. How it Works in ExamPilot
- All question payloads, test attempts, and analytics requests are modeled as Pydantic schemas in `backend/app/schemas/`.
- External LLM calls in the AI pipeline are declared `async` using `httpx` or Google's async SDK.
- The React frontend team consumes endpoints defined directly in the interactive Swagger UI (`/docs`).

---

## 7. Viva Defense Notes
* *"We selected FastAPI because our architecture requires asynchronous non-blocking I/O when communicating with external LLM APIs and strict Pydantic schema validation for AI-generated questions, ensuring that invalid questions are rejected at the serialization layer before touching the database."*
