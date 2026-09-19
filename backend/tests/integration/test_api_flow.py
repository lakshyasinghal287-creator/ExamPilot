"""
Integration Tests for ExamPilot REST API.
Simulates end-to-end user workflows:
1. Health check verification
2. Question payload validation endpoint
3. Complete mock test flow: start -> save responses -> finish -> score verification.
"""

import pytest
import pytest_asyncio
import httpx
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from backend.app.main import app
from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.db.models.exam import Exam, Section, Topic, SubTopic
from backend.app.db.models.question import Question, QuestionOption, QuestionType, ValidationStatus
from backend.app.db.models.user import User, UserRole


@pytest_asyncio.fixture
async def integration_db_and_client():
    """Sets up an isolated in-memory database and wires it to the FastAPI test client."""
    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with session_factory() as session:
            yield session

    # Override get_db dependency in FastAPI
    app.dependency_overrides[get_db] = override_get_db

    # Seed an exam, user, and a validated question
    async with session_factory() as seed_session:
        user = User(email="student@exampilot.com", full_name="Vaibhav Rawat", hashed_password="pwd", role=UserRole.STUDENT)
        exam = Exam(code="CAT-2026", name="CAT 2026", total_duration_minutes=120, total_questions=66)
        seed_session.add_all([user, exam])
        await seed_session.flush()

        sec = Section(exam_id=exam.id, code="VARC", name="VARC", sequence_order=1, duration_minutes=40, target_question_count=24)
        seed_session.add(sec)
        await seed_session.flush()

        top = Topic(section_id=sec.id, code="VARC-RC", name="Reading Comprehension")
        seed_session.add(top)
        await seed_session.flush()

        sub = SubTopic(topic_id=top.id, code="VARC-RC-INFERENCE", name="Inference Questions")
        seed_session.add(sub)
        await seed_session.flush()

        q = Question(
            subtopic_id=sub.id,
            question_type=QuestionType.MCQ,
            question_text="According to the passage, the author's tone is best described as:",
            correct_answer="C",
            explanation="The author employs measured skepticism without being overtly hostile.",
            difficulty_level=3,
            validation_status=ValidationStatus.VALIDATED
        )
        seed_session.add(q)
        await seed_session.flush()

        opt_a = QuestionOption(question_id=q.id, option_key="A", option_text="Cynical", is_correct=False)
        opt_b = QuestionOption(question_id=q.id, option_key="B", option_text="Enthusiastic", is_correct=False)
        opt_c = QuestionOption(question_id=q.id, option_key="C", option_text="Cautiously critical", is_correct=True)
        opt_d = QuestionOption(question_id=q.id, option_key="D", option_text="Indifferent", is_correct=False)
        seed_session.add_all([opt_a, opt_b, opt_c, opt_d])
        await seed_session.commit()

        user_id = user.id
        question_id = q.id
        correct_option_id = opt_c.id

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield {
            "client": client,
            "user_id": user_id,
            "question_id": question_id,
            "correct_option_id": correct_option_id
        }

    app.dependency_overrides.clear()
    await test_engine.dispose()


@pytest.mark.asyncio
async def test_health_check_endpoint(integration_db_and_client):
    client = integration_db_and_client["client"]
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "ExamPilot"


@pytest.mark.asyncio
async def test_validate_question_payload_api(integration_db_and_client):
    client = integration_db_and_client["client"]

    # 1. Valid QA payload
    valid_payload = {
        "section_code": "QA",
        "topic_code": "QA-NUM",
        "subtopic_code": "QA-NUM-REM",
        "question_type": "MCQ",
        "question_text": "What is the remainder of 5^20 divided by 4?",
        "options": [
            {"option_key": "A", "option_text": "1", "is_correct": True},
            {"option_key": "B", "option_text": "2", "is_correct": False},
            {"option_key": "C", "option_text": "3", "is_correct": False},
            {"option_key": "D", "option_text": "0", "is_correct": False}
        ],
        "correct_answer": "A",
        "explanation": "5 = 1 mod 4. Thus 5^20 = 1^20 = 1 mod 4.",
        "difficulty_level": 2,
        "verification_expression": "pow(5, 20, 4)"
    }
    res_valid = await client.post("/api/v1/questions/validate-payload", json=valid_payload)
    assert res_valid.status_code == 200
    assert res_valid.json()["status"] == "VALIDATED"
    assert res_valid.json()["math_verified"] is True

    # 2. Invalid payload (missing options for MCQ)
    invalid_payload = {
        "section_code": "QA",
        "topic_code": "QA-NUM",
        "subtopic_code": "QA-NUM-REM",
        "question_type": "MCQ",
        "question_text": "Missing options question...",
        "correct_answer": "A",
        "explanation": "Invalid explanation.",
        "difficulty_level": 2
    }
    res_invalid = await client.post("/api/v1/questions/validate-payload", json=invalid_payload)
    assert res_invalid.status_code == 422


@pytest.mark.asyncio
async def test_full_test_taking_and_scoring_flow(integration_db_and_client):
    client = integration_db_and_client["client"]
    user_id = integration_db_and_client["user_id"]
    question_id = integration_db_and_client["question_id"]
    correct_option_id = integration_db_and_client["correct_option_id"]

    # Step 1: Start Test Attempt
    start_payload = {
        "user_id": user_id,
        "exam_code": "CAT-2026",
        "mode": "MOCK_EXAM"
    }
    start_res = await client.post("/api/v1/tests/start", json=start_payload)
    assert start_res.status_code == 201
    start_data = start_res.json()
    attempt_id = start_data["test_attempt_id"]
    assert start_data["active_section"]["code"] == "VARC"
    assert len(start_data["active_section"]["questions"]) == 1

    # Invariant: Question text is present, but correct_answer is OMITTED!
    first_q = start_data["active_section"]["questions"][0]
    assert "correct_answer" not in first_q

    # Step 2: Save Response (Select Correct Option)
    save_payload = {
        "question_id": question_id,
        "selected_option_id": correct_option_id,
        "tita_answer_text": None,
        "palette_state": "ANSWERED",
        "time_spent_delta_seconds": 75
    }
    save_res = await client.post(f"/api/v1/tests/{attempt_id}/save-response", json=save_payload)
    assert save_res.status_code == 200
    assert save_res.json()["status"] == "SAVED"
    assert save_res.json()["total_time_spent_seconds"] == 75

    # Step 3: Finish Exam & Compute Deterministic Score
    finish_res = await client.post(f"/api/v1/tests/{attempt_id}/finish")
    assert finish_res.status_code == 200
    finish_data = finish_res.json()

    assert finish_data["status"] == "SUBMITTED"
    assert finish_data["total_score"] == 3.0  # +3 for correct MCQ!
    assert finish_data["sectional_scores"]["VARC"] == 3.0
    assert finish_data["overall_accuracy_percentage"] == 100.0
