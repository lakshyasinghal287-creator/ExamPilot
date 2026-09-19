# Software Requirements Specification (SRS)
## Project: ExamPilot — AI-Based Mock Test Generator and Analyzer for CAT
**Standard:** Conforming to IEEE Std 830-1998 / ISO/IEC/IEEE 29148  
**Document Version:** 1.0  
**Authors:** Lakshya, Vaibhav Rawat  
**Date:** September 2026  
**Status:** Approved Baseline  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document details the complete functional and non-functional requirements for **ExamPilot**, an AI-powered mock examination generator, timed test engine, and diagnostic learning platform for the Common Admission Test (CAT). This document serves as the formal contractual baseline between the student development team and university evaluators for design, implementation, verification, and oral defense (viva).

### 1.2 Scope of the System
ExamPilot is a web-based educational software platform engineered to address the limitations of static question banks and superficial test analytics in high-stakes competitive examinations.

**Key capabilities include:**
1. **Authentic CAT Simulation:** A timed, multi-section test engine replicating official CAT mechanics (VARC $\to$ DILR $\to$ QA sequence, 40-minute sectional locks, 5-state question palette, MCQ and TITA scoring).
2. **Deterministic AI Question Generation Pipeline:** An automated generation pipeline that couples Large Language Models (LLMs) with strict Pydantic structural validation and Python `SymPy` symbolic execution to verify mathematical correctness before storing questions in a reusable question bank.
3. **Diagnostic Cognitive Analytics:** Granular evaluation of student performance across syllabus sub-topics, pacing profiles (time-per-question), and identification of cognitive failure modes.
4. **Explainable Adaptive Recommendations:** An algorithmic recommendation engine that maps diagnosed weaknesses to targeted remediation drills with transparent, explainable rationales.

### 1.3 Definitions, Acronyms, and Abbreviations
* **CAT:** Common Admission Test (National entrance exam for Indian Institutes of Management).
* **VARC:** Verbal Ability & Reading Comprehension.
* **DILR:** Data Interpretation & Logical Reasoning.
* **QA:** Quantitative Ability.
* **MCQ:** Multiple Choice Question (single correct answer from 4 choices; $+3$ for correct, $-1$ for incorrect).
* **TITA:** Type In The Answer (non-MCQ; numeric/short answer typed via keyboard; $+3$ for correct, $0$ for incorrect).
* **SymPy:** A deterministic Python library for symbolic mathematics and equation solving.
* **ADR:** Architecture Decision Record.
* **SRS:** Software Requirements Specification.
* **JSONB:** Binary JavaScript Object Notation (PostgreSQL indexed storage format).
* **LLM:** Large Language Model.

### 1.4 Document References
1. IEEE Std 830-1998: *IEEE Recommended Practice for Software Requirements Specifications*.
2. ISO/IEC 25010:2011: *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE)*.
3. [ExamPilot Project Charter](../PROJECT_CHARTER.md)
4. [CAT Taxonomy & Specification](requirements/cat_taxonomy.md)
5. [Functional Requirements Specification](requirements/functional_requirements.md)
6. [Non-Functional Requirements Specification](requirements/non_functional_requirements.md)
7. [Use Case Specifications](requirements/use_cases.md)

---

## 2. Overall Description

### 2.1 Product Perspective
ExamPilot is a distributed, client-server web application composed of an asynchronous Python backend (`FastAPI`) and a component-driven Single Page Application (SPA) frontend (`React` with `TypeScript`). It interacts with external AI providers (e.g., Google Gemini API) via an abstract gateway for batch question generation, but delivers all live test sessions entirely from local persistent storage (`PostgreSQL` / `SQLite`).

