# PROJECT CHARTER: ExamPilot
## AI-Based Mock Test Generator and Analyzer for CAT

---

### 1. Document Information
- **Project Name:** ExamPilot (AI-Based Mock Test Generator and Analyzer)
- **Academic Context:** 4-Credit University B.Tech CSE Mini-Project
- **Team Members:** Lakshya, Vaibhav Rawat
- **Target Examination:** Common Admission Test (CAT) — Extensible to other national competitive exams
- **Timeline / Target Completion:** November 2026

---

### 2. Problem Statement
Preparing for high-stakes competitive examinations such as the CAT requires rigorous practice under realistic examination conditions coupled with precise, diagnostic performance analytics. Existing preparation platforms suffer from three major shortcomings:
1. **Static and Exhaustible Question Banks:** Commercial platforms rely on fixed test series that run out of fresh, high-quality questions calibrated to specific sub-topics and difficulties.
2. **Superficial Analytics:** Most existing test portals present raw metrics (scores, percentile approximations, and generic topic accuracy) without diagnosing underlying cognitive failure modes (e.g., misreading constraints, calculation slips, elimination failures in Reading Comprehension, or pacing bottlenecks).
3. **Lack of Closed-Loop Adaptation:** Existing platforms test students but fail to automatically curate and generate tailored, targeted practice sessions that directly target their diagnosed weaknesses.

Conversely, naive attempts to introduce AI into education produce "LLM wrappers" that hallucinate mathematical solutions, generate ambiguous verbal passages, hallucinate non-existent answer keys, and fail to satisfy strict exam standards.

ExamPilot addresses this problem by engineering a multi-stage, deterministic-validated AI question pipeline coupled with an explainable diagnostic engine and a closed-loop adaptive recommendation workflow.

---

### 3. Motivation
- **Academic Rigor:** To apply core Computer Science and Software Engineering principles (deterministic verification, domain modeling, relational integrity, RESTful API design, and statistical scoring) to a complex educational domain rather than building a superficial LLM wrapper.
- **Empirical Evaluation:** To compare AI-predicted question difficulty against empirical student attempt data, and validate automated question verification against deterministic ground truth.
- **Zero-Budget High Performance:** To prove that robust, production-grade architectural patterns (caching, schema enforcement, rate-limit resilience, and provider abstraction) can deliver high-quality test generation at zero cost using free-tier resources.

---

### 4. Objectives
1. **Realistic CAT Test Environment:** Reproduce the official CAT interface and exam mechanics (sectional timings, question palette, review markers, MCQ/TITA input formats, and CAT scoring rules [+3, -1 for MCQ; +3, 0 for TITA]).
2. **Multi-Stage Question Validation Pipeline:** Ingest, structure, and validate questions across three tiers:
   - *Structural Validation:* Strict schema enforcement (JSON Schema/Pydantic).
   - *Deterministic Answer Verification:* SymPy/Python execution for Quantitative Ability calculations to eliminate hallucinations.
   - *Consistency & Alignment Checks:* Explanation-to-key consistency and topic taxonomy matching.
3. **Reusable Question Repository:** Incrementally store validated questions to build a sustainable, hybrid question bank that minimizes unnecessary LLM API calls.
4. **Actionable Performance Analytics:** Track granular metrics (topic accuracy, difficulty-wise success, time-per-question, pacing profiles) to generate clear, diagnostic feedback.
5. **Explainable Adaptive Recommendation Engine:** Implement an algorithmic recommendation model that inspects student error patterns and curates targeted practice sets with transparent rationales.
6. **Defensible Academic Architecture:** Document design decisions via Architecture Decision Records (ADRs) and maintain a clean, incremental Git commit history suitable for oral defense (viva).

---

### 5. Project Scope

#### In-Scope (Core System)
- **Exam Configuration:** Data-driven CAT exam structure (VARC, DILR, QA) with configurable sectional limits and scoring rubrics.
- **Test Engine (Mock Mode):** Full test lifecycle: initiation, live section countdown, question palette states (Not Visited, Unanswered, Answered, Marked for Review), answer persistence, auto-submission on timeout, and deterministic score computation.
- **Practice Engine (Adaptive Mode):** Untimed and modular practice sessions filtered by section, topic, sub-topic, and difficulty.
- **AI Question Pipeline:** Provider-abstracted generation service (Google Gemini free-tier / local fallback), structured JSON schemas, deterministic validation engine, and persistent storage.
- **Diagnostic Analytics Dashboard:** Topic-wise accuracy, speed/accuracy trade-off charts, difficulty performance breakdown, and identified weakness summaries.
- **Adaptive Engine:** Heuristic-based/Bayesian weakness mapping with explainable drill generation.
- **Experimental VARC Qualitative Analysis:** Structured student self-reflection capture (confidence level, elimination strategy) to identify reasoning discrepancies in Reading Comprehension.

