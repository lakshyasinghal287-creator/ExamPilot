# CAT Psychometric Patterns & Question Design Specification
> Synthesized from official CAT examination patterns (2020–2024) and psychometric design rules.

---

## 1. Examination Architecture Overview
The modern CAT framework is a 120-minute, 3-section computer-based test with 40-minute immutable section timers:
* **Section 1: VARC** (24 Questions: ~16 Reading Comprehension across 4 passages, ~8 Verbal Ability)
* **Section 2: DILR** (20 Questions: 4 Caselets of 5 questions each, or 2 sets of 4 + 2 sets of 6)
* **Section 3: QA** (22 Questions: Arithmetic ~35-40%, Algebra ~30-35%, Geometry ~15%, Numbers ~10%, Modern Math ~5%)
* **Scoring Rubric:** $+3.0$ for correct MCQ, $-1.0$ for incorrect MCQ, $0.0$ for incorrect TITA (no negative marking).

---

## 2. Sectional Cognitive Traps & Distractor Taxonomy

### 2.1 Verbal Ability & Reading Comprehension (VARC)
CAT RC passages are dense, academic, and argumentative (~450–500 words), drawn from Philosophy, Sociology, Economics/Business History, and Science/Technology.

#### The Four Classic CAT Distractor Patterns:
1. **The Extreme Words Trap:** Options containing absolute language (*always, completely, never, inherently, fundamentally*) that turn a nuanced, qualified passage statement into an indefensible extreme.
2. **The Echo / Familiarity Trap:** Options that mirror the vocabulary and exact phrases of the passage, but subtly invert the subject-object relationship or attribute the view to the wrong entity.
3. **The Half-Right / Half-Wrong Trap:** The first clause accurately summarizes the passage premise, but the concluding clause introduces an unwarranted generalization or out-of-scope conclusion.
4. **The Plausible Out-of-Scope Trap:** Statements that are empirically true in the real world or align with common sense, but are nowhere stated or supported by the author in the text.

### 2.2 Data Interpretation & Logical Reasoning (DILR)
CAT DILR does not test raw calculation speed; it tests constraint satisfaction and structural deduction.

#### Core Paradigms:
* **Matrix Arrangements:** Multi-attribute mapping under conditional rules.
* **Games & Tournaments:** Round-robin or knockout tournaments where missing outcomes must be deduced from aggregate points and goal differences.
* **Truth-Tellers & Liars:** Binary logic puzzles requiring assumption of cases.
* **Missing Data Tables & Set Theory:** Tables where column/row totals require solving systems of inequalities rather than equations.

#### Algorithmic Generation Principle:
* *Work Backward:* Generate the completed grid/tournament table first $\to$ systematically redact 60% of entries $\to$ generate 4 interdependent clues (2 direct, 1 relative comparison, 1 negative constraint).

### 2.3 Quantitative Ability (QA)
Questions prioritize multi-step reasoning, hidden domain constraints, and algebra-geometry synthesis over single-formula recall.

#### Classic Cognitive Traps:
* **Constraint Omission Trap:** Forgetting constraints like *"x and y are distinct positive integers"*. Distractors must include the answer where $x=y$ or $x=0$.
* **Modulus Critical Points:** Splitting $|x-a| + |y-b| < k$ without verifying valid integer lattice points.
* **Negative Remainder Inversion:** Calculating modular arithmetic with negative remainders and forgetting to add the divisor back.

---

## 3. Few-Shot Structural Generation Template (VARC)

```json
{
  "genre": "Philosophy / Sociology",
  "passage_length": 480,
  "question_type": "MCQ",
  "stem": "Based on the third paragraph, the author's characterization of 'technological determinism' can best be described as:",
  "options": [
    {
      "key": "A",
      "text": "An inherently flawed doctrine that completely ignores human socio-economic agency.",
      "trap_type": "Extreme Word Trap ('inherently', 'completely')"
    },
    {
      "key": "B",
      "text": "A historically observable tendency, albeit one constrained by institutional regulatory feedback.",
      "is_correct": true,
      "trap_type": "None (Nuanced, qualified agreement with text)"
    },
    {
      "key": "C",
      "text": "The primary cause of the Industrial Revolution's structural labor imbalances.",
      "trap_type": "Half-Right / Half-Wrong Trap"
    },
    {
      "key": "D",
      "text": "A modern economic hypothesis endorsed by early 20th-century sociologists.",
      "trap_type": "Echo Trap (Mirrors text terminology but misattributes timeline)"
    }
  ],
  "correct_answer": "B",
  "explanation": "Option B correctly reflects the author's qualified stance in paragraph 3..."
}
```