```
+-------------------------------------------------------------+
|                      Client Browser                         |
|            React 18 + TypeScript SPA (Vite)                 |
+-------------------------------------------------------------+
                              │ HTTP / REST
                              ▼
+-------------------------------------------------------------+
|                   FastAPI Backend Service                   |
|  +--------------------+             +--------------------+  |
|  | Mock Test Engine   |             | Analytics Engine   |  |
|  +--------------------+             +--------------------+  |
|  | Validation Pipeline|             | Adaptive Engine    |  |
|  +--------------------+             +--------------------+  |
+-------------------------------------------------------------+
         │                                       │
         ▼                                       ▼
+-------------------------+            +----------------------+
| Relational Persistence  |            | External AI Provider |
| PostgreSQL / SQLite     |            | Google Gemini (Free) |
+-------------------------+            +----------------------+
```

### 2.2 Product Functions (High-Level Summary)
* **Test Simulation:** Configure, initiate, monitor, auto-save, and score 120-minute CAT mock exams.
* **Practice Engine:** Deliver modular, untimed/custom-timed topic-specific drills with instant symbolic step-by-step explanations.
* **AI Question Generation & Verification:** Ingest structured questions from LLMs, run Pydantic schema validation, execute SymPy deterministic math verification, and persist to the reusable question bank.
* **Diagnostic Reporting:** Calculate accuracy, net score contribution, time-per-question, speed-accuracy trade-offs, and pacing alerts.
* **Closed-Loop Adaptation:** Formulate transparent practice recommendations based on historical error patterns.

### 2.3 User Classes and Characteristics
1. **CAT Aspirant (Primary User):** Undergraduate students or working professionals preparing for CAT. Demands realistic test conditions, zero lag during test taking, and accurate diagnostic feedback without flawed answer keys.
2. **Academic Evaluator / Administrator:** University faculty and examiners evaluating software architecture, code quality, test coverage, and theoretical defense during viva.

### 2.4 Design and Implementation Constraints
* **C-01 (Budget):** Absolute ₹0 budget. Reliance exclusively on free-tier APIs and open-source tools.
* **C-02 (Deterministic Authority):** For mathematical questions, the LLM is treated as an untrusted generator; symbolic Python execution (`SymPy`) holds absolute authority over correctness.
* **C-03 (Decoupled Live Testing):** Live mock test delivery must not issue synchronous LLM API requests.
* **C-04 (Environment Portability):** The backend must execute seamlessly on local SQLite without complex Docker or cloud dependencies during viva presentations.

---

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces
* **Test Console:** Fullscreen-capable layout featuring a fixed header (Section tabs, remaining section timer, candidate details), main question pane (LaTeX equation rendering, option radio buttons, Clear Response, Mark for Review buttons), and right-hand collapsible Question Palette (66 buttons color-coded by state).
* **Analytics Dashboard:** Visual charts displaying sectional score breakdown, topic accuracy percentiles, question-by-question timeline (identifying time-sinks), and actionable weakness callouts.

#### 3.1.2 Hardware Interfaces
Standard personal computer / laptop with minimum 4 GB RAM and modern web browser (Chrome, Firefox, Edge).

#### 3.1.3 Software Interfaces
* **Python Runtime:** Python 3.11 or higher.
* **Database Driver:** SQLAlchemy 2.0 with `asyncpg` (PostgreSQL) and `aiosqlite` (SQLite).
* **AI Provider API:** Google Gemini REST API v1 via official Google GenAI SDK.
* **Math Solver Engine:** `sympy >= 1.12`.

---

### 3.2 System Features & Detailed Requirements

#### 3.2.1 Mock Test Lifecycle Management
* **SR-1.1:** System shall generate a test instance initialized with exactly 66 questions adhering to CAT taxonomy ratios (24 VARC, 20 DILR, 22 QA).
* **SR-1.2:** System shall enforce a server-validated 40-minute countdown for each section.
* **SR-1.3:** System shall transition question state from `NOT_VISITED` to `NOT_ANSWERED` upon initial rendering.
* **SR-1.4:** System shall automatically persist candidate responses to the database within $150 \text{ ms}$ of selection.
* **SR-1.5:** When section timer expires, system shall lock the active section and activate the subsequent section without user intervention.

