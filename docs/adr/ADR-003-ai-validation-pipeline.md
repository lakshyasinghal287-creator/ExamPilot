# ADR-003: Structured AI Question Generation & Multi-Stage Deterministic Validation

## Status
* **Status:** Accepted
* **Date:** 2026-09-19
* **Authors:** Lakshya, Vaibhav Rawat
* **Deciders:** Project Team

---

## 1. Context and Problem Statement
Standard Large Language Models (LLMs) are stochastic, auto-regressive token predictors. When prompted to create competitive exam questions (such as CAT Quantitative Ability):
1. LLMs frequently hallucinate incorrect arithmetic or algebraic derivations.
2. They occasionally mark the wrong option as the correct key or produce multiple identical options.
3. Natural language outputs vary unpredictably in structure, making regex or string parsing brittle and prone to runtime crashes.

ExamPilot cannot function as an untrusted "LLM wrapper." How do we design the AI generation pipeline to guarantee syntactic validity, mathematical correctness, and structural integrity before any question enters the question bank?

---

## 2. Decision Drivers (Forces)
* **Zero Tolerance for Flawed Answer Keys:** An incorrect math key destroys exam validity and student trust.
* **Format Predictability:** Downstream frontend components require strict schemas (e.g., exactly 4 options for MCQs, valid integer/decimal for TITA).
* **Decoupling Generation from Live Mock Delivery:** Timed tests must not be exposed to LLM latency, rate-limiting (HTTP 429), or network downtime.
* **Academic Merit:** Demonstrating deterministic validation versus stochastic AI generation provides genuine research and software engineering depth for our academic defense.

---

## 3. Considered Options
* **Option A:** Direct Prompting & Regex Parsing (Raw LLM output parsed via regular expressions).
* **Option B:** Structured JSON Schema Only (Prompting the LLM with JSON schema, parsing with Pydantic, but trusting the LLM's answer key).
* **Option C:** Multi-Stage Pipeline: Structured JSON Generation + Pydantic Schema Enforcement + Deterministic Symbolic Math Verification (`SymPy`) + Topic Consistency Filtering.

---

## 4. Decision Outcome
* **Chosen Option:** Option C — **Multi-Stage Structured Generation and Deterministic Verification Pipeline**.
* **Rationale:** Relying solely on the LLM's self-reported answer key is mathematically unsafe. By enforcing structured JSON schemas at the API boundary and running independent Python symbolic verification (`SymPy`) over math equations, we separate generation from verification.

---

## 5. Architectural Pipeline Design

```
Stage 1: Prompt Construction
         (Inject Topic, Difficulty, Target Sub-topic, CAT Structure Rules)
                          │
                          ▼
Stage 2: Structured LLM Invocation
         (Enforce response_mime_type="application/json" with strict schema)
                          │
                          ▼
Stage 3: Structural Validation (Pydantic v2)
         (Check required fields, 4 unique options for MCQ, non-empty text, valid difficulty enum)
                          │
             [Fails?] ────┴───► [Reject / Retry with feedback]
             [Passes]
                          │
                          ▼
Stage 4: Deterministic Math Verification (SymPy Engine)
         (For QA: Extract equations, re-solve symbolically in Python, verify claimed correct answer)
                          │
             [Fails?] ────┴───► [Reject / Log discrepancy]
             [Passes]
                          │
                          ▼
Stage 5: Semantic & Consistency Gate
         (Verify explanation matches correct key, distractor uniqueness check)
                          │
                          ▼
Stage 6: Persistent Storage
         (Commit to Question Bank with status=VALIDATED)
```

---

## 6. How it Works in ExamPilot
1. **Pydantic Schema:** `QuestionCreateSchema` defines fields: `question_text`, `question_type`, `options`, `correct_answer`, `explanation`, `section`, `topic`, `subtopic`, `estimated_difficulty`.
2. **SymPy Verification Unit:** For algebra and arithmetic, the prompt instructs the LLM to output a machine-verifiable verification expression or Python calculation snippet. The backend executes this calculation safely in an AST-restricted sandbox and confirms the mathematical invariant.
3. **Question Repository:** The live mock exam queries *only* questions with `status == "VALIDATED"`.

---

## 7. Viva Defense Notes
* *"To prevent AI hallucinations, we designed a multi-stage validation pipeline. While the LLM proposes the problem statement and distractors, the answer is independently verified using deterministic Python execution (SymPy). This architectural boundary separates generative creativity from deterministic correctness."*
