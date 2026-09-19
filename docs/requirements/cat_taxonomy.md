# CAT Examination Taxonomy & Specification

---

## 1. Official CAT Examination Structure (Standard Baseline)

The Common Admission Test (CAT) is a standardized computer-based management aptitude test administered in India. The current official pattern consists of **66 questions** divided into **three timed sections**, completed over **120 minutes**:

| Section Code | Section Name | Questions | Time Limit | Question Types |
| :--- | :--- | :--- | :--- | :--- |
| **VARC** | Verbal Ability & Reading Comprehension | 24 | 40 Minutes | ~16 RC questions (4 passages), ~8 VA questions |
| **DILR** | Data Interpretation & Logical Reasoning | 20 | 40 Minutes | 4 sets of 5 questions each (or combo of 4/6 sets) |
| **QA** | Quantitative Ability | 22 | 40 Minutes | ~14-16 MCQs, ~6-8 TITA |
| **Total** | **All 3 Sections** | **66** | **120 Minutes** | **Fixed Sequence, Strict Section Lock** |

---

## 2. Examination Mechanics & Rules

### 2.1 Fixed Sectional Sequence & Time Locking
* Section sequence is strictly enforced: **VARC $\to$ DILR $\to$ QA**.
* Each section has an immutable countdown timer of exactly **40 minutes** (2,400 seconds).
* **Sectional Lockout:**
  - Candidates cannot switch between sections arbitrarily.
  - Time saved in one section *cannot* be transferred to another section.
  - When the 40-minute sectional timer reaches `00:00`, the active section is automatically locked, answers are submitted, and the candidate is immediately transitioned to the subsequent section.

### 2.2 Question Types & Scoring Rubric
ExamPilot implements the official CAT scoring formula:

$$\text{Score} = (\text{Correct}_{\text{MCQ}} \times 3) - (\text{Incorrect}_{\text{MCQ}} \times 1) + (\text{Correct}_{\text{TITA}} \times 3) + (\text{Incorrect}_{\text{TITA}} \times 0) + (\text{Unattempted} \times 0)$$

| Question Type | Description | Input Format | Correct Score | Incorrect Score | Unattempted |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MCQ** | Multiple Choice Question | Single select from exactly 4 options (A, B, C, D) | **+3** | **-1** | **0** |
| **TITA** | Type In The Answer (Non-MCQ) | Numeric or short-text input without options | **+3** | **0 (No penalty)** | **0** |

### 2.3 Question Palette States (TCS iON Standard)
Every question in an active section transitions through a discrete 5-state state machine:

| State ID | State Label | Color Code / Indicator | Description |
| :--- | :--- | :--- | :--- |
| `NOT_VISITED` | Not Visited | Gray | Candidate has not viewed the question yet. |
| `NOT_ANSWERED` | Not Answered | Red / Orange | Viewed by candidate, but no answer chosen/typed. |
| `ANSWERED` | Answered | Green | Option selected or TITA input saved. |
| `MARKED_REVIEW` | Marked for Review | Purple | Marked for later revisit without an answer selected. |
| `ANSWERED_AND_MARKED` | Answered & Marked for Review | Purple with Green Dot | Answered, but flagged for re-checking (evaluates in final score). |

---

## 3. Syllabus & Sub-Topic Classification Taxonomy

ExamPilot models syllabus domains hierarchically to enable granular analytical diagnostics.

```
Section
  └── Topic
        └── Sub-Topic
              └── Question (Tagged with Cognitive Difficulty: 1 to 5)
```

### 3.1 Quantitative Ability (QA) Taxonomy

