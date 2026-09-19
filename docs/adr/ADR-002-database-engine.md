# ADR-002: Choice of Database Engine & Persistence Layer (PostgreSQL / SQLite + SQLAlchemy 2.0)

## Status
* **Status:** Accepted
* **Date:** 2026-09-19
* **Authors:** Lakshya, Vaibhav Rawat
* **Deciders:** Project Team

---

## 1. Context and Problem Statement
ExamPilot must record and aggregate complex, interconnected examination data:
- Hierarchical exam taxonomy: Exam $\to$ Section $\to$ Topic $\to$ Sub-topic $\to$ Difficulty.
- Question entities with distinct types: Multiple Choice (MCQs with 4 distinct options) vs. TITA (Type In The Answer).
- Historical attempt telemetry: Each user attempt records per-question time spent, selected options, review states, marks earned, and cognitive reflection tags.
- Aggregation queries for diagnostic analytics: Topic-wise accuracy, percentile curves, pacing distributions, and longitudinal progress.

Which persistence model and database technology best guarantees referential integrity, supports analytical aggregations, and complies with our ₹0 budget constraint?

---

## 2. Decision Drivers (Forces)
* **Referential Integrity:** An attempt must strictly link to existing questions and topics; orphan attempts corrupt analytical reporting.
* **Analytical Aggregations:** Need performant `JOIN`, `GROUP BY`, and window functions for topic-level diagnostic feedback.
* **Flexible Metadata:** Semi-structured AI outputs (e.g., step-by-step mathematical reasoning, elimination rationales) benefit from document-like storage alongside relational fields.
* **Zero Budget & Local Friction:** The system must run locally during development and testing without requiring costly managed database instances.

---

## 3. Considered Options
* **Option A:** MongoDB (NoSQL Document Store)
* **Option B:** Pure SQLite (Serverless Relational Database)
* **Option C:** PostgreSQL in Production + SQLite (via SQLAlchemy 2.0 ORM) in Local Dev / Automated Tests

---

## 4. Decision Outcome
* **Chosen Option:** Option C — **SQLAlchemy 2.0 ORM targeting PostgreSQL (Production) and SQLite with WAL mode (Local Development / Testing)**.
* **Rationale:** The relational model natively guarantees referential integrity between attempts, questions, and topics. Using SQLAlchemy 2.0's typed declarative mapping abstracts the dialect differences, allowing the team to use zero-setup local SQLite during Phase 0–5 development while retaining full compatibility with PostgreSQL (and its native `JSONB` type) for production analytics.

---

## 5. Pros and Cons of the Options

### Option A: MongoDB
* **Good:** Easy to insert arbitrary JSON outputs from LLMs without upfront schema migrations.
* **Bad:** Lack of strict foreign-key constraints allows data drift. Relational aggregations across historical attempts, questions, and topics require complex multi-stage aggregation pipelines (`$lookup`) which are error-prone, lack schema safety, and are harder to defend academically.

### Option B: Pure SQLite
* **Good:** Zero installation required, single-file storage, ideal for offline development and local demonstrations.
* **Bad:** Concurrent write bottlenecks, limited support for concurrent test sessions or parallel batch generation.

### Option C: SQLAlchemy 2.0 + SQLite (Dev) / PostgreSQL (Prod)
* **Good:**
  - Strict ACID guarantees and foreign key referential integrity.
  - Efficient analytical queries (`AVG(time_spent)`, `SUM(marks)`, `GROUP BY topic`).
  - Native `JSON` column support accommodates variable reasoning traces.
  - Single codebase runs against in-memory/file SQLite for instant `pytest` execution.
* **Bad:** Requires formal migration management (`Alembic`).

---

## 6. How it Works in ExamPilot
- Models are defined in `backend/app/db/models/` using SQLAlchemy 2.0 `Mapped` and `mapped_column` type annotations.
- Alembic handles forward and rollback database migrations.
- In testing, an in-memory SQLite database (`sqlite+aiosqlite:///:memory:`) executes unit tests in milliseconds without network dependencies.

---

## 7. Viva Defense Notes
* *"We chose a relational architecture because the domain model has deep referential relationships connecting attempts, questions, and topic hierarchies. We used SQLAlchemy 2.0 as an abstraction layer to maintain zero-friction local development on SQLite while retaining full ACID compliance and relational aggregation capabilities for analytics."*
