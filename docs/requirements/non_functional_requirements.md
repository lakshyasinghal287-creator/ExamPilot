# Non-Functional Requirements Specification (NFRS)
> Aligned with ISO/IEC 25010 Systems and Software Quality Requirements and Evaluation (SQuaRE)

---

## 1. Performance Efficiency (NFR-PERF)

* **NFR-PERF-01 (API Response Latency):** Under standard local development and single-server loads, all core test-taking endpoints (`POST /attempts/{id}/answer`, `GET /attempts/{id}/questions`, `GET /questions/palette`) shall respond in **$< 150 \text{ ms}$** at the 95th percentile ($p95$).
* **NFR-PERF-02 (Deterministic Scoring Throughput):** Scoring calculation for a complete 66-question CAT mock attempt shall complete in **$< 100 \text{ ms}$** without blocking concurrent user sessions.
* **NFR-PERF-03 (Batch Question Validation Speed):** The multi-stage question validation pipeline (Pydantic parsing + `SymPy` execution) shall process a single mathematical QA question in **$< 800 \text{ ms}$** (excluding external LLM network latency).
* **NFR-PERF-04 (Zero Live-Exam LLM Dependency):** Live mock test delivery shall **never** issue synchronous network requests to external LLM APIs during an active student test session. All live test questions must be queried directly from indexed local/Postgres database tables.

---

## 2. Reliability & Fault Tolerance (NFR-REL)

* **NFR-REL-01 (Session State Recovery):** If a student experiences a sudden browser crash, network disconnection, or tab closure during an active mock test, reopening the test URL shall restore the candidate to the exact state (active section, current countdown time minus elapsed server time, and all previously saved answers).
* **NFR-REL-02 (External LLM Graceful Degradation):** In the event of Google Gemini API rate-limiting (HTTP 429), server errors (HTTP 5xx), or complete network failure, the generation pipeline shall catch exceptions, retry with exponential backoff up to 3 times, and gracefully fall back without crashing the backend service.
* **NFR-REL-03 (Data Integrity Invariant):** At no point shall a question be made available to students in Mock Mode if its `validation_status != "VALIDATED"`. Relational database check constraints shall enforce this invariant.

---

## 3. Security & Data Protection (NFR-SEC)

* **NFR-SEC-01 (Answer Key Leak Prevention):** During an active Mock Test, API payloads returning questions to the client shall **never** include the `correct_answer`, `explanation`, or `verification_script` fields. These fields are exclusively exposed after the test attempt transitions to `SUBMITTED`.
* **NFR-SEC-02 (Server-Side Time Authority):** Client timestamps are treated as untrusted user input. The server computes all section start and expiration intervals using immutable UTC server clocks to prevent local client clock tampering.
* **NFR-SEC-03 (Credential & Secret Isolation):** In accordance with Twelve-Factor Factor III principles, API keys (e.g., `GEMINI_API_KEY`) and secret tokens shall never be hardcoded or checked into Git. They must be ingested strictly via system environment variables.

---

## 4. Usability & Exam Fidelity (NFR-USE)

* **NFR-USE-01 (TCS iON Palette Fidelity):** The question navigation palette shall visually conform to the standardized 5-color CAT status indicators (Gray for Unvisited, Red for Not Answered, Green for Answered, Purple for Review, Purple+Green for Answered & Marked).
* **NFR-USE-02 (Zero-Interruption Responsive Layout):** The test-taking interface shall maintain responsive layout integrity across standard desktop resolutions ($1366 \times 768$ to $1920 \times 1080$), ensuring question text and option selection remain visible without erratic horizontal layout shifts.
* **NFR-USE-03 (Accessible Question Rendering):** Mathematical notations, formulas, and expressions shall be rendered cleanly using LaTeX / KaTeX without distorted raster image compression.

---

## 5. Maintainability & Code Quality (NFR-MAINT)

* **NFR-MAINT-01 (Type Safety):** 100% of backend Python code shall utilize explicit type annotations compatible with `mypy` strict mode. Frontend React code shall enforce TypeScript without `any` escape hatches in core domain types.
* **NFR-MAINT-02 (Test Coverage):** Core business logic (CAT scoring engine, SymPy deterministic validator, Pydantic question schemas, and adaptive weakness heuristics) shall maintain **$\ge 80\%$ automated unit test coverage** via `pytest`.
* **NFR-MAINT-03 (Architectural Documentation):** Every major architectural departure or technology adoption must be documented in an Architecture Decision Record (ADR) committed under `docs/adr/`.

---

## 6. Extensibility & Portability (NFR-EXT)

* **NFR-EXT-01 (Exam-Agnostic Core Engine):** The core test session and scoring engine must be decoupled from CAT-specific numbers. Section limits, question counts, and marking penalties shall be passed as declarative parameters, allowing future configuration of exams such as XAT, GMAT, or GRE.
* **NFR-EXT-02 (Zero-Cost Deployment):** The software stack must be executable on standard developer machines (Windows 10/11, macOS, Linux) without requiring paid cloud subscriptions, GPU clusters, or proprietary software licenses.
