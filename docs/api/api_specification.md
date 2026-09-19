# RESTful API Specification (OpenAPI Contract)
> Base URL: `/api/v1`  
> Format: JSON (`Content-Type: application/json`)  
> Security: Bearer JWT Token (`Authorization: Bearer <token>`)

---

## 1. Exam Configuration & Taxonomy Endpoints

### 1.1 List Active Exams
* **Route:** `GET /exams`
* **Purpose:** Retrieve all configured examinations (e.g., CAT 2026).
* **Auth:** Public
* **Response (200 OK):**
  ```json
  [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "code": "CAT-2026",
      "name": "Common Admission Test 2026",
      "total_duration_minutes": 120,
      "total_questions": 66,
      "sections": [
        {"code": "VARC", "name": "Verbal Ability & Reading Comprehension", "order": 1, "duration_minutes": 40, "question_count": 24},
        {"code": "DILR", "name": "Data Interpretation & Logical Reasoning", "order": 2, "duration_minutes": 40, "question_count": 20},
        {"code": "QA", "name": "Quantitative Ability", "order": 3, "duration_minutes": 40, "question_count": 22}
      ]
    }
  ]
  ```

### 1.2 Get Exam Syllabus Taxonomy
* **Route:** `GET /exams/{exam_code}/taxonomy`
* **Purpose:** Returns the complete topic/subtopic taxonomy tree for practice filtering.
* **Auth:** Public
* **Response (200 OK):**
  ```json
  {
    "exam_code": "CAT-2026",
    "sections": [
      {
        "code": "QA",
        "name": "Quantitative Ability",
        "topics": [
          {
            "code": "QA-ARITHMETIC",
            "name": "Arithmetic",
            "subtopics": [
              {"code": "QA-ARITH-TSD", "name": "Time, Speed & Distance"},
              {"code": "QA-ARITH-TW", "name": "Time & Work"}
            ]
          }
        ]
      }
    ]
  }
  ```

---

## 2. Mock Test Lifecycle Endpoints

### 2.1 Start Mock Test Session
* **Route:** `POST /tests/start`
* **Purpose:** Instantiates a new 120-minute CAT mock attempt. Randomizes 66 validated questions, sets start timestamp on server, and returns Section 1 payload.
* **Auth:** Student Bearer Token
* **Request:**
  ```json
  {
    "exam_code": "CAT-2026",
    "mode": "MOCK_EXAM"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "test_attempt_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "exam_code": "CAT-2026",
    "started_at": "2026-09-19T14:30:00Z",
    "active_section": {
      "code": "VARC",
      "name": "Verbal Ability & Reading Comprehension",
      "duration_seconds": 2400,
      "time_remaining_seconds": 2400,
      "questions": [
        {
          "question_id": "c7a8b9d0-1234-5678-90ab-cdef12345678",
          "sequence_number": 1,
          "question_type": "MCQ",
          "question_text": "Read the passage and answer...",
          "options": [
            {"option_id": "opt-1", "key": "A", "text": "Option A text"},
            {"option_id": "opt-2", "key": "B", "text": "Option B text"},
            {"option_id": "opt-3", "key": "C", "text": "Option C text"},
            {"option_id": "opt-4", "key": "D", "text": "Option D text"}
          ],
          "palette_state": "NOT_VISITED"
        }
      ]
    }
  }
  ```
* **Crucial Security Invariant:** Note that `correct_answer`, `explanation`, and math derivations are strictly excluded from this payload!

### 2.2 Auto-Save Question Response
* **Route:** `POST /tests/{test_attempt_id}/save-response`
* **Purpose:** Asynchronously persist student answer, palette state, and cumulative solving time.
* **Auth:** Student Bearer Token
* **Request:**
  ```json
  {
    "question_id": "c7a8b9d0-1234-5678-90ab-cdef12345678",
    "selected_option_id": "opt-2",
    "tita_answer_text": null,
    "palette_state": "ANSWERED",
    "time_spent_seconds_delta": 45
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "SAVED",
    "test_attempt_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "question_id": "c7a8b9d0-1234-5678-90ab-cdef12345678",
    "total_time_spent_seconds": 92
  }
  ```
* **Error (403 Forbidden):** If the section timer has expired on the server, saving is rejected.

### 2.3 Submit Active Section & Transition
* **Route:** `POST /tests/{test_attempt_id}/submit-section`
* **Purpose:** Locks the active section and activates the subsequent section (e.g., VARC $\to$ DILR).
* **Request:**
  ```json
  {
    "completed_section_code": "VARC"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "previous_section_status": "LOCKED",
    "next_section": {
      "code": "DILR",
      "duration_seconds": 2400,
      "time_remaining_seconds": 2400,
      "questions": [...]
    }
  }
  ```

