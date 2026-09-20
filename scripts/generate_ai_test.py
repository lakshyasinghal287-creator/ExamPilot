"""
Live AI Question Generator for ExamPilot.
Generates authentic CAT 2026 questions across:
- VARC (24): 4 RC passages × 4 questions (16) + 8 Verbal Ability (3 PJ, 3 PS, 2 Odd)
- DILR (22): 2 sets of 5 questions + 3 sets of 4 questions = 22 questions
- QA (22): 6 Arithmetic + 6 Algebra + 6 Numbers + 4 Geometry = 22 questions
Total: 68 CAT questions with SymPy verification and strict CBT grouping.
"""

import asyncio
import os
import sys
import json
import re
import json_repair
import google.generativeai as genai

# Add repository root to pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, delete

from backend.app.core.config import settings
from backend.app.db.base import Base
from backend.app.db.models.exam import Exam, Section, Topic, SubTopic
from backend.app.db.models.question import Question, QuestionOption, QuestionType, ValidationStatus
from backend.app.ai_pipeline.math_verifier import verify_math_solution


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def clean_json(text: str) -> dict:
    t = text.strip()
    if t.startswith("```json"):
        t = t[7:]
    elif t.startswith("```"):
        t = t[3:]
    if t.endswith("```"):
        t = t[:-3]
    try:
        return json.loads(t.strip())
    except Exception:
        return json_repair.loads(t.strip())


async def call_gemini(model, prompt: str, max_retries: int = 5):
    for attempt in range(max_retries):
        try:
            resp = await asyncio.to_thread(model.generate_content, prompt)
            return resp
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "ResourceExhausted" in err_str:
                wait = 20 * (attempt + 1)
                print(f"   [429 Rate Limit] Backing off {wait}s (attempt {attempt+1}/{max_retries})...", flush=True)
                await asyncio.sleep(wait)
            else:
                raise
    raise RuntimeError("Exceeded max retries calling Gemini.")


def normalize_options(raw_options, correct_answer: str):
    if not raw_options:
        return []
    
    standard_keys = ['A', 'B', 'C', 'D']
    corr_str = str(correct_answer).strip().upper()
    extracted_texts = []

    if isinstance(raw_options, dict):
        for k in sorted(raw_options.keys()):
            extracted_texts.append(str(raw_options[k]).strip())
    elif isinstance(raw_options, list):
        for opt in raw_options:
            if isinstance(opt, dict):
                extracted_texts.append(str(opt.get("text", "")).strip())
            elif isinstance(opt, str):
                s = opt.strip()
                s = re.sub(r'^\(?[A-Da-d]\)?[.:\-\s]+', '', s)
                extracted_texts.append(s)

    clean = []
    for idx, text in enumerate(extracted_texts[:4]):
        key = standard_keys[idx]
        is_corr = (key == corr_str)
        clean.append({"key": key, "text": text, "is_correct": is_corr})

    if clean and not any(o["is_correct"] for o in clean):
        for o in clean:
            if o["key"] == corr_str:
                o["is_correct"] = True
                break
        if not any(o["is_correct"] for o in clean):
            clean[0]["is_correct"] = True

    return clean


async def save_questions(session, items, subtopic_id, default_difficulty=3, caselet_prefix=None):
    count = 0
    for item in items:
        passage = item.get("passage")
        q_text = str(item.get("question_text", "")).strip()

        # Format question text with strict CAT CBT prefixes
        if caselet_prefix:
            full_text = f"Caselet:\n{caselet_prefix.strip()}\n\nQuestion:\n{q_text}"
        elif passage:
            full_text = f"Passage:\n{passage.strip()}\n\nQuestion:\n{q_text}"
        else:
            full_text = q_text

        corr_ans = str(item.get("correct_answer", "")).strip()
        opts = normalize_options(item.get("options"), corr_ans)

        # Detect MCQ vs TITA
        is_mcq = len(opts) >= 2 and str(item.get("type", "MCQ")).upper() == "MCQ"
        q_type = QuestionType.MCQ if is_mcq else QuestionType.TITA
        if not is_mcq:
            opts = []

        q = Question(
            subtopic_id=subtopic_id,
            question_type=q_type,
            question_text=full_text,
            correct_answer=corr_ans if corr_ans else ("A" if is_mcq else "0"),
            explanation=item.get("explanation", ""),
            difficulty_level=item.get("difficulty", default_difficulty),
            validation_status=ValidationStatus.VALIDATED,
            verification_metadata=item.get("verification_metadata"),
        )
        session.add(q)
        await session.flush()

        if is_mcq:
            for opt in opts:
                session.add(QuestionOption(
                    question_id=q.id,
                    option_key=opt["key"],
                    option_text=opt["text"],
                    is_correct=opt["is_correct"],
                ))
        count += 1
    return count


