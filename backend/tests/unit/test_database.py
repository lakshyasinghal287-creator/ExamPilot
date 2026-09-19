"""
Unit Tests for Database Models and Async Relational Persistence.
Tests table creation, entity relationships, foreign keys, cascades, and queries
using an in-memory asynchronous SQLite engine.
"""

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from backend.app.db.base import Base
from backend.app.db.models.exam import Exam, Section, Topic, SubTopic
from backend.app.db.models.question import Question, QuestionOption, QuestionType, ValidationStatus
from backend.app.db.models.user import User, UserRole
from backend.app.db.models.attempt import TestAttempt, QuestionAttempt, PaletteState, TestMode, AttemptStatus


@pytest_asyncio.fixture
async def async_db_session():
    """Creates an isolated in-memory SQLite database session for testing."""
    test_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        future=True
    )

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session_factory = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

    async with async_session_factory() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await test_engine.dispose()


@pytest.mark.asyncio
async def test_create_exam_with_sections_and_topics(async_db_session: AsyncSession):
    # 1. Create Exam
    cat_exam = Exam(
        code="CAT-2026",
        name="Common Admission Test 2026",
        total_duration_minutes=120,
        total_questions=66
    )
    async_db_session.add(cat_exam)
    await async_db_session.flush()

    # 2. Add Sections
    varc = Section(exam_id=cat_exam.id, code="VARC", name="Verbal Ability", sequence_order=1, duration_minutes=40, target_question_count=24)
    dilr = Section(exam_id=cat_exam.id, code="DILR", name="Data Interpretation", sequence_order=2, duration_minutes=40, target_question_count=20)
    qa = Section(exam_id=cat_exam.id, code="QA", name="Quantitative Ability", sequence_order=3, duration_minutes=40, target_question_count=22)
    async_db_session.add_all([varc, dilr, qa])
    await async_db_session.flush()

    # 3. Add Topic & SubTopic under QA
    qa_arith = Topic(section_id=qa.id, code="QA-ARITH", name="Arithmetic")
    async_db_session.add(qa_arith)
    await async_db_session.flush()

    tsd = SubTopic(topic_id=qa_arith.id, code="QA-ARITH-TSD", name="Time, Speed and Distance", weightage_percent=12.5)
    async_db_session.add(tsd)
    await async_db_session.commit()

    # 4. Query and verify relationships
    stmt = select(Exam).where(Exam.code == "CAT-2026")
    result = await async_db_session.execute(stmt)
    saved_exam = result.scalar_one()

    assert saved_exam.name == "Common Admission Test 2026"
    assert len(saved_exam.sections) == 3
    assert saved_exam.sections[0].code == "VARC"
    assert saved_exam.sections[2].code == "QA"


@pytest.mark.asyncio
async def test_create_question_with_options(async_db_session: AsyncSession):
    # Setup parent hierarchy
    exam = Exam(code="CAT-Q", name="Test Exam", total_duration_minutes=120, total_questions=66)
    async_db_session.add(exam)
    await async_db_session.flush()

    sec = Section(exam_id=exam.id, code="QA", name="QA", sequence_order=1, duration_minutes=40, target_question_count=22)
    async_db_session.add(sec)
    await async_db_session.flush()

    top = Topic(section_id=sec.id, code="QA-NUM", name="Number System")
    async_db_session.add(top)
    await async_db_session.flush()

    sub = SubTopic(topic_id=top.id, code="QA-NUM-REM", name="Remainders")
    async_db_session.add(sub)
    await async_db_session.flush()

    # Create MCQ Question with 4 options
    q = Question(
        subtopic_id=sub.id,
        question_type=QuestionType.MCQ,
        question_text="What is the remainder when 2^10 is divided by 7?",
        correct_answer="B",
        explanation="2^3 = 8 = 1 mod 7. 2^10 = (2^3)^3 * 2 = 1 * 2 = 2.",
        difficulty_level=3,
        validation_status=ValidationStatus.VALIDATED,
        verification_metadata={"sympy_expr": "pow(2, 10, 7)", "verified": True}
    )
    async_db_session.add(q)
    await async_db_session.flush()

    opt_a = QuestionOption(question_id=q.id, option_key="A", option_text="1", is_correct=False)
    opt_b = QuestionOption(question_id=q.id, option_key="B", option_text="2", is_correct=True)
    opt_c = QuestionOption(question_id=q.id, option_key="C", option_text="3", is_correct=False)
    opt_d = QuestionOption(question_id=q.id, option_key="D", option_text="4", is_correct=False)
    async_db_session.add_all([opt_a, opt_b, opt_c, opt_d])
    await async_db_session.commit()

    # Query Question
    stmt = select(Question).where(Question.id == q.id)
    result = await async_db_session.execute(stmt)
    fetched_q = result.scalar_one()

    assert fetched_q.validation_status == ValidationStatus.VALIDATED
    assert len(fetched_q.options) == 4
    correct_opts = [o for o in fetched_q.options if o.is_correct]
    assert len(correct_opts) == 1
    assert correct_opts[0].option_key == "B"


@pytest.mark.asyncio
async def test_create_test_attempt_and_telemetry(async_db_session: AsyncSession):
    # Setup user and exam
    user = User(email="aspirant@test.com", full_name="Aarav Sharma", hashed_password="hashed_pwd_123", role=UserRole.STUDENT)
    exam = Exam(code="CAT-ATTEMPT", name="CAT Attempt Exam", total_duration_minutes=120, total_questions=66)
    async_db_session.add_all([user, exam])
    await async_db_session.flush()

    sec = Section(exam_id=exam.id, code="QA", name="QA", sequence_order=1, duration_minutes=40, target_question_count=22)
    async_db_session.add(sec)
    await async_db_session.flush()

    top = Topic(section_id=sec.id, code="QA-ARITH", name="Arithmetic")
    async_db_session.add(top)
    await async_db_session.flush()

    sub = SubTopic(topic_id=top.id, code="QA-ARITH-PCT", name="Percentages")
    async_db_session.add(sub)
    await async_db_session.flush()

    q = Question(subtopic_id=sub.id, question_type=QuestionType.MCQ, question_text="Sample Q", correct_answer="A", explanation="Sol", difficulty_level=2, validation_status=ValidationStatus.VALIDATED)
    async_db_session.add(q)
    await async_db_session.flush()

    opt = QuestionOption(question_id=q.id, option_key="A", option_text="Correct Opt", is_correct=True)
    async_db_session.add(opt)
    await async_db_session.flush()

    # Create Attempt
    attempt = TestAttempt(user_id=user.id, exam_id=exam.id, mode=TestMode.MOCK_EXAM, status=AttemptStatus.IN_PROGRESS)
    async_db_session.add(attempt)
    await async_db_session.flush()

    # Record Question Interaction
    q_attempt = QuestionAttempt(
        test_attempt_id=attempt.id,
        question_id=q.id,
        selected_option_id=opt.id,
        palette_state=PaletteState.ANSWERED,
        time_spent_seconds=42,
        is_correct=True,
        marks_awarded=3.0
    )
    async_db_session.add(q_attempt)
    await async_db_session.commit()

    # Query Attempt
    stmt = select(TestAttempt).where(TestAttempt.id == attempt.id)
    res = await async_db_session.execute(stmt)
    saved_attempt = res.scalar_one()

    assert saved_attempt.user.full_name == "Aarav Sharma"
    assert len(saved_attempt.question_attempts) == 1
    assert saved_attempt.question_attempts[0].marks_awarded == 3.0
    assert saved_attempt.question_attempts[0].palette_state == PaletteState.ANSWERED