### 2.4 Final Exam Finish & Score Computation
* **Route:** `POST /tests/{test_attempt_id}/finish`
* **Purpose:** Final submission. Closes test attempt, triggers deterministic CAT scoring engine (+3/-1, TITA rules), and computes marks.
* **Response (200 OK):**
  ```json
  {
    "test_attempt_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "status": "SUBMITTED",
    "submitted_at": "2026-09-19T16:30:00Z",
    "scorecard_summary": {
      "total_score": 78.0,
      "varc_score": 32.0,
      "dilr_score": 24.0,
      "qa_score": 22.0,
      "accuracy_percentage": 73.3
    },
    "analytics_url": "/api/v1/analytics/attempts/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
  ```

---

## 3. Practice & Adaptive Drill Endpoints

### 3.1 Create Practice Drill
* **Route:** `POST /practice/create`
* **Request:**
  ```json
  {
    "subtopic_code": "QA-NUM-REMAINDERS",
    "difficulty_level": 3,
    "question_count": 5
  }
  ```
* **Response (201 Created):** Returns questions configured for practice mode.

### 3.2 Submit Practice Question & Reveal Solution
* **Route:** `POST /practice/{session_id}/evaluate`
* **Request:**
  ```json
  {
    "question_id": "c7a8b9d0-1234-5678-90ab-cdef12345678",
    "selected_option_id": "opt-2"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "is_correct": true,
    "marks_awarded": 3.0,
    "correct_option_id": "opt-2",
    "explanation": "By Fermat's Little Theorem: 2^(p-1) = 1 (mod p)...",
    "verification_derivation": "Calculated via SymPy: pow(2, 6, 7) = 1",
    "distractor_analysis": {
      "A": "Common trap: forgot to subtract 1",
      "C": "Sign error during modular reduction"
    }
  }
  ```

---

## 4. AI Generation & Validation Pipeline Endpoints

### 4.1 Trigger Question Generation & Deterministic Validation
* **Route:** `POST /questions/generate-and-validate`
* **Auth:** Admin / Background Worker Token
* **Request:**
  ```json
  {
    "subtopic_code": "QA-ALGEBRA-QUADRATICS",
    "difficulty_level": 3,
    "question_type": "MCQ",
    "count": 1
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "pipeline_run_id": "pipe-run-001",
    "questions_requested": 1,
    "questions_validated": 1,
    "questions_rejected": 0,
    "results": [
      {
        "question_id": "550e8400-e29b-41d4-a716-446655440000",
        "validation_status": "VALIDATED",
        "sympy_verification_passed": true,
        "structural_schema_passed": true
      }
    ]
  }
  ```

---

## 5. Diagnostic Analytics & Recommendations Endpoints

### 5.1 Get Comprehensive Test Attempt Diagnostic
* **Route:** `GET /analytics/attempts/{test_attempt_id}`
* **Response (200 OK):**
  ```json
  {
    "test_attempt_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "summary": {
      "total_score": 78.0,
      "max_marks": 198,
      "attempted_count": 45,
      "correct_count": 31,
      "incorrect_count": 14,
      "overall_accuracy": 68.89
    },
    "topic_breakdown": [
      {
        "topic": "Arithmetic",
        "attempted": 10,
        "correct": 8,
        "accuracy": 80.0,
        "avg_time_seconds": 110
      },
      {
        "topic": "Number System",
        "attempted": 4,
        "correct": 1,
        "accuracy": 25.0,
        "avg_time_seconds": 195,
        "is_primary_weakness": true
      }
    ],
    "time_sinks": [
      {
        "question_id": "c7a8b9d0-...",
        "subtopic": "Remainders",
        "time_spent_seconds": 245,
        "result": "INCORRECT",
        "marks_lost": -1.0,
        "advice": "Spent > 4 mins on a 3-mark question and missed it. Practice early abandonment on remainder traps."
      }
    ]
  }
  ```

### 5.2 Get Active Adaptive Recommendations
* **Route:** `GET /recommendations/me`
* **Response (200 OK):**
  ```json
  [
    {
      "recommendation_id": "rec-01",
      "subtopic_code": "QA-NUM-REMAINDERS",
      "subtopic_name": "Remainders & Modular Arithmetic",
      "priority_score": 92.5,
      "rationale": "Accuracy in Number System is 25% across your last 2 mocks with an average time of 3m 15s per question, causing a net loss of 9 marks.",
      "drill_url": "/practice?subtopic=QA-NUM-REMAINDERS&count=5"
    }
  ]
  ```

---

## 6. Standard Error Response Format
All non-2xx responses follow the RFC 7807 Problem Details format:
```json
{
  "detail": {
    "error_code": "SECTION_LOCKED",
    "message": "The 40-minute timer for section VARC has expired. Further answer submissions for this section are rejected.",
    "timestamp": "2026-09-19T15:10:00Z"
  }
}
```

---

## 7. Viva Defense Notes
* *"We strictly enforce the principle of Least Privilege and Information Hiding in our API contracts: during an active test, endpoints serving question payloads systematically strip out the answer keys, explanations, and verification scripts. Only after the test session state transitions to `SUBMITTED` on the server does the analytics endpoint reveal verified solutions."*