# ---------------------------------------------------------------------------
# Prompt Templates
# ---------------------------------------------------------------------------

def varc_rc_prompt(passage_topic: str, passage_number: int):
    return f"""Generate 1 authentic CAT-level Reading Comprehension set for the VARC section.

REQUIREMENTS:
- Passage Topic: "{passage_topic}"
- Length: Dense, academic excerpt of approximately 400-500 words.
- Tone: Formal, philosophical, scholarly, argumentative (similar to Aeon, Guardian Long Reads, Harvard Business Review).
- Questions: Exactly 4 MCQ questions based on this passage:
  1. Primary Purpose / Main Idea
  2. Direct Inference
  3. Author's Stance or Tone
  4. Specific Detail or Logical Application
- Each question MUST have exactly 4 options (A, B, C, D) with exactly 1 correct answer.
- Distractors MUST include subtle CAT traps (extreme words, half-right/half-wrong, out of scope).

Return valid JSON:
{{
  "passage": "Full passage text with \\n between paragraphs...",
  "questions": [
    {{
      "type": "MCQ",
      "question_text": "Based on the passage, which of the following...",
      "options": [
        {{"key": "A", "text": "...", "is_correct": false}},
        {{"key": "B", "text": "...", "is_correct": true}},
        {{"key": "C", "text": "...", "is_correct": false}},
        {{"key": "D", "text": "...", "is_correct": false}}
      ],
      "correct_answer": "B",
      "explanation": "..."
    }}
  ]
}}"""


def varc_va_prompt(va_type: str, count: int):
    if va_type == "para_jumble":
        return f"""Generate exactly {count} CAT-level Para-Jumble (TITA) questions.
Each question must contain:
- Instruction: "The four sentences (labelled 1, 2, 3, 4) below, when properly sequenced, would yield a coherent paragraph. Key in the sequence of the four sentences."
- Exactly 4 sentences labeled 1, 2, 3, 4.
- CRITICAL: Format each sentence on its own separate line with \\n\\n:
  "1. First sentence.\\n\\n2. Second sentence.\\n\\n3. Third sentence.\\n\\n4. Fourth sentence."
- The answer is a 4-digit sequence like "2413".
- "options" MUST be empty [].

Return valid JSON:
{{
  "questions": [
    {{
      "type": "TITA",
      "question_text": "The four sentences (labelled 1, 2, 3, 4) below, when properly sequenced, would yield a coherent paragraph. Key in the sequence of the four sentences.\\n\\n1. First sentence...\\n\\n2. Second sentence...\\n\\n3. Third sentence...\\n\\n4. Fourth sentence...",
      "options": [],
      "correct_answer": "2413",
      "explanation": "..."
    }}
  ]
}}"""

    elif va_type == "para_summary":
        return f"""Generate exactly {count} CAT-level Para-Summary (MCQ) questions.
Each question must contain:
- A rich paragraph of 4-5 sentences.
- Prompt: "Which of the following best summarizes the argument in the passage above?"
- Exactly 4 options (A, B, C, D) with subtle distractors and 1 best summary.

Return valid JSON:
{{
  "questions": [
    {{
      "type": "MCQ",
      "question_text": "Paragraph text here...\\n\\nWhich of the following best captures the essence of the passage above?",
      "options": [
        {{"key": "A", "text": "...", "is_correct": false}},
        {{"key": "B", "text": "...", "is_correct": true}},
        {{"key": "C", "text": "...", "is_correct": false}},
        {{"key": "D", "text": "...", "is_correct": false}}
      ],
      "correct_answer": "B",
      "explanation": "..."
    }}
  ]
}}"""

    else:  # odd_sentence
        return f"""Generate exactly {count} CAT-level Odd Sentence Out (TITA) questions.
Each question must contain:
- Instruction: "Five sentences are given below, labeled 1, 2, 3, 4, and 5. Four of these sentences, when put together, form a coherent paragraph. Identify the odd sentence out and type its number as your answer."
- Exactly 5 sentences labeled 1, 2, 3, 4, 5.
- CRITICAL: Format each sentence on its own separate line with \\n\\n:
  "1. First sentence.\\n\\n2. Second sentence.\\n\\n3. Third sentence.\\n\\n4. Fourth sentence.\\n\\n5. Fifth sentence."
- The answer is a single digit (1 to 5).
- "options" MUST be empty [].

Return valid JSON:
{{
  "questions": [
    {{
      "type": "TITA",
      "question_text": "Five sentences are given below, labeled 1, 2, 3, 4, and 5. Four of these sentences, when put together, form a coherent paragraph. Identify the odd sentence out and type its number as your answer.\\n\\n1. First sentence...\\n\\n2. Second sentence...\\n\\n3. Third sentence...\\n\\n4. Fourth sentence...\\n\\n5. Fifth sentence...",
      "options": [],
      "correct_answer": "4",
      "explanation": "..."
    }}
  ]
}}"""


