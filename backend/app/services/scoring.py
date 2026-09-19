"""
CAT Deterministic Scoring Engine.
Implements official CAT evaluation rubrics:
- MCQ:  +3.0 for correct, -1.0 for incorrect, 0.0 for unattempted
- TITA: +3.0 for correct,  0.0 for incorrect, 0.0 for unattempted
Computes section-wise aggregates and overall scorecard.
"""

from typing import List, Dict
from backend.app.schemas.scoring import (
    QuestionScoreItem,
    QuestionEvaluationResult,
    SectionScoreSummary,
    ExamScorecard,
)


def _is_tita_match(candidate: str, correct: str) -> bool:
    """
    Robust comparison for TITA (Type In The Answer) inputs.
    Handles exact string matching as well as numerical equivalence (e.g. '4.0' == '4').
    """
    cand_clean = candidate.strip().lower()
    corr_clean = correct.strip().lower()

    if cand_clean == corr_clean:
        return True

    # Check for numerical equivalence if both parse as numbers
    try:
        cand_num = float(cand_clean)
        corr_num = float(corr_clean)
        return abs(cand_num - corr_num) < 1e-6
    except ValueError:
        return False


def evaluate_single_question(item: QuestionScoreItem) -> QuestionEvaluationResult:
    """
    Evaluates a single question attempt deterministically based on CAT rules.
    """
    is_attempted = bool(item.candidate_answer is not None and item.candidate_answer.strip() != "")

    if not is_attempted:
        return QuestionEvaluationResult(
            question_id=item.question_id,
            section_code=item.section_code,
            topic_code=item.topic_code,
            question_type=item.question_type,
            is_attempted=False,
            is_correct=False,
            marks_awarded=0.0,
            time_spent_seconds=item.time_spent_seconds,
        )

    # Safe to assert candidate_answer is not None due to is_attempted check
    assert item.candidate_answer is not None

    if item.question_type == "MCQ":
        # Options are single characters A, B, C, D
        is_correct = (item.candidate_answer.strip().upper() == item.correct_answer.strip().upper())
        marks = 3.0 if is_correct else -1.0
    elif item.question_type == "TITA":
        is_correct = _is_tita_match(item.candidate_answer, item.correct_answer)
        # Official CAT Rule: TITA questions carry 0 negative marking for incorrect attempts
        marks = 3.0 if is_correct else 0.0
    else:
        raise ValueError(f"Unsupported question type: {item.question_type}")

    return QuestionEvaluationResult(
        question_id=item.question_id,
        section_code=item.section_code,
        topic_code=item.topic_code,
        question_type=item.question_type,
        is_attempted=True,
        is_correct=is_correct,
        marks_awarded=marks,
        time_spent_seconds=item.time_spent_seconds,
    )


def compute_exam_scorecard(items: List[QuestionScoreItem]) -> ExamScorecard:
    """
    Evaluates an entire collection of question attempts and aggregates
    both section-wise and overall scorecard metrics.
    """
    evaluations: List[QuestionEvaluationResult] = []
    sectional_buckets: Dict[str, List[QuestionEvaluationResult]] = {}

    for item in items:
        ev = evaluate_single_question(item)
        evaluations.append(ev)
        if ev.section_code not in sectional_buckets:
            sectional_buckets[ev.section_code] = []
        sectional_buckets[ev.section_code].append(ev)

    sectional_summaries: Dict[str, SectionScoreSummary] = {}
    total_score: float = 0.0
    total_attempted: int = 0
    total_correct: int = 0
    total_incorrect: int = 0
    total_unattempted: int = 0

    for section_code, ev_list in sectional_buckets.items():
        sec_total = len(ev_list)
        sec_attempted = sum(1 for e in ev_list if e.is_attempted)
        sec_correct = sum(1 for e in ev_list if e.is_attempted and e.is_correct)
        sec_incorrect = sum(1 for e in ev_list if e.is_attempted and not e.is_correct)
        sec_unattempted = sec_total - sec_attempted
        sec_net_score = sum(e.marks_awarded for e in ev_list)
        sec_time = sum(e.time_spent_seconds for e in ev_list)
        sec_accuracy = round((sec_correct / sec_attempted * 100.0), 2) if sec_attempted > 0 else 0.0

        sectional_summaries[section_code] = SectionScoreSummary(
            section_code=section_code,
            total_questions=sec_total,
            attempted=sec_attempted,
            correct=sec_correct,
            incorrect=sec_incorrect,
            unattempted=sec_unattempted,
            net_score=round(sec_net_score, 2),
            accuracy_percentage=sec_accuracy,
            total_time_spent_seconds=sec_time,
        )

        total_score += sec_net_score
        total_attempted += sec_attempted
        total_correct += sec_correct
        total_incorrect += sec_incorrect
        total_unattempted += sec_unattempted

    max_possible = len(items) * 3.0
    overall_accuracy = round((total_correct / total_attempted * 100.0), 2) if total_attempted > 0 else 0.0

    return ExamScorecard(
        total_score=round(total_score, 2),
        max_possible_score=round(max_possible, 2),
        total_questions=len(items),
        total_attempted=total_attempted,
        total_correct=total_correct,
        total_incorrect=total_incorrect,
        total_unattempted=total_unattempted,
        overall_accuracy_percentage=overall_accuracy,
        sectional_summaries=sectional_summaries,
        question_evaluations=evaluations,
    )
