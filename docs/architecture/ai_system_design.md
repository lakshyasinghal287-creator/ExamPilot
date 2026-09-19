# AI Generation & Deterministic Validation Subsystem Specification

---

## 1. Core Philosophy: The AI is an Untrusted Generator

In ExamPilot, Large Language Models are treated as **stochastic, untrusted proposition engines**.
* The LLM proposes candidate problem statements, plausible distractors, and suggested explanations.
* The internal software system holds **absolute deterministic authority** over mathematical correctness, structural compliance, and persistent banking.

```
       [ Prompt Generator ]
                 │
                 ▼
       [ LLM Provider Gateway ] (Google Gemini API / Mock)
                 │
                 ▼ (Raw JSON String)
       [ Stage 1: Pydantic Schema Validation ] ────► [REJECT: Syntax/Schema Fail]
                 │ (Type-Safe Object)
                 ▼
       [ Stage 2: Distractor & Key Integrity ] ────► [REJECT: Duplicate Options / Missing Key]
                 │
                 ▼
       [ Stage 3: Deterministic SymPy Solver ] ────► [REJECT: Math Discrepancy / Hallucination]
                 │ (Symbolic Invariant Holds)
                 ▼
       [ Stage 4: Topic & Keyword Sanity ]     ────► [REJECT: Mismatched Concept]
                 │
                 ▼
       [ Commit to Question Bank: VALIDATED ]
```

---

## 2. AI Provider Abstraction Interface (`BaseLLMProvider`)

To ensure zero-vendor lock-in and adhere to our ₹0 budget constraint, all AI calls are decoupled via an abstract base class:

```python
from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseLLMProvider(ABC):
    """Abstract interface for generative LLM providers."""

    @abstractmethod
    async def generate_structured_json(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Sends prompt to LLM and guarantees a validated JSON dictionary matching response_schema.
        Must handle retries, timeouts, and rate limits.
        """
        pass
```

### Concrete Implementations:
1. **`GeminiLLMProvider`**: Uses Google's free-tier Gemini 1.5/2.0 Flash API with `response_mime_type="application/json"` and `response_schema` enforcement.
2. **`MockLLMProvider`**: Returns deterministic, pre-recorded CAT questions for offline unit testing, CI pipelines, and environments without internet access.

---

## 3. Strict Pydantic Output Schema

The prompt enforces a JSON output conforming exactly to the following Pydantic model:

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class GeneratedOption(BaseModel):
    key: Literal["A", "B", "C", "D"]
    text: str = Field(..., min_length=1)

class GeneratedQuestionPayload(BaseModel):
    section: Literal["VARC", "DILR", "QA"]
    topic: str
    subtopic: str
    difficulty_level: Literal[1, 2, 3, 4, 5]
    question_type: Literal["MCQ", "TITA"]
    question_text: str = Field(..., min_length=15)
    options: Optional[List[GeneratedOption]] = None
    correct_answer: str = Field(..., min_length=1)
    explanation: str = Field(..., min_length=20)
    verification_expression: Optional[str] = Field(
        None,
        description="SymPy-evaluable Python string that computes the exact numerical or algebraic answer."
    )
```

---

## 4. Multi-Stage Deterministic Validation Pipeline

### Stage 1: Structural & Syntactic Validation
* Validates JSON parseability.
* Enforces that MCQs have **exactly 4 options** (`A`, `B`, `C`, `D`).
* Verifies that `correct_answer` matches exactly one option key for MCQs.

### Stage 2: Distractor Integrity Check
* Checks that all 4 options are mutually distinct:
  $$\text{Length}(\text{Set}(\text{options})) == 4$$
* Rejects questions with duplicate options or lazy distractors (e.g., "None of the above", "All of the above", which are invalid in official CAT format).

### Stage 3: Deterministic Mathematical Verification (`SymPy`)
For Quantitative Ability questions:
1. The generation prompt instructs the model to provide a `verification_expression` (e.g., `solve(x**2 - 5*x + 6, x)` or `pow(2, 2026, 7)`).
2. The verification engine executes the expression within a restricted Python Abstract Syntax Tree (AST) sandbox that permits only safe `sympy` operations (no `os`, `sys`, `eval`, or file I/O).
3. The symbolic result is cast to canonical format and compared against `correct_answer`:
   $$\text{Canonical}(\text{SymPy Result}) == \text{Canonical}(\text{LLM Correct Answer})$$
4. If the results diverge, the question is flagged as an **AI Math Hallucination** and immediately rejected.

---

## 5. Rate-Limiting, Retries & Fallback Strategy

To operate reliably within free-tier API quotas (e.g., Gemini's 15 Requests Per Minute):
* **Decoupling:** Live test delivery never invokes generation; it reads only from pre-validated records.
* **Batch Generation Worker:** Generates questions in background tasks with a minimum 4-second delay between requests.
* **Exponential Backoff:** Catches HTTP 429 errors and retries with jitter:
  $$\text{Wait Time} = 2^{\text{attempt}} + \text{Uniform}(0, 1)$$
* **Idempotency & Deduplication:** Generates a SHA-256 hash of normalized `question_text` to prevent duplicate questions in the bank.

---

## 6. Viva Defense Notes
* *"We do not blindly trust the LLM. In our architecture, the LLM is merely a candidate generator. Quantitative questions must pass through our SymPy symbolic solver to prove their mathematical correctness before they are saved to the database. This directly addresses the hallucination problem that plagues naive AI applications."*
