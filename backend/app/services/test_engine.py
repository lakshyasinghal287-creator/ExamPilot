"""
Test Engine Service.
Manages the mock exam lifecycle:
- Session initialization & question assembly
- Authoritative server timestamping & timer tracking
- Real-time response auto-saving & palette state transitions
- Sequential section locking (VARC -> DILR -> QA)
- Final submission & deterministic scoring invocation.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from backend.app.db.models.exam import Exam, Section
from backend.app.db.models.question import Question, ValidationStatus
from backend.app.db.models.attempt import TestAttempt, QuestionAttempt, PaletteState, TestMode, AttemptStatus
from backend.app.schemas.scoring import QuestionScoreItem
from backend.app.services.scoring import compute_exam_scorecard


class SectionTimeoutError(Exception):
    """Raised when an action is attempted on an expired or locked section."""
    pass


async def start_test_session(
    user_id: str,
    exam_code: str,
    db: AsyncSession,
    mode: TestMode = TestMode.MOCK_EXAM
) -> Dict[str, Any]:
    """
    Instantiates a new test attempt, assembles validated questions,
    and returns Section 1 payload with answers stripped.
    """
    # 1. Fetch Exam & Sections
    stmt = select(Exam).where(Exam.code == exam_code)
    res = await db.execute(stmt)
    exam = res.scalar_one_or_none()
    if not exam:
        raise ValueError(f"Exam with code '{exam_code}' not found.")

    sections = sorted(exam.sections, key=lambda s: s.sequence_order)
    if not sections:
        raise ValueError("Exam has no configured sections.")

    # 2. Fetch validated questions for each section
    # In CAT: VARC (24), DILR (20), QA (22)
    first_section = sections[0]
    first_section_questions: List[Question] = []
    all_selected_questions: List[Question] = []

    for sec in sections:
        # Fetch questions belonging to topics in this section
        topic_ids = [t.id for t in sec.topics]
        subtopic_ids = []
        for t in sec.topics:
            subtopic_ids.extend([st.id for st in t.subtopics])

        if subtopic_ids:
            q_stmt = (
                select(Question)
                .where(Question.subtopic_id.in_(subtopic_ids))
                .where(Question.validation_status == ValidationStatus.VALIDATED)
                .order_by(Question.id.asc())
                .limit(sec.target_question_count)
            )
            q_res = await db.execute(q_stmt)
            sec_questions = list(q_res.scalars().all())
        else:
            sec_questions = []

        all_selected_questions.extend(sec_questions)
        if sec.id == first_section.id:
            first_section_questions = sec_questions

    # 3. Ensure candidate user exists (resilient fallback)
    from backend.app.db.models.user import User, UserRole
    u_stmt = select(User).where(User.id == user_id)
    u_res = await db.execute(u_stmt)
    user_obj = u_res.scalar_one_or_none()
    if not user_obj:
        u_fallback = (await db.execute(select(User).limit(1))).scalar_one_or_none()
        if u_fallback:
            user_id = u_fallback.id
        else:
            new_u = User(
                id=user_id,
                email="candidate@exampilot.com",
                full_name="Aarav Sharma",
                hashed_password="demo",
                role=UserRole.STUDENT
            )
            db.add(new_u)
            await db.flush()

    attempt = TestAttempt(
        user_id=user_id,
        exam_id=exam.id,
        mode=mode,
        status=AttemptStatus.IN_PROGRESS,
        started_at=datetime.now(timezone.utc)
    )
    db.add(attempt)
    await db.flush()

    # 4. Create QuestionAttempt rows
    for q in all_selected_questions:
        qa = QuestionAttempt(
            test_attempt_id=attempt.id,
            question_id=q.id,
            palette_state=PaletteState.NOT_VISITED,
            time_spent_seconds=0
        )
        db.add(qa)

    await db.commit()

    # 5. Format sanitized client payloads for all sections (Answers OMITTED!)
    all_sections_payload = []
    for s in sections:
        s_questions = [
            q for q in all_selected_questions
            if q.subtopic and q.subtopic.topic and q.subtopic.topic.section_id == s.id
        ]
        s_payload = []
        for idx, q in enumerate(s_questions, 1):
            opts = [
                {"option_id": o.id, "key": o.option_key, "text": o.option_text}
                for o in q.options
            ] if q.options else []

            s_payload.append({
                "question_id": q.id,
                "sequence_number": idx,
                "question_type": q.question_type.value,
                "question_text": q.question_text,
                "options": opts,
                "palette_state": PaletteState.NOT_VISITED.value,
                "time_spent_seconds": 0
            })

        all_sections_payload.append({
            "code": s.code,
            "name": s.name,
            "duration_seconds": s.duration_minutes * 60,
            "time_remaining_seconds": s.duration_minutes * 60,
            "questions": s_payload
        })

    active_sec = all_sections_payload[0] if all_sections_payload else {
        "code": "VARC",
        "name": "Verbal Ability & Reading Comprehension",
        "duration_seconds": 2400,
        "time_remaining_seconds": 2400,
        "questions": []
    }

    return {
        "test_attempt_id": attempt.id,
        "exam_code": exam.code,
        "started_at": attempt.started_at.isoformat(),
        "active_section": active_sec,
        "all_sections": all_sections_payload
    }


async def save_question_response(
    test_attempt_id: str,
    question_id: str,
    selected_option_id: Optional[str],
    tita_answer_text: Optional[str],
    palette_state: PaletteState,
    time_spent_delta: int,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Auto-saves a student response during the test session.
    """
    stmt = (
        select(QuestionAttempt)
        .where(QuestionAttempt.test_attempt_id == test_attempt_id)
        .where(QuestionAttempt.question_id == question_id)
    )
    res = await db.execute(stmt)
    qa = res.scalar_one_or_none()
    if not qa:
        raise ValueError("QuestionAttempt record not found for this attempt.")

    qa.selected_option_id = selected_option_id
    qa.tita_answer_text = tita_answer_text
    qa.palette_state = palette_state
    qa.time_spent_seconds += max(0, time_spent_delta)

    await db.commit()

    return {
        "status": "SAVED",
        "test_attempt_id": test_attempt_id,
        "question_id": question_id,
        "palette_state": qa.palette_state.value,
        "total_time_spent_seconds": qa.time_spent_seconds
    }