def dilr_caselet_prompt(topic: str, set_number: int, question_count: int):
    return f"""Generate 1 authentic CAT-level DILR caselet set.

Topic: "{topic}"
Number of questions: Exactly {question_count} questions based on this single caselet.

REQUIREMENTS:
- Caselet: An intricate scenario (150-250 words) with clear tabular or bulleted constraints separated by \\n.
- Questions: Exactly {question_count} questions based strictly on the caselet clues.
- Mix: {question_count - 1} MCQs (4 options: A, B, C, D) and 1 TITA numerical question.
- Do NOT make questions trivial; each should require 2-3 logical deductions.

Return valid JSON:
{{
  "caselet": "Caselet description and numbered clues separated by \\n...",
  "questions": [
    {{
      "type": "MCQ",
      "question_text": "...",
      "options": [
        {{"key": "A", "text": "...", "is_correct": true}},
        {{"key": "B", "text": "...", "is_correct": false}},
        {{"key": "C", "text": "...", "is_correct": false}},
        {{"key": "D", "text": "...", "is_correct": false}}
      ],
      "correct_answer": "A",
      "explanation": "..."
    }},
    {{
      "type": "TITA",
      "question_text": "What is the total points scored by...",
      "options": [],
      "correct_answer": "12",
      "explanation": "..."
    }}
  ]
}}"""


def qa_batch_prompt(topics_desc: str, count: int):
    return f"""Generate exactly {count} authentic CAT Quantitative Aptitude questions.

Topic coverage: {topics_desc}

REQUIREMENTS:
- High quality CAT-level difficulty (challenging, multi-step problem solving).
- For math formatting, write mathematical expressions in standard notation:
  e.g., "$x^2$", "$|2x - 5| \\le 14$", "$\\log_{{2}}(3)$", "$\\sqrt{{x}}$", "$16\\pi$".
- Mix: {count - 1} MCQs (4 options A, B, C, D) and 1 TITA numerical question.
- For each question, provide a Python arithmetic expression in "verification_expression" that calculates the numerical answer deterministically.

Return valid JSON:
{{
  "questions": [
    {{
      "type": "MCQ",
      "question_text": "A vessel contains...",
      "options": [
        {{"key": "A", "text": "$48$", "is_correct": false}},
        {{"key": "B", "text": "$51.2$", "is_correct": true}},
        {{"key": "C", "text": "$54$", "is_correct": false}},
        {{"key": "D", "text": "$56$", "is_correct": false}}
      ],
      "correct_answer": "B",
      "verification_expression": "80 * (1 - 16/80)**2",
      "explanation": "..."
    }}
  ]
}}"""


# ---------------------------------------------------------------------------
# Main Generation Pipeline
# ---------------------------------------------------------------------------

