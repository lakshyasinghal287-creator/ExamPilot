"""
Unit Tests for AI Generation and Multi-Stage Validation Pipeline.
Tests schema validation, math hallucination rejection, and provider abstraction.
"""

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from backend.app.db.base import Base
from backend.app.db.models.exam import Exam, Section, Topic, SubTopic
from backend.app.db.models.question import Question, ValidationStatus
from backend.app.ai_pipeline.provider import MockLLMProvider
from backend.app.ai_pipeline.pipeline import (
    process_and_validate_question_payload,
    generate_and_validate_question,
)


@pytest_asyncio.fixture
async def async_db():
    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as session:
        yield session

    await test_engine.dispose()


@pytest.mark.asyncio
async def test_valid_qa_question_passes_pipeline():
    # Remainder question: 2^10 mod 7 = 2
    payload = {
        "section_code": "QA",
        "topic_code": "QA-NUM",
        "subtopic_code": "QA-NUM-REMAINDERS",
        "question_type": "MCQ",
        "question_text": "What is the remainder when 2^10 is divided by 7?",
        "options": [
            {"option_key": "A", "option_text": "1", "is_correct": False},
            {"option_key": "B", "option_text": "2", "is_correct": True},
            {"option_key": "C", "option_text": "3", "is_correct": False},
            {"option_key": "D", "option_text": "4", "is_correct": False}
        ],
        "correct_answer": "B",
        "explanation": "2^3 = 8 = 1 mod 7. 2^10 = (2^3)^3 * 2 = 1 * 2 = 2.",
        "difficulty_level": 3,
        "verification_expression": "pow(2, 10, 7)"
    }

    result = await process_and_validate_question_payload(payload)
    assert result.is_success is True
    assert result.validated_schema.correct_answer == "B"
    assert result.math_verification.is_valid is True
    assert result.math_verification.computed_value == "2"


@pytest.mark.asyncio
async def test_schema_rejection_duplicate_options():
    payload = {
        "section_code": "QA",
        "topic_code": "QA-ARITH",
        "subtopic_code": "QA-ARITH-TSD",
        "question_type": "MCQ",
        "question_text": "A train travels at 60 km/h...",
        "options": [
            {"option_key": "A", "option_text": "60", "is_correct": True},
            {"option_key": "B", "option_text": "60", "is_correct": False},  # Duplicate!
            {"option_key": "C", "option_text": "70", "is_correct": False},
            {"option_key": "D", "option_text": "80", "is_correct": False}
        ],
        "correct_answer": "A",
        "explanation": "Calculation explanation...",
        "difficulty_level": 2,
        "verification_expression": "60"
    }

    result = await process_and_validate_question_payload(payload)
    assert result.is_success is False
    assert "distinct" in result.rejection_reason.lower()


@pytest.mark.asyncio
async def test_math_hallucination_rejection():
    # LLM proposes quadratic equation x^2 - 16 = 0, but claims correct answer option has text "5"
    payload = {
        "section_code": "QA",
        "topic_code": "QA-ALGEBRA",
        "subtopic_code": "QA-ALGEBRA-QUADRATICS",
        "question_type": "MCQ",
        "question_text": "Find the positive root of x^2 - 16 = 0",
        "options": [
            {"option_key": "A", "option_text": "3", "is_correct": False},
            {"option_key": "B", "option_text": "5", "is_correct": True},  # HALLUCINATED ANSWER!
            {"option_key": "C", "option_text": "6", "is_correct": False},
            {"option_key": "D", "option_text": "7", "is_correct": False}
        ],
        "correct_answer": "B",
        "explanation": "Roots are calculated as 5...",
        "difficulty_level": 2,
        "verification_expression": "solve(x**2 - 16, x)[1]"  # SymPy computes 4
    }

    result = await process_and_validate_question_payload(payload)
    assert result.is_success is False
    assert "Math Verification Failure" in result.rejection_reason


@pytest.mark.asyncio
async def test_generate_and_save_to_db(async_db: AsyncSession):
    # Setup syllabus parent
    exam = Exam(code="CAT-AI", name="CAT AI Exam", total_duration_minutes=120, total_questions=66)
    async_db.add(exam)
    await async_db.flush()

    sec = Section(exam_id=exam.id, code="QA", name="QA", sequence_order=1, duration_minutes=40, target_question_count=22)
    async_db.add(sec)
    await async_db.flush()

    top = Topic(section_id=sec.id, code="QA-NUM", name="Number System")
    async_db.add(top)
    await async_db.flush()

    sub = SubTopic(topic_id=top.id, code="QA-NUM-REM", name="Remainders")
    async_db.add(sub)
    await async_db.commit()

    # Configure mock provider with valid 3^4 = 81 mod 7 = 4 question
    valid_mock_payload = {
        "section_code": "QA",
        "topic_code": "QA-NUM",
        "subtopic_code": "QA-NUM-REM",
        "question_type": "MCQ",
        "question_text": "What is the remainder when 3^4 is divided by 7?",
        "options": [
            {"option_key": "A", "option_text": "1", "is_correct": False},
            {"option_key": "B", "option_text": "2", "is_correct": False},
            {"option_key": "C", "option_text": "4", "is_correct": True},
            {"option_key": "D", "option_text": "6", "is_correct": False}
        ],
        "correct_answer": "C",
        "explanation": "3^4 = 81. 81 / 7 = 11 with remainder 4.",
        "difficulty_level": 2,
        "verification_expression": "pow(3, 4, 7)"
    }

    provider = MockLLMProvider(custom_payload=valid_mock_payload)

    result = await generate_and_validate_question(
        prompt="Generate QA remainder question",
        system_instruction="You are a CAT expert",
        provider=provider,
        db_session=async_db,
        subtopic_id=sub.id
    )

    assert result.is_success is True
    assert result.question_id is not None

    # Query DB to ensure question is banked with VALIDATED status
    stmt = select(Question).where(Question.id == result.question_id)
    db_res = await async_db.execute(stmt)
    saved_q = db_res.scalar_one()

    assert saved_q.validation_status == ValidationStatus.VALIDATED
    assert saved_q.correct_answer == "C"
    assert len(saved_q.options) == 4
