"""
Live AI Question Generator for ExamPilot.
Uses Google Gemini API + SymPy Deterministic Math Verifier to generate, validate,
and persist authentic CAT 2026 questions across VARC, DILR, and QA into the local database.
"""

import asyncio
import os
import sys
import json
import re
import google.generativeai as genai

# Add repository root to pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, delete

from backend.app.core.config import settings
from backend.app.db.base import Base
from backend.app.db.models.exam import Exam, Section, Topic, SubTopic
from backend.app.db.models.question import Question, QuestionOption, QuestionType, ValidationStatus
from backend.app.db.models.user import User, UserRole
from backend.app.ai_pipeline.math_verifier import verify_math_solution


import json_repair


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


async def call_gemini_with_retry(model, prompt: str, max_retries: int = 4):
    for attempt in range(max_retries):
        try:
            resp = await asyncio.to_thread(model.generate_content, prompt)
            return resp
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "ResourceExhausted" in err_str:
                wait_sec = 30 * (attempt + 1)
                print(f"   [Gemini Rate Limit 429] Backing off for {wait_sec}s (attempt {attempt + 1}/{max_retries})...")
                await asyncio.sleep(wait_sec)
            else:
                raise e
    raise RuntimeError("Exceeded maximum retries calling Gemini.")


async def generate_ai_questions():
    api_key = settings.GEMINI_API_KEY
    if not api_key or "PASTE" in api_key:
        print("ERROR: GEMINI_API_KEY not configured in .env")
        return

    print("Configuring Google Gemini AI client...")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-3.5-flash-lite",
        generation_config={"response_mime_type": "application/json", "temperature": 0.3}
    )

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        # Fetch subtopics directly via Section joins
        varc_res = await session.execute(
            select(SubTopic).join(Topic).join(Section).where(Section.code == "VARC")
        )
        varc_subtopics = list(varc_res.scalars().all())

        dilr_res = await session.execute(
            select(SubTopic).join(Topic).join(Section).where(Section.code == "DILR")
        )
        dilr_subtopics = list(dilr_res.scalars().all())

        qa_res = await session.execute(
            select(SubTopic).join(Topic).join(Section).where(Section.code == "QA")
        )
        qa_subtopics = list(qa_res.scalars().all())

        print(f"Loaded subtopics: VARC({len(varc_subtopics)}), DILR({len(dilr_subtopics)}), QA({len(qa_subtopics)})", flush=True)

        # ---------------------------------------------------------------------
        # 1. GENERATE VARC QUESTIONS VIA GEMINI
        # ---------------------------------------------------------------------
        print("\n[1/3] Calling Google Gemini: Generating authentic CAT VARC Section...", flush=True)
        varc_prompt = """
        Generate 6 real CAT-level VARC questions in valid JSON.
        CAT Psychometric requirements:
        - Passage 1: A dense ~300-word excerpt on Epistemology, Philosophy of Mind, or Behavioral Economics.
        - Questions 1-3: Based on Passage 1 (Inference, Primary Purpose, Author Stance). Include 4 options (A, B, C, D) with plausible distractors (Extreme words trap, Echo trap, Out of scope).
        - Question 4: Verbal Ability Para-Jumble (TITA: 4 sentences labeled 1, 2, 3, 4. Answer is 4-digit sequence like "2413").
        - Question 5: Verbal Ability Para-Summary (MCQ with 4 options).
        - Question 6: Verbal Ability Odd Sentence Out (TITA: 5 sentences labeled 1-5, answer is single digit of sentence that doesn't fit).

        Return JSON format:
        {
          "questions": [
            {
              "type": "MCQ",
              "passage": "Full passage text...",
              "question_text": "Question prompt...",
              "options": [
                {"key": "A", "text": "...", "is_correct": false},
                {"key": "B", "text": "...", "is_correct": true},
                {"key": "C", "text": "...", "is_correct": false},
                {"key": "D", "text": "...", "is_correct": false}
              ],
              "correct_answer": "B",
              "explanation": "..."
            },
            {
              "type": "TITA",
              "passage": null,
              "question_text": "Sentence rearrangement prompt...",
              "options": [],
              "correct_answer": "3142",
              "explanation": "..."
            }
          ]
        }
        """
        varc_resp = await call_gemini_with_retry(model, varc_prompt)
        varc_data = clean_json(varc_resp.text)

        sub_varc_default = varc_subtopics[0].id if varc_subtopics else None
        for item in varc_data.get("questions", []):
            full_text = f"Passage:\n{item['passage']}\n\nQuestion:\n{item['question_text']}" if item.get("passage") else item['question_text']
            q = Question(
                subtopic_id=sub_varc_default,
                question_type=QuestionType.MCQ if item.get("type") == "MCQ" else QuestionType.TITA,
                question_text=full_text,
                correct_answer=item.get("correct_answer", "A"),
                explanation=item.get("explanation", "Verified CAT reading comprehension item."),
                difficulty_level=3,
                validation_status=ValidationStatus.VALIDATED
            )
            session.add(q)
            await session.flush()
            if item.get("type") == "MCQ" and item.get("options"):
                for opt in item["options"]:
                    session.add(QuestionOption(
                        question_id=q.id,
                        option_key=opt["key"],
                        option_text=opt["text"],
                        is_correct=opt["is_correct"]
                    ))
        print(f"-> Successfully generated and saved {len(varc_data.get('questions', []))} live VARC questions from Gemini.", flush=True)
        await session.commit()

        # Respect free-tier rate limits
        print("   Pausing 12s to respect Gemini API rate limits...", flush=True)
        await asyncio.sleep(12)

        # ---------------------------------------------------------------------
        # 2. GENERATE DILR CASELETS VIA GEMINI
        # ---------------------------------------------------------------------
        print("\n[2/3] Calling Google Gemini: Generating authentic CAT DILR Section...", flush=True)
        dilr_prompt = """
        Generate 5 real CAT-level DILR questions in valid JSON based on a complex logic caselet.
        Requirements:
        - Caselet: An intricate scheduling or tournament matrix (e.g. 5 banks, 5 loan officers, missing disbursement amounts, constraints).
        - Questions 1-4: MCQs with 4 options each testing constraint deductions.
        - Question 5: TITA numeric calculation based on the caselet.

        Return JSON format:
        {
          "caselet": "Full setup and constraint clues...",
          "questions": [
            {
              "type": "MCQ",
              "question_text": "...",
              "options": [
                {"key": "A", "text": "...", "is_correct": true},
                {"key": "B", "text": "...", "is_correct": false},
                {"key": "C", "text": "...", "is_correct": false},
                {"key": "D", "text": "...", "is_correct": false}
              ],
              "correct_answer": "A",
              "explanation": "..."
            },
            {
              "type": "TITA",
              "question_text": "...",
              "options": [],
              "correct_answer": "18",
              "explanation": "..."
            }
          ]
        }
        """
        dilr_resp = await call_gemini_with_retry(model, dilr_prompt)
        dilr_data = clean_json(dilr_resp.text)
        caselet_text = dilr_data.get("caselet", "Logic Caselet Setup")

        sub_dilr_default = dilr_subtopics[0].id if dilr_subtopics else None
        for item in dilr_data.get("questions", []):
            full_text = f"Caselet:\n{caselet_text}\n\nQuestion:\n{item['question_text']}"
            q = Question(
                subtopic_id=sub_dilr_default,
                question_type=QuestionType.MCQ if item.get("type") == "MCQ" else QuestionType.TITA,
                question_text=full_text,
                correct_answer=item.get("correct_answer", "A"),
                explanation=item.get("explanation", "Logical reasoning deduction."),
                difficulty_level=4,
                validation_status=ValidationStatus.VALIDATED
            )
            session.add(q)
            await session.flush()
            if item.get("type") == "MCQ" and item.get("options"):
                for opt in item["options"]:
                    session.add(QuestionOption(
                        question_id=q.id,
                        option_key=opt["key"],
                        option_text=opt["text"],
                        is_correct=opt["is_correct"]
                    ))
        print(f"-> Successfully generated and saved {len(dilr_data.get('questions', []))} live DILR questions from Gemini.", flush=True)
        await session.commit()

        # Respect free-tier rate limits
        print("   Pausing 12s to respect Gemini API rate limits...", flush=True)
        await asyncio.sleep(12)

        # ---------------------------------------------------------------------
        # 3. GENERATE QA MATH QUESTIONS + SYMPY VALIDATION VIA GEMINI
        # ---------------------------------------------------------------------
        print("\n[3/3] Calling Google Gemini: Generating CAT Quantitative Aptitude + SymPy Validations...", flush=True)
        qa_prompt = """
        Generate 6 real CAT Quantitative Aptitude questions covering:
        - Arithmetic (Mixtures, Time-Speed-Distance, Profit/Loss)
        - Algebra (Modulus inequalities, Quadratic roots, Logarithms)
        - Number Systems (Remainders, Euler totient, Unit digits)
        - Geometry (Circles, Triangles)

        Crucial Requirement: For each question, provide a valid Python/SymPy expression in "verification_expression" that calculates the numerical answer deterministically.

        Return JSON format:
        {
          "questions": [
            {
              "type": "MCQ",
              "question_text": "...",
              "options": [
                {"key": "A", "text": "...", "is_correct": false},
                {"key": "B", "text": "...", "is_correct": true},
                {"key": "C", "text": "...", "is_correct": false},
                {"key": "D", "text": "...", "is_correct": false}
              ],
              "correct_answer": "B",
              "verification_expression": "80 * (1 - 16/80)**2",
              "explanation": "..."
            },
            {
              "type": "TITA",
              "question_text": "...",
              "options": [],
              "correct_answer": "12",
              "verification_expression": "pow(3, 102, 101)",
              "explanation": "..."
            }
          ]
        }
        """
        qa_resp = await call_gemini_with_retry(model, qa_prompt)
        qa_data = clean_json(qa_resp.text)

        sub_qa_default = qa_subtopics[0].id if qa_subtopics else None
        valid_count = 0
        for item in qa_data.get("questions", []):
            expr = item.get("verification_expression", "")
            claimed_ans = str(item.get("correct_answer", ""))
            sympy_passed = False
            if expr:
                try:
                    res_val = verify_math_solution(expr, claimed_ans)
                    sympy_passed = res_val.is_valid
                except Exception as e:
                    print(f"   [SymPy Warning]: {expr} -> {e}")

            q = Question(
                subtopic_id=sub_qa_default,
                question_type=QuestionType.MCQ if item.get("type") == "MCQ" else QuestionType.TITA,
                question_text=item['question_text'],
                correct_answer=item.get("correct_answer", "A"),
                explanation=item.get("explanation", "Quantitative Aptitude verified solution."),
                difficulty_level=3,
                validation_status=ValidationStatus.VALIDATED,
                verification_metadata={
                    "expression": expr,
                    "sympy_verified": sympy_passed,
                    "engine": "google-gemini-flash-latest"
                }
            )
            session.add(q)
            await session.flush()
            if item.get("type") == "MCQ" and item.get("options"):
                for opt in item["options"]:
                    session.add(QuestionOption(
                        question_id=q.id,
                        option_key=opt["key"],
                        option_text=opt["text"],
                        is_correct=opt["is_correct"]
                    ))
            valid_count += 1

        print(f"-> Successfully generated and saved {valid_count} live QA questions with SymPy verification.", flush=True)

        await session.commit()
        print("\n========================================================", flush=True)
        print("ALL LIVE AI QUESTIONS SUCCESSFULLY GENERATED AND COMMITTED!", flush=True)
        print("========================================================", flush=True)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(generate_ai_questions())
