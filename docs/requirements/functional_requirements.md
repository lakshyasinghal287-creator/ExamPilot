# Functional Requirements Specification (FRS)

---

## 1. System Scope & Functional Hierarchy

ExamPilot organizes its functional capabilities into **six core operational modules**:
1. **Module 1 (M1): Mock Test Simulation Engine**
2. **Module 2 (M2): Adaptive Practice & Drill Engine**
3. **Module 3 (M3): AI Generation & Deterministic Validation Pipeline**
4. **Module 4 (M4): Diagnostic Performance Analytics**
5. **Module 5 (M5): Qualitative VARC Reasoning Reflection**
6. **Module 6 (M6): Question Repository & Catalog Management**

Each requirement is uniquely identified by `FR-[MODULE_CODE][NUMBER]` and assigned a MoSCoW priority (**M**ust have, **S**hould have, **C**ould have, **W**on't have for now).

---

## 2. Detailed Functional Requirements

### Module 1: Mock Test Simulation Engine (FR-100 Series)

| Req ID | Priority | Requirement Title | Detailed Description |
| :--- | :--- | :--- | :--- |
| **FR-101** | **Must** | Exam Configuration Retrieval | The system shall retrieve exam structures from data configurations, enforcing section counts (3), section names (VARC, DILR, QA), question totals (66), and sectional time limits (40 minutes each). |
| **FR-102** | **Must** | Test Session Initialization | The system shall generate a unique `test_attempt_id`, record the initial start timestamp on the server, assemble a randomized question set conforming to CAT distributions, and return the first section payload. |
| **FR-103** | **Must** | Client-Server Timer Synchronization | The system shall maintain server-side timestamp validation. Every attempt event shall log the server time to detect client-side time manipulation or browser tab freezing. |
| **FR-104** | **Must** | Sectional Sequential Locking | The system shall enforce rigid sectional locking (VARC $\to$ DILR $\to$ QA). A candidate cannot access subsequent sections until the active section timer expires or the section is explicitly submitted. |
| **FR-105** | **Must** | Question Palette State Tracking | The system shall maintain real-time states for all 66 questions: `NOT_VISITED`, `NOT_ANSWERED`, `ANSWERED`, `MARKED_REVIEW`, and `ANSWERED_AND_MARKED`. |
| **FR-106** | **Must** | Response Persistence (Auto-Save) | Upon selecting an option or typing a TITA response, the frontend shall trigger an asynchronous save to persist the answer with zero disruption to the countdown timer. |
| **FR-107** | **Must** | Automatic Section & Exam Submission | When a section's 40-minute limit expires, the system shall automatically submit all unsubmitted answers, lock the section, and transition to the next section or complete the test. |
| **FR-108** | **Must** | Deterministic CAT Scoring Engine | Upon exam completion, the system shall compute marks deterministically: $+3$ for correct MCQs, $-1$ for incorrect MCQs, $+3$ for correct TITA, $0$ for incorrect TITA, and $0$ for unattempted. |

---

### Module 2: Adaptive Practice & Drill Engine (FR-200 Series)

| Req ID | Priority | Requirement Title | Detailed Description |
| :--- | :--- | :--- | :--- |
| **FR-201** | **Must** | Modular Practice Session Creation | The system shall allow students to configure untimed or custom-timed practice drills by selecting: Section, Topic, Sub-Topic, Target Difficulty (Level 1–5), and Question Count. |
| **FR-202** | **Must** | Instant Solution & Explanation Reveal | Unlike Mock Mode, Practice Mode shall allow students to immediately reveal the verified step-by-step solution, conceptual derivation, and alternative shortcuts after submitting an answer. |
| **FR-203** | **Should** | Dynamic Difficulty Adaptation (Session-Level) | In adaptive practice mode, if a student answers 3 consecutive questions correctly within expected time thresholds, the system shall serve a question of $+1$ higher difficulty. |
| **FR-204** | **Must** | Weakness-Targeted Drill Generation | The system shall provide a 1-click action: "Generate Practice from Weaknesses", querying recent error history to assemble targeted 10-question drills. |

---

### Module 3: AI Question Generation & Deterministic Validation (FR-300 Series)

| Req ID | Priority | Requirement Title | Detailed Description |
| :--- | :--- | :--- | :--- |
| **FR-301** | **Must** | Structured LLM Prompting & Schema Enforcement | The generation service shall prompt the LLM using strict JSON schemas requiring: `question_text`, `question_type` (MCQ/TITA), `options` (array of 4 if MCQ), `correct_answer`, `explanation`, `topic`, `subtopic`, `difficulty`, and `verification_script`. |
| **FR-302** | **Must** | Pydantic Schema Structural Validation | The system shall parse the LLM JSON response through a Pydantic v2 model. Any response missing keys, with malformed types, or fewer than 4 options for MCQs shall be rejected. |
| **FR-303** | **Must** | Deterministic Math Verification Engine (SymPy) | For Quantitative Ability questions, the system shall execute an automated Python verification routine using `SymPy` to re-derive the mathematical solution. If `calculated_result != llm_claimed_answer`, the question is rejected. |
| **FR-304** | **Must** | Distractor Integrity & Uniqueness Check | For MCQ questions, the validation pipeline shall verify that all 4 options are distinct, non-empty, and exactly one option matches the `correct_answer`. |
| **FR-305** | **Should** | Topic & Difficulty Sanity Checker | The system shall verify that the generated question contains keywords and conceptual entities relevant to the requested topic taxonomy. |
| **FR-306** | **Must** | Question Bank Persistence & State Transition | Only questions passing 100% of validation checks shall transition from `status="PENDING_VALIDATION"` to `status="VALIDATED"` and be committed to the question bank. |
| **FR-307** | **Must** | AI Provider Abstraction Layer | The LLM generator shall sit behind an abstract Python interface (`BaseLLMProvider`), allowing zero-code swapping between Google Gemini, local offline mocks, or future LLM providers. |

---

### Module 4: Diagnostic Performance Analytics (FR-400 Series)

| Req ID | Priority | Requirement Title | Detailed Description |
| :--- | :--- | :--- | :--- |
| **FR-401** | **Must** | Comprehensive Scorecard Generation | Post-test analysis shall compute: Total Score, Sectional Scores (VARC, DILR, QA), Total Attempts, Correct, Incorrect, Unattempted, and Overall Accuracy percentage. |
| **FR-402** | **Must** | Granular Topic & Sub-Topic Breakdown | The system shall aggregate performance across topics (e.g., Arithmetic vs. Algebra) and sub-topics (e.g., Remainders, Progressions), computing accuracy and net mark contributions. |
| **FR-403** | **Must** | Time-Per-Question & Pacing Profiling | The system shall track and visualize the time spent on every question, identifying "Time Sinks" (questions taking $>3$ minutes that resulted in an incorrect answer). |
| **FR-404** | **Should** | Speed-Accuracy Matrix | The system shall categorize attempts into a $2 \times 2$ matrix: Fast & Correct (Mastery), Slow & Correct (Needs Speed), Fast & Incorrect (Careless/Rushed), and Slow & Incorrect (Fundamental Weakness). |
| **FR-405** | **Must** | Explainable Weakness Summary | The system shall generate natural-language diagnostic summaries supported by underlying arithmetic facts (e.g., *"Number System accuracy is 25% across 4 attempts with an average time of 3m 12s, representing your highest mark leakage"*). |

---

### Module 5: Qualitative VARC Reasoning Reflection (FR-500 Series)

| Req ID | Priority | Requirement Title | Detailed Description |
| :--- | :--- | :--- | :--- |
| **FR-501** | **Should** | Optional Post-Attempt Reflection Modal | In Practice Mode, students can optionally record their reasoning for selecting an answer (e.g., Direct Evidence, Elimination, Guess, Author Tone). |
| **FR-502** | **Should** | Distractor Elimination Failure Diagnosis | For Reading Comprehension errors, the system shall track whether students frequently fall for specific trap types (e.g., "Option too broad", "Out of passage scope", "Distorted extreme statement"). |
| **FR-503** | **Should** | Confidence-vs-Accuracy Calibration | The system shall plot self-reported confidence (High, Medium, Low) against actual accuracy to identify student overconfidence bias in verbal reasoning. |

---

### Module 6: Question Repository & Administration (FR-600 Series)

| Req ID | Priority | Requirement Title | Detailed Description |
| :--- | :--- | :--- | :--- |
| **FR-601** | **Must** | Seeded Question Bank Loader | The system shall provide CLI scripts to seed the database with an initial corpus of pre-verified benchmark CAT questions. |
| **FR-602** | **Should** | Question Flagging & Audit Log | If a student discovers an ambiguous question during a test, they can flag it. The system logs the flag and question ID for administrative review. |
| **FR-603** | **Must** | Attempt History Retrieval | Students can view historical test summaries, comparing score progression over time across successive mock attempts. |