#### Out-of-Scope (Deferred to Future Iterations)
- Commercial payment gateways and subscription billing.
- Real-time multi-user proctoring via webcam/AI computer vision.
- Multi-tenant enterprise school administration portals.
- Arbitrary scanned PDF/OCR ingestion for paper-to-digital question scraping.
- Native mobile applications (iOS/Android) — the initial focus is a fully responsive web application.

---

### 6. Stakeholders
- **Student Candidates:** Primary end-users requiring realistic test simulation and targeted diagnostic feedback.
- **Project Creators (Lakshya & Vaibhav Rawat):** System architects, backend/frontend engineers, and viva candidates.
- **Academic Evaluators / University Faculty:** External and internal examiners evaluating software engineering process, architectural depth, code quality, test coverage, and documentation.

---

### 7. Assumptions
1. Free API tiers (e.g., Google Gemini 1.5/2.0 Flash / Pro) provide sufficient RPM/TPM quotas for batch generation and development when combined with caching and local persistence.
2. Official CAT pattern parameters (e.g., 66 questions total, 40 minutes per section, +3/-1 scoring) can be represented as configuration data rather than hardcoded rules.
3. Quantitative Ability and Logical Reasoning questions can be verified or cross-checked using deterministic Python scripts (e.g., `SymPy`, constraint solvers).
4. Both team members have access to modern development environments (Python 3.11+, Node.js/npm, Git) and internet connectivity.

---

### 8. Constraints
- **Financial Constraint:** ₹0 budget. Reliance exclusively on open-source libraries, local databases, and free-tier cloud APIs.
- **Temporal Constraint:** Completion and final defense readiness by November 2026 (~8 weeks of development).
- **Academic Integrity:** Transparent reporting of AI limitations; zero fabricated experimental results; complete student-level ownership of all code and architecture.
- **API Rate Limits:** Systems must gracefully handle network latency, rate limits (HTTP 429), and schema non-compliance through retries, fallbacks, and local caching.

---

### 9. Success Criteria
1. **Reliability & Correctness:** 100% of questions saved to the question bank must pass automated structural validation; 0% invalid answer keys in deterministically checked QA modules.
2. **Realistic Simulation:** Mock engine successfully manages a full 120-minute CAT session with multi-section transitions, local timer synchronization, and seamless auto-submission.
3. **Explainable Recommendations:** 100% of adaptive recommendations must produce a verifiable rationale linking back to specific historical test attempts.
4. **Engineering Standards:** Minimum 80% unit test coverage across business logic (scoring, validation pipeline, recommendation heuristics), accompanied by formal ADRs and zero undocumented architectural decisions.
5. **Viva Readiness:** Both team members can independently defend the data model, API contracts, architectural trade-offs, and verification algorithms.

---

### 10. Initial Risk Analysis & Mitigation Strategies
| Risk ID | Risk Description | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | LLM hallucinations in math calculations and answer keys | High | High | Implement Python deterministic verification (`SymPy`, math solvers) in the validation pipeline; reject any QA question whose code verification fails. |
| **R-02** | External API rate limits / quota exhaustion during live tests | High | Medium | Strictly decouple question generation from test-taking. Tests only draw from pre-generated, validated database items; live generation is restricted to background queues or practice drills. |
| **R-03** | Scope creep in frontend UI attempting to build an exact TCS iON clone | Medium | High | Define a phased UI: Focus first on functional equivalence (palette, timer, section locks, question states) using clean component libraries before pixel-perfect visual styling. |
| **R-04** | Complex DILR set generation producing logically inconsistent puzzles | High | High | Restrict initial generative scope to QA and VARC; seed DILR with verified structural templates or curated base sets before opening to open-ended LLM puzzle generation. |
| **R-05** | Loss of development momentum or merge conflicts between two teammates | Medium | Medium | Establish a strict GitHub feature-branch workflow, clear module ownership (e.g., Backend/AI Pipeline vs. Test Engine/Frontend), and granular atomic commits. |