#### 3.2.2 Question Validation Pipeline
* **SR-2.1:** Generation service shall enforce structured JSON schema on LLM outputs using native API schema parameters.
* **SR-2.2:** Pipeline shall execute Pydantic v2 validation over all fields: `question_text`, `question_type`, `options`, `correct_answer`, `explanation`, `section`, `topic`, `subtopic`, `difficulty`.
* **SR-2.3:** Pipeline shall verify that MCQs have exactly 4 distinct options and that `correct_answer` matches exactly one option.
* **SR-2.4:** For QA questions, pipeline shall extract the verification expression and evaluate it using `SymPy`. If the evaluated result diverges from `correct_answer`, the question is rejected.
* **SR-2.5:** Only questions passing all validations shall be marked `VALIDATED` and added to the accessible question bank.

#### 3.2.3 Diagnostic Analytics & Adaptation
* **SR-3.1:** Post-exam scoring engine shall apply $+3$ for correct MCQs, $-1$ for incorrect MCQs, $+3$ for correct TITA, and $0$ for incorrect TITA / unattempted.
* **SR-3.2:** Analytics engine shall compute per-question solving time and flag questions where $\text{Time Spent} > 180 \text{ seconds}$ and $\text{Result} == \text{Incorrect}$ as "Critical Time Sinks".
* **SR-3.3:** Recommendation engine shall compute topic weakness score:
  $$W_{\text{topic}} = (1 - \text{Accuracy}_{\text{topic}}) \times \text{Weight}_{\text{topic}} \times \left(\frac{\text{AvgTime}_{\text{topic}}}{\text{TargetTime}}\right)$$
* **SR-3.4:** System shall generate targeted 10-question practice drills targeting the sub-topic with highest $W_{\text{topic}}$.

---

## 4. Non-Functional Requirements Summary

| Metric Category | Target Value | Verification Method |
| :--- | :--- | :--- |
| **API Response Latency** | $< 150 \text{ ms}$ (p95) for test-taking calls | Benchmark via load-testing script |
| **Scoring Execution Time** | $< 100 \text{ ms}$ for 66 questions | Automated unit test timing |
| **Test Coverage** | $\ge 80\%$ on business logic | `pytest --cov` |
| **Answer Key Reliability** | 100% verified math keys in QA | Deterministic SymPy test assertions |
| **Fault Recovery** | Seamless state restore after browser crash | Automated browser refresh test |

---

## 5. Requirements Traceability Matrix (RTM)

| Functional Req ID | System Requirement | Architectural Module | Primary Test Case |
| :--- | :--- | :--- | :--- |
| **FR-101** | SR-1.1 | Test Session Service (`test_service.py`) | `test_create_mock_session_taxonomy_distribution` |
| **FR-103** | SR-1.2 | Timer Synchronization Service | `test_server_timer_authoritative_expiry` |
| **FR-105** | SR-1.3 | Palette State Machine (`palette_manager.py`) | `test_palette_state_transitions` |
| **FR-108** | SR-3.1 | CAT Scoring Engine (`scoring_service.py`) | `test_cat_marking_rubric_mcq_and_tita` |
| **FR-301** | SR-2.1 | LLM Provider Layer (`gemini_provider.py`) | `test_structured_json_schema_enforcement` |
| **FR-302** | SR-2.2 | Pydantic Schema Validator (`schemas/question.py`) | `test_pydantic_question_schema_rejection` |
| **FR-303** | SR-2.4 | SymPy Deterministic Solver (`math_verifier.py`) | `test_sympy_algebraic_solution_verification` |
| **FR-401** | SR-3.1 | Performance Analytics (`analytics_service.py`) | `test_scorecard_and_accuracy_calculations` |
| **FR-403** | SR-3.2 | Pacing Diagnostic Engine (`pacing_service.py`) | `test_critical_time_sink_detection` |
| **FR-204** | SR-3.4 | Adaptive Recommendation Engine (`recommender.py`) | `test_weakness_weighted_drill_generation` |

---

## 6. Viva Defense Notes
* *"Our Software Requirements Specification conforms to IEEE 830 standards, establishing an unambiguous Requirements Traceability Matrix (RTM) that connects every functional requirement directly to its backend service and automated verification test suite. This guarantees that our system architecture and code are directly derived from documented, verified engineering specifications."*