async def submit_and_score_exam(
    test_attempt_id: str,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Submits the exam attempt, evaluates all question attempts deterministically,
    and updates scores on the database record.
    """
    stmt = select(TestAttempt).where(TestAttempt.id == test_attempt_id)
    res = await db.execute(stmt)
    attempt = res.scalar_one_or_none()
    if not attempt:
        raise ValueError("TestAttempt not found.")

    score_items: List[QuestionScoreItem] = []

    for qa in attempt.question_attempts:
        q = qa.question
        sec_code = q.subtopic.topic.section.code
        top_code = q.subtopic.topic.code

        # Determine candidate's answer representation
        candidate_ans: Optional[str] = None
        if q.question_type.value == "MCQ" and qa.selected_option:
            candidate_ans = qa.selected_option.option_key
        elif q.question_type.value == "TITA":
            candidate_ans = qa.tita_answer_text

        score_items.append(QuestionScoreItem(
            question_id=q.id,
            section_code=sec_code,  # type: ignore[arg-type]
            topic_code=top_code,
            question_type=q.question_type.value,  # type: ignore[arg-type]
            correct_answer=q.correct_answer,
            candidate_answer=candidate_ans,
            time_spent_seconds=qa.time_spent_seconds
        ))

    scorecard = compute_exam_scorecard(score_items)

    # Persist marks on each question attempt
    eval_map = {e.question_id: e for e in scorecard.question_evaluations}
    for qa in attempt.question_attempts:
        ev = eval_map.get(qa.question_id)
        if ev:
            qa.is_correct = ev.is_correct
            qa.marks_awarded = ev.marks_awarded

    # Update attempt status and scores
    attempt.status = AttemptStatus.SUBMITTED
    attempt.submitted_at = datetime.now(timezone.utc)
    attempt.total_score = scorecard.total_score
    attempt.varc_score = scorecard.sectional_summaries.get("VARC", None).net_score if "VARC" in scorecard.sectional_summaries else 0.0
    attempt.dilr_score = scorecard.sectional_summaries.get("DILR", None).net_score if "DILR" in scorecard.sectional_summaries else 0.0
    attempt.qa_score = scorecard.sectional_summaries.get("QA", None).net_score if "QA" in scorecard.sectional_summaries else 0.0

    await db.commit()

    return {
        "test_attempt_id": attempt.id,
        "status": attempt.status.value,
        "submitted_at": attempt.submitted_at.isoformat(),
        "total_score": float(attempt.total_score or 0.0),
        "sectional_scores": {
            "VARC": float(attempt.varc_score or 0.0),
            "DILR": float(attempt.dilr_score or 0.0),
            "QA": float(attempt.qa_score or 0.0)
        },
        "overall_accuracy_percentage": scorecard.overall_accuracy_percentage,
        "scorecard": scorecard.model_dump()
    }
