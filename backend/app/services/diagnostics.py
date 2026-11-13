"""
Phase 9: Diagnostic Analytics & Explainable Recommendation Engine.

After an exam is submitted, this service:
1. Aggregates per-topic performance metrics (accuracy, avg time, speed-accuracy quadrant).
2. Generates ranked, explainable subtopic recommendations based on weakness detection.
3. Persists PerformanceMetric and Recommendation rows to the DB.
4. Provides a query API to retrieve analytics for a user.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from backend.app.db.models.attempt import TestAttempt, QuestionAttempt
from backend.app.db.models.metric import PerformanceMetric, Recommendation
from backend.app.db.models.exam import Topic, SubTopic


# ---------------------------------------------------------------------------
# Speed-Accuracy Quadrant Classification
# ---------------------------------------------------------------------------
# Baseline thresholds (tunable). Based on CAT avg solve time per question.
_SPEED_THRESHOLD_SECONDS = 90   # faster than 90s = "Fast"
_ACCURACY_THRESHOLD_PCT  = 50.0  # higher than 50% = "High Accuracy"


def _classify_quadrant(accuracy_pct: float, avg_time_seconds: float) -> str:
    """
    Returns one of four quadrant labels based on speed vs accuracy:
      Q1 — Fast & Accurate    → Keep it up
      Q2 — Slow & Accurate    → Needs speed drills
      Q3 — Fast & Inaccurate  → Reckless answering, needs conceptual review
      Q4 — Slow & Inaccurate  → Priority remediation zone
    """
    fast = avg_time_seconds < _SPEED_THRESHOLD_SECONDS
    accurate = accuracy_pct >= _ACCURACY_THRESHOLD_PCT

    if fast and accurate:
        return "Q1_FAST_ACCURATE"
    elif not fast and accurate:
        return "Q2_SLOW_ACCURATE"
    elif fast and not accurate:
        return "Q3_FAST_INACCURATE"
    else:
        return "Q4_SLOW_INACCURATE"


def _quadrant_label(code: str) -> str:
    return {
        "Q1_FAST_ACCURATE":   "Fast & Accurate",
        "Q2_SLOW_ACCURATE":   "Slow & Accurate",
        "Q3_FAST_INACCURATE": "Fast & Inaccurate",
        "Q4_SLOW_INACCURATE": "Slow & Inaccurate",
    }.get(code, code)


# ---------------------------------------------------------------------------
# Priority Score Formula
# ---------------------------------------------------------------------------
def _compute_priority_score(accuracy_pct: float, avg_time_seconds: float, questions_attempted: int) -> float:
    """
    Priority = (1 - accuracy_rate) * time_penalty * volume_weight

    Higher score = higher remediation urgency.
    - Accuracy component: inverted so 0% accuracy → 1.0 urgency
    - Time component: normalized to [1.0, 2.0]; slow questions get extra weight
    - Volume weight: more attempted questions = more reliable signal (capped at 1.0)
    """
    accuracy_rate = accuracy_pct / 100.0
    time_norm = min(avg_time_seconds / _SPEED_THRESHOLD_SECONDS, 2.0)
    volume_weight = min(questions_attempted / 5.0, 1.0)

    priority = (1.0 - accuracy_rate) * time_norm * (0.5 + 0.5 * volume_weight)
    return round(priority, 4)


# ---------------------------------------------------------------------------
# Rationale Text Generator
# ---------------------------------------------------------------------------
def _generate_rationale(
    subtopic_name: str,
    topic_name: str,
    section_code: str,
    accuracy_pct: float,
    avg_time_seconds: float,
    questions_correct: int,
    questions_attempted: int,
    quadrant: str,
) -> str:
    """
    Produces an explainable human-readable recommendation rationale.
    Example output:
      "Recommended: Review QA › Number System › Remainders & Modular Arithmetic.
       You attempted 4 questions with 25.0% accuracy (1 correct / 4 attempted)
       and an average solve time of 112s — classified as Slow & Inaccurate (Q4).
       Focus on conceptual gaps and timed practice drills."
    """
    quadrant_advice = {
        "Q1_FAST_ACCURATE":   "Maintain your performance — attempt more advanced questions in this area.",
        "Q2_SLOW_ACCURATE":   "Your concepts are strong but you need speed drills to improve your solve time.",
        "Q3_FAST_INACCURATE": "You are answering quickly but inaccurately — slow down and review the core concepts.",
        "Q4_SLOW_INACCURATE": "This is a priority remediation zone — focus on building concepts first, then practice timed sets.",
    }.get(quadrant, "Review this topic area.")

    return (
        f"Recommended: Review {section_code} \u203a {topic_name} \u203a {subtopic_name}. "
        f"You attempted {questions_attempted} question(s) with {accuracy_pct:.1f}% accuracy "
        f"({questions_correct} correct / {questions_attempted} attempted) "
        f"and an average solve time of {avg_time_seconds:.0f}s — "
        f"classified as {_quadrant_label(quadrant)}. "
        f"{quadrant_advice}"
    )


# ---------------------------------------------------------------------------
# Core Analytics Computation
# ---------------------------------------------------------------------------
async def compute_and_persist_diagnostics(
    test_attempt_id: str,
    db: AsyncSession,
) -> Dict[str, Any]:
    """
    Main entry point.  Called right after submit_and_score_exam() completes.

    1. Loads the TestAttempt with all question attempts.
    2. Buckets attempts by (subtopic → topic → section).
    3. Computes PerformanceMetric per topic and Recommendation per subtopic.
    4. Persists everything and returns a diagnostics summary dict.
    """
    # --- Load attempt ---
    stmt = select(TestAttempt).where(TestAttempt.id == test_attempt_id)
    res = await db.execute(stmt)
    attempt = res.scalar_one_or_none()
    if not attempt:
        raise ValueError(f"TestAttempt '{test_attempt_id}' not found.")

    user_id = attempt.user_id

    # --- Clear stale metrics for this attempt ---
    await db.execute(
        delete(PerformanceMetric).where(PerformanceMetric.test_attempt_id == test_attempt_id)
    )

    # --- Bucket by topic_id ---
    topic_buckets: Dict[str, List[QuestionAttempt]] = {}
    topic_meta: Dict[str, Dict] = {}

    for qa in attempt.question_attempts:
        q = qa.question
        if not q or not q.subtopic or not q.subtopic.topic:
            continue

        topic = q.subtopic.topic
        tid = topic.id

        if tid not in topic_buckets:
            topic_buckets[tid] = []
            topic_meta[tid] = {
                "topic_id": tid,
                "topic_name": topic.name,
                "topic_code": topic.code,
                "section_code": topic.section.code if topic.section else "UNKNOWN",
            }
        topic_buckets[tid].append(qa)

    # --- Also bucket by subtopic_id for recommendations ---
    subtopic_buckets: Dict[str, List[QuestionAttempt]] = {}
    subtopic_meta: Dict[str, Dict] = {}

    for qa in attempt.question_attempts:
        q = qa.question
        if not q or not q.subtopic:
            continue

        sub = q.subtopic
        sid = sub.id

        if sid not in subtopic_buckets:
            subtopic_buckets[sid] = []
            subtopic_meta[sid] = {
                "subtopic_id": sid,
                "subtopic_name": sub.name,
                "topic_name": sub.topic.name if sub.topic else "Unknown",
                "topic_code": sub.topic.code if sub.topic else "?",
                "section_code": sub.topic.section.code if sub.topic and sub.topic.section else "UNKNOWN",
            }
        subtopic_buckets[sid].append(qa)

    # --- Compute & persist PerformanceMetric per topic ---
    topic_metrics_out = []

    for tid, qas in topic_buckets.items():
        meta = topic_meta[tid]

        attempted = len([qa for qa in qas if qa.is_correct is not None or qa.selected_option_id or qa.tita_answer_text])
        correct = len([qa for qa in qas if qa.is_correct is True])
        total_time = sum(qa.time_spent_seconds or 0 for qa in qas)
        avg_time = round(total_time / max(len(qas), 1))
        accuracy_pct = round((correct / max(attempted, 1)) * 100.0, 2) if attempted > 0 else 0.0
        quadrant = _classify_quadrant(accuracy_pct, avg_time)

        metric = PerformanceMetric(
            test_attempt_id=test_attempt_id,
            topic_id=tid,
            accuracy_percentage=accuracy_pct,
            questions_attempted=attempted,
            questions_correct=correct,
            avg_time_spent_seconds=avg_time,
            speed_accuracy_quadrant=quadrant,
        )
        db.add(metric)

        topic_metrics_out.append({
            "topic_code": meta["topic_code"],
            "topic_name": meta["topic_name"],
            "section_code": meta["section_code"],
            "accuracy_percentage": accuracy_pct,
            "questions_attempted": attempted,
            "questions_correct": correct,
            "avg_time_spent_seconds": avg_time,
            "quadrant": quadrant,
            "quadrant_label": _quadrant_label(quadrant),
        })

    await db.flush()

    # --- Compute & persist Recommendation per subtopic ---
    # Only generate for subtopics where attempted > 0
    # Clear previous recommendations for this user (replace them)
    await db.execute(
        delete(Recommendation).where(Recommendation.user_id == user_id)
    )

    recommendations_out = []

    for sid, qas in subtopic_buckets.items():
        meta = subtopic_meta[sid]

        attempted = len([qa for qa in qas if qa.is_correct is not None or qa.selected_option_id or qa.tita_answer_text])
        if attempted == 0:
            continue

        correct = len([qa for qa in qas if qa.is_correct is True])
        total_time = sum(qa.time_spent_seconds or 0 for qa in qas)
        avg_time = round(total_time / max(len(qas), 1))
        accuracy_pct = round((correct / max(attempted, 1)) * 100.0, 2)
        quadrant = _classify_quadrant(accuracy_pct, avg_time)
        priority = _compute_priority_score(accuracy_pct, avg_time, attempted)

        rationale = _generate_rationale(
            subtopic_name=meta["subtopic_name"],
            topic_name=meta["topic_name"],
            section_code=meta["section_code"],
            accuracy_pct=accuracy_pct,
            avg_time_seconds=avg_time,
            questions_correct=correct,
            questions_attempted=attempted,
            quadrant=quadrant,
        )

        rec = Recommendation(
            user_id=user_id,
            target_subtopic_id=sid,
            priority_score=priority,
            rationale_text=rationale,
            is_completed=False,
        )
        db.add(rec)

        recommendations_out.append({
            "subtopic_name": meta["subtopic_name"],
            "topic_name": meta["topic_name"],
            "section_code": meta["section_code"],
            "accuracy_percentage": accuracy_pct,
            "questions_attempted": attempted,
            "avg_time_spent_seconds": avg_time,
            "quadrant": quadrant,
            "quadrant_label": _quadrant_label(quadrant),
            "priority_score": priority,
            "rationale": rationale,
        })

    await db.commit()

    # Sort recommendations by priority descending
    recommendations_out.sort(key=lambda r: r["priority_score"], reverse=True)

    return {
        "test_attempt_id": test_attempt_id,
        "user_id": user_id,
        "topic_metrics": topic_metrics_out,
        "recommendations": recommendations_out[:10],  # Top 10
    }


# ---------------------------------------------------------------------------
# Query: Fetch Analytics for a User
# ---------------------------------------------------------------------------
async def get_user_analytics(
    user_id: str,
    db: AsyncSession,
) -> Dict[str, Any]:
    """
    Returns the latest diagnostic analytics for a user:
    - Most recent PerformanceMetrics (from their last attempt)
    - All pending Recommendations sorted by priority
    """
    # Get the latest attempt
    from backend.app.db.models.attempt import AttemptStatus
    latest_stmt = (
        select(TestAttempt)
        .where(TestAttempt.user_id == user_id)
        .where(TestAttempt.status == AttemptStatus.SUBMITTED)
        .order_by(TestAttempt.submitted_at.desc())
        .limit(1)
    )
    latest_res = await db.execute(latest_stmt)
    latest_attempt = latest_res.scalar_one_or_none()

    topic_metrics_out: List[Dict] = []

    if latest_attempt:
        metrics_stmt = (
            select(PerformanceMetric)
            .where(PerformanceMetric.test_attempt_id == latest_attempt.id)
        )
        metrics_res = await db.execute(metrics_stmt)
        metrics = list(metrics_res.scalars().all())

        for m in metrics:
            topic_metrics_out.append({
                "topic_id": m.topic_id,
                "topic_name": m.topic.name if m.topic else "Unknown",
                "section_code": m.topic.section.code if m.topic and m.topic.section else "UNKNOWN",
                "accuracy_percentage": float(m.accuracy_percentage),
                "questions_attempted": m.questions_attempted,
                "questions_correct": m.questions_correct,
                "avg_time_spent_seconds": m.avg_time_spent_seconds,
                "quadrant": m.speed_accuracy_quadrant,
                "quadrant_label": _quadrant_label(m.speed_accuracy_quadrant),
            })

    # Fetch pending recommendations
    recs_stmt = (
        select(Recommendation)
        .where(Recommendation.user_id == user_id)
        .where(Recommendation.is_completed == False)  # noqa: E712
        .order_by(Recommendation.priority_score.desc())
        .limit(10)
    )
    recs_res = await db.execute(recs_stmt)
    recs = list(recs_res.scalars().all())

    recommendations_out = []
    for r in recs:
        sub = r.target_subtopic
        recommendations_out.append({
            "recommendation_id": r.id,
            "subtopic_name": sub.name if sub else "Unknown",
            "topic_name": sub.topic.name if sub and sub.topic else "Unknown",
            "section_code": sub.topic.section.code if sub and sub.topic and sub.topic.section else "UNKNOWN",
            "priority_score": float(r.priority_score),
            "rationale": r.rationale_text,
            "is_completed": r.is_completed,
            "generated_at": r.generated_at.isoformat(),
        })

    return {
        "user_id": user_id,
        "latest_attempt_id": latest_attempt.id if latest_attempt else None,
        "topic_metrics": topic_metrics_out,
        "recommendations": recommendations_out,
    }