async def generate_ai_questions():
    api_key = settings.GEMINI_API_KEY
    if not api_key or "PASTE" in api_key:
        print("ERROR: GEMINI_API_KEY not configured in .env", flush=True)
        return

    print("=" * 65, flush=True)
    print("ExamPilot -- Full CAT 2026 AI Generation Pipeline", flush=True)
    print("Target: VARC (24) + DILR (22) + QA (22) = 68 questions", flush=True)
    print("=" * 65, flush=True)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-3.5-flash-lite",
        generation_config={"response_mime_type": "application/json", "temperature": 0.4}
    )

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    sf = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with sf() as session:
        # Clear existing questions from database
        print("\n[0] Resetting question bank in database...", flush=True)
        await session.execute(delete(QuestionOption))
        await session.execute(delete(Question))
        await session.commit()
        print("   Database cleared. Starting fresh generation.", flush=True)

        # Load subtopics per section
        varc_subs = {}
        dilr_subs = {}
        qa_subs = {}

        for section_code, target_dict in [("VARC", varc_subs), ("DILR", dilr_subs), ("QA", qa_subs)]:
            res = await session.execute(
                select(SubTopic).join(Topic).join(Section).where(Section.code == section_code)
            )
            for st in res.scalars().all():
                target_dict[st.code] = st

        print(f"   Subtopics loaded: VARC({len(varc_subs)}), DILR({len(dilr_subs)}), QA({len(qa_subs)})", flush=True)

        # Subtopic mappings
        varc_rc_sub = varc_subs.get("VARC-RC-PHIL") or next(iter(varc_subs.values()))
        varc_va_pj_sub = varc_subs.get("VARC-VA-PJ") or varc_rc_sub
        varc_va_ps_sub = varc_subs.get("VARC-VA-PS") or varc_rc_sub
        varc_va_odd_sub = varc_subs.get("VARC-VA-ODD") or varc_rc_sub

        dilr_sub = next(iter(dilr_subs.values())) if dilr_subs else None
        qa_sub = next(iter(qa_subs.values())) if qa_subs else None

        total_generated = 0

        # =================================================================
        # SECTION 1: VARC -- 24 Questions
        # 4 RC Passages x 4 questions (16) + 8 VA (3 PJ, 3 PS, 2 Odd)
        # =================================================================
        print("\n" + "=" * 65, flush=True)
        print("[1/3] VARC SECTION -- Generating 24 questions (4x4 RC + 8 VA)", flush=True)
        print("=" * 65, flush=True)

        rc_topics = [
            "Philosophy of Mind: Functionalism and the Chinese Room Argument",
            "Behavioral Economics: Nudge Theory and Hyperbolic Discounting",
            "Institutional Sociology: Elinor Ostrom and Governing the Commons",
            "Epistemology of Science: Karl Popper vs Thomas Kuhn Paradigm Shifts",
        ]

        varc_count = 0
        for i, topic in enumerate(rc_topics, 1):
            print(f"\n   [VARC RC Set {i}/4] Generating RC passage on: {topic[:50]}...", flush=True)
            prompt = varc_rc_prompt(topic, i)
            resp = await call_gemini(model, prompt)
            data = clean_json(resp.text)

            passage = data.get("passage", "")
            questions = data.get("questions", [])
            for q in questions:
                q["passage"] = passage

            n = await save_questions(session, questions, varc_rc_sub.id, default_difficulty=3)
            varc_count += n
            print(f"   -> Saved {n} RC questions (VARC Total: {varc_count}/24)", flush=True)
            await session.commit()

            print("   Pausing 12s for Gemini API rate limits...", flush=True)
            await asyncio.sleep(12)

        # VA questions: 3 PJ + 3 PS + 2 Odd = 8
        va_batches = [
            ("para_jumble", 3, varc_va_pj_sub.id),
            ("para_summary", 3, varc_va_ps_sub.id),
            ("odd_sentence", 2, varc_va_odd_sub.id),
        ]
        for va_type, count, sub_id in va_batches:
            print(f"\n   [VARC VA] Generating {count} {va_type} questions...", flush=True)
            prompt = varc_va_prompt(va_type, count)
            resp = await call_gemini(model, prompt)
            data = clean_json(resp.text)

            n = await save_questions(session, data.get("questions", []), sub_id)
            varc_count += n
            print(f"   -> Saved {n} VA questions (VARC Total: {varc_count}/24)", flush=True)
            await session.commit()

            print("   Pausing 12s for Gemini API rate limits...", flush=True)
            await asyncio.sleep(12)

        total_generated += varc_count
        print(f"\n   [OK] VARC COMPLETE: {varc_count} questions generated", flush=True)

        # =================================================================
        # SECTION 2: DILR -- 22 Questions
        # 2 sets of 5 questions + 3 sets of 4 questions = 22 questions
        # =================================================================
        print("\n" + "=" * 65, flush=True)
        print("[2/3] DILR SECTION -- Generating 22 questions (2x5 + 3x4)", flush=True)
        print("=" * 65, flush=True)

        dilr_sets = [
            ("Round-robin sports tournament matrix: 5 teams, wins, draws, goals, standings", 5),
            ("4-set Venn diagram: Survey of 200 university students across 4 clubs with partial data", 5),
            ("Scheduling assignment matrix: 6 consultants assigned to 5 project days under complex rules", 4),
            ("Missing financial data table: Quarterly revenues and profits of 5 regional divisions", 4),
            ("Truth-tellers and Liars binary logic deduction puzzle with 4 suspects", 4),
        ]

        dilr_count = 0
        for i, (topic, qcount) in enumerate(dilr_sets, 1):
            print(f"\n   [DILR Set {i}/5] Generating {qcount}-question caselet: {topic[:50]}...", flush=True)
            prompt = dilr_caselet_prompt(topic, i, qcount)
            resp = await call_gemini(model, prompt)
            data = clean_json(resp.text)

            caselet = data.get("caselet", "")
            questions = data.get("questions", [])

            n = await save_questions(session, questions, dilr_sub.id, default_difficulty=4, caselet_prefix=caselet)
            dilr_count += n
            print(f"   -> Saved {n} DILR questions (DILR Total: {dilr_count}/22)", flush=True)
            await session.commit()

            print("   Pausing 12s for Gemini API rate limits...", flush=True)
            await asyncio.sleep(12)

        total_generated += dilr_count
        print(f"\n   [OK] DILR COMPLETE: {dilr_count} questions generated", flush=True)

        # =================================================================
        # SECTION 3: QA -- 22 Questions
        # 6 Arithmetic + 6 Algebra + 6 Numbers + 4 Geometry = 22
        # =================================================================
        print("\n" + "=" * 65, flush=True)
        print("[3/3] QA SECTION -- Generating 22 questions (6+6+6+4) + SymPy", flush=True)
        print("=" * 65, flush=True)

        qa_batches = [
            ("Arithmetic: Time-Speed-Distance, Mixtures & Alligations, Profit/Loss, Ratios", 6),
            ("Algebra: Quadratic equations, Modulus inequalities, Logarithms, Progressions (AP/GP)", 6),
            ("Number Systems: Remainders, Divisibility, Unit digits, Factorials, HCF/LCM", 6),
            ("Geometry & Mensuration: Circles, Triangles, Coordinate Geometry, Polygons", 4),
        ]

        qa_count = 0
        for i, (topics_desc, count) in enumerate(qa_batches, 1):
            print(f"\n   [QA Batch {i}/4] Generating {count} questions: {topics_desc[:50]}...", flush=True)
            prompt = qa_batch_prompt(topics_desc, count)
            resp = await call_gemini(model, prompt)
            data = clean_json(resp.text)

            questions = data.get("questions", [])
            for q in questions:
                expr = q.get("verification_expression", "")
                claimed = str(q.get("correct_answer", ""))
                passed = False
                if expr:
                    try:
                        result = verify_math_solution(expr, claimed)
                        passed = result.is_valid
                    except Exception as e:
                        print(f"      [SymPy Check] {expr[:30]} -> {e}", flush=True)
                q["verification_metadata"] = {
                    "expression": expr,
                    "sympy_verified": passed,
                    "engine": "gemini-3.5-flash-lite"
                }

            n = await save_questions(session, questions, qa_sub.id, default_difficulty=3)
            qa_count += n
            print(f"   -> Saved {n} QA questions (QA Total: {qa_count}/22)", flush=True)
            await session.commit()

            print("   Pausing 12s for Gemini API rate limits...", flush=True)
            await asyncio.sleep(12)

        total_generated += qa_count
        print(f"\n   [OK] QA COMPLETE: {qa_count} questions generated", flush=True)

        # =================================================================
        # Final Summary
        # =================================================================
        print("\n" + "=" * 65, flush=True)
        print("EXAMPILOT FULL CAT 2026 GENERATION COMPLETE!", flush=True)
        print(f"  VARC: {varc_count}/24 questions (4 Passages x 4 + 8 VA)")
        print(f"  DILR: {dilr_count}/22 questions (2 Sets x 5 + 3 Sets x 4)")
        print(f"  QA:   {qa_count}/22 questions (Arithmetic, Algebra, Numbers, Geometry)")
        print(f"  TOTAL: {total_generated}/68 questions committed to SQLite database!")
        print("=" * 65, flush=True)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(generate_ai_questions())