```
Quantitative Ability (QA)
├── Arithmetic (Weightage: ~35-40%)
│   ├── Percentages & Profit-Loss
│   ├── Simple & Compound Interest
│   ├── Ratio, Proportion & Variation
│   ├── Averages, Mixtures & Alligations
│   ├── Time, Speed & Distance (Races, Escalators, Boats)
│   └── Time & Work (Pipes & Cisterns)
├── Algebra (Weightage: ~30-35%)
│   ├── Linear & Quadratic Equations
│   ├── Polynomials & Roots
│   ├── Inequalities & Modulus
│   ├── Logarithms & Exponents
│   ├── Sequences, Series & Progressions (AP, GP, HP)
│   └── Functions & Graphs
├── Geometry & Mensuration (Weightage: ~15-20%)
│   ├── Triangles (Properties, Similarity, Congruence)
│   ├── Circles (Chords, Tangents, Secants)
│   ├── Quadrilaterals & Polygons
│   ├── Coordinate Geometry
│   └── 3D Mensuration (Volumes & Surface Areas)
├── Number System (Weightage: ~10%)
│   ├── Divisibility & Prime Factorization
│   ├── Remainders & Euler/Wilson/Fermat Theorems
│   ├── Unit Digits & Cyclicity
│   ├── Base System & Factorials
│   └── Highest Powers of Numbers
└── Modern Mathematics (Weightage: ~5-10%)
    ├── Permutations & Combinations
    ├── Probability
    └── Set Theory & Venn Diagrams
```

### 3.2 Data Interpretation & Logical Reasoning (DILR) Taxonomy

```
Data Interpretation & Logical Reasoning (DILR)
├── Data Interpretation (Caselet-Driven)
│   ├── Tables & Conditional Data
│   ├── Bar Charts, Column Graphs & Histograms
│   ├── Line Graphs & Time Series Trends
│   ├── Pie Charts & Proportional Breakdown
│   └── Scatter Plots & Radar/Spider Charts
└── Logical Reasoning (Puzzle-Driven)
    ├── Linear & Circular Seating Arrangements
    ├── Matrix Matching & Attribute Assignment
    ├── Games & Tournaments (Round Robin, Knockout)
    ├── Binary Logic & Truth-Liar Puzzles
    ├── Networks, Routes & Scheduling
    └── Grouping & Team Selection
```

### 3.3 Verbal Ability & Reading Comprehension (VARC) Taxonomy

```
Verbal Ability & Reading Comprehension (VARC)
├── Reading Comprehension (RC - ~65-70% Weightage)
│   ├── Philosophy, Psychology & Sociology
│   ├── Economics, Business & Trade History
│   ├── Science, Ecology & Technology
│   └── Art, Culture, Literature & Linguistics
│   └── Question Sub-Types:
│       ├── Main Idea & Primary Purpose
│       ├── Specific Fact & Detail Identification
│       ├── Inference & Author's Implicit Assumption
│       ├── Tone & Attitude
│       └── Application / Analogy / Parallel Reasoning
└── Verbal Ability (VA - ~30-35% Weightage)
    ├── Para-Jumbles (Sentence Rearrangement - TITA / MCQ)
    ├── Para-Summary (Condensing core essence)
    ├── Odd Sentence Out (Identify misfit)
    └── Para-Completion / Sentence Insertion
```

---

## 4. Cognitive Difficulty Model

ExamPilot defines difficulty across a **5-tier ordinal scale**:

| Level | Descriptor | Estimated CAT Percentile Target | Characteristics |
| :--- | :--- | :--- | :--- |
| **Level 1** | Elementary / Direct | 50th - 70th Percentile | Single-formula application, straightforward facts, clear distractors. |
| **Level 2** | Moderate Standard | 70th - 85th Percentile | 2-step reasoning, basic multi-concept combination. |
| **Level 3** | CAT Baseline | 85th - 95th Percentile | Ambiguous distractors, non-standard equation manipulations, hidden traps. |
| **Level 4** | Advanced / Challenging | 95th - 99th Percentile | Multi-concept synthesis (e.g., Geometry + Logarithms), heavy constraints. |
| **Level 5** | Frontier / Outlier | 99+ Percentile | Extreme constraint density, complex counter-intuitive deduction. |

---

## 5. Viva Defense Notes
* *"We codified the CAT structure into a data-driven taxonomy rather than hardcoded logic. This enables ExamPilot to easily reconfigure section durations, question totals, or scoring coefficients to simulate other exams (such as XAT, SNAP, or GATE) without refactoring the underlying test engine."*
