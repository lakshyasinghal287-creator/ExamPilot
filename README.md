# ExamPilot 🎓
> **An AI-Powered Mock Test Generator and Diagnostic Learning Platform for the Common Admission Test (CAT)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://react.dev)

---

## 📌 Academic Context & Overview
**ExamPilot** is an engineering mini-project developed for a 4-credit undergraduate B.Tech Computer Science & Engineering curriculum.
* **Student Team:** Lakshya & Vaibhav Rawat
* **Target Domain:** Common Admission Test (CAT) — VARC, DILR, and QA sections
* **Objective:** Design, build, and empirically evaluate a verifiable test generation and diagnostic feedback system that operates under realistic CAT exam constraints with an explainable adaptive learning loop.

Unlike superficial "LLM wrapper" applications that blindly relay prompt completions to students, ExamPilot implements a **multi-stage deterministic validation pipeline** that couples Large Language Model generation with symbolic math solving (`SymPy`), strict structural schema enforcement (`Pydantic`), and diagnostic cognitive error classification.

---

## 🚀 Key Architectural Pillars

### 1. High-Fidelity CAT Mock Engine
* **Authentic Section Rules:** Replicates the official CAT format across Verbal Ability & Reading Comprehension (VARC), Data Interpretation & Logical Reasoning (DILR), and Quantitative Ability (QA).
* **Deterministic Scoring Engine:** Adheres strictly to official CAT marking rubrics: $+3$ marks for correct answers, $-1$ mark for incorrect MCQs, and $0$ negative marks for Non-MCQ / TITA (Type In The Answer) questions.
* **Client-Server Synchronized Palette:** Tracks exact question states (*Not Visited*, *Not Answered*, *Answered*, *Marked for Review*, *Answered & Marked for Review*) with server-side timestamp validation to eliminate local timer drift.

### 2. Multi-Stage AI Question Pipeline
```
[ Topic + Section + Difficulty Request ]
                   │
                   ▼
       [ LLM Generator (Gemini) ]
                   │
                   ▼ (Strict JSON Schema)
       [ Structural Validation (Pydantic v2) ]
                   │
                   ▼ (Deterministic Python Execution)
       [ Mathematical Verification (SymPy Solver) ]
                   │
                   ▼ (Semantic & Taxonomy Alignment)
       [ Consistency & Quality Filter ]
                   │
                   ▼
       [ Persistent Question Bank (PostgreSQL / SQLite) ]
```

### 3. Closed-Loop Adaptive Practice
* **Diagnostic Analytics:** Computes multidimensional accuracy metrics across sub-topics (e.g., Number Systems $\to$ Remainders/Cyclicity vs. Arithmetic $\to$ Time-Speed-Distance).
* **Explainable Recommendations:** An algorithmic engine that inspects historical failure modes and provides transparent justifications (e.g., *"Recommended: 5 Moderate Remainder questions due to a 33% accuracy rate and a 2.4x average solving time compared to baseline QA"*).
* **Qualitative VARC Reflection:** Captures student elimination logic and confidence ratings to diagnose non-mathematical reading pitfalls without unsupported psychological leaps.

---

## 🛠️ Technology Stack

| Layer | Technology | Architectural Rationale |
| :--- | :--- | :--- |
| **Backend** | **Python 3.11+ / FastAPI** | Async concurrency, native Pydantic v2 validation schemas, self-documenting OpenAPI specs. |
| **Frontend** | **React 18 / TypeScript / Vite** | Predictable state machine management for the 66-question CAT palette, strong type safety. |
| **Database** | **PostgreSQL (Prod) / SQLite (Dev)** | Relational referential integrity, historical attempt aggregation, JSONB metadata storage. |
| **Verification** | **SymPy / AST Parser** | Deterministic mathematical and algebraic problem verification to eliminate LLM hallucinations. |
| **AI Layer** | **Google Gemini API** | Provider-abstracted structured JSON generation adhering to zero-budget API constraints. |
| **Testing** | **Pytest / Vitest** | Unit tests for scoring rubrics and validators; end-to-end integration tests for mock flows. |

---

## 📂 Repository Structure

```
ExamPilot/
├── .github/                 # Workflows, templates, and CI configurations
├── docs/                    # Formal Software Engineering Documentation
│   ├── adr/                 # Architecture Decision Records (ADRs)
│   ├── requirements/        # Functional & Non-Functional Requirements
│   ├── architecture/        # System Diagrams, Domain Models & ERDs
│   └── api/                 # OpenAPI & Endpoint Specifications
├── backend/                 # FastAPI Service (Implemented in Phase 5)
├── frontend/                # React/TypeScript Application (Phase 8)
├── PROJECT_CHARTER.md       # Foundational Charter and Objectives
├── CONTRIBUTING.md          # Team Workflow & Branching Guidelines
├── .env.example             # Twelve-Factor Configuration Template
└── README.md                # Project Overview & System Index
```

---

## 📋 Phased Development Lifecycle

* [x] **Phase 0:** Project Initialization, Governance, & ADR Blueprint
* [ ] **Phase 1:** Requirements Engineering & CAT Taxonomy Specification
* [ ] **Phase 2:** Formal Software Requirements Specification (SRS)
* [ ] **Phase 3:** Domain Modeling, Entity Relationships, & Class Diagrams
* [ ] **Phase 4:** System Architecture & C4 Component Design
* [ ] **Phase 5:** Relational Database Schema & Repository Layer
* [ ] **Phase 6:** RESTful API Design & OpenAPI Contracts
* [ ] **Phase 7:** AI Provider Abstraction & Deterministic Validation Pipeline
* [ ] **Phase 8:** MVP Test Simulation Engine & CAT Scoring Core
* [ ] **Phase 9:** Diagnostic Analytics & Explainable Recommendation Engine
* [ ] **Phase 10:** Comprehensive Verification, Empirical Evaluation, & Viva Defense

---

## 📄 License & Academic Integrity
This project is developed solely for academic research and educational evaluation at the undergraduate level. All architectural patterns and code are written cleanly, following software engineering principles with complete academic transparency.
