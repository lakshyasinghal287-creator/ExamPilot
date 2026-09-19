"""
Unit Tests for CAT Deterministic Scoring Engine.
Tests all boundary conditions, marking rubrics (+3/-1/0), TITA zero-penalty, and aggregation logic.
"""

import pytest
from backend.app.schemas.scoring import QuestionScoreItem
from backend.app.services.scoring import evaluate_single_question, compute_exam_scorecard


def test_mcq_correct_gives_plus_3():
    item = QuestionScoreItem(
        question_id="q1",
        section_code="QA",
        topic_code="QA-ARITH",
        question_type="MCQ",
        correct_answer="B",
        candidate_answer="B",
        time_spent_seconds=65
    )
    result = evaluate_single_question(item)
    assert result.is_attempted is True
    assert result.is_correct is True
    assert result.marks_awarded == 3.0
    assert result.time_spent_seconds == 65


def test_mcq_incorrect_gives_minus_1():
    item = QuestionScoreItem(
        question_id="q2",
        section_code="QA",
        topic_code="QA-ALGEBRA",
        question_type="MCQ",
        correct_answer="A",
        candidate_answer="C",
        time_spent_seconds=80
    )
    result = evaluate_single_question(item)
    assert result.is_attempted is True
    assert result.is_correct is False
    assert result.marks_awarded == -1.0


def test_mcq_case_insensitivity_and_whitespace():
    item = QuestionScoreItem(
        question_id="q3",
        section_code="VARC",
        topic_code="VARC-RC",
        question_type="MCQ",
        correct_answer="D",
        candidate_answer="  d  ",
        time_spent_seconds=45
    )
    result = evaluate_single_question(item)
    assert result.is_correct is True
    assert result.marks_awarded == 3.0


def test_tita_correct_gives_plus_3():
    item = QuestionScoreItem(
        question_id="q4",
        section_code="QA",
        topic_code="QA-ARITH",
        question_type="TITA",
        correct_answer="42",
        candidate_answer="42",
        time_spent_seconds=90
    )
    result = evaluate_single_question(item)
    assert result.is_attempted is True
    assert result.is_correct is True
    assert result.marks_awarded == 3.0


def test_tita_incorrect_carries_zero_negative_marks():
    """
    CRITICAL CAT RULE: TITA questions carry NO negative marking for incorrect answers!
    """
    item = QuestionScoreItem(
        question_id="q5",
        section_code="QA",
        topic_code="QA-ARITH",
        question_type="TITA",
        correct_answer="42",
        candidate_answer="17",
        time_spent_seconds=120
    )
    result = evaluate_single_question(item)
    assert result.is_attempted is True
    assert result.is_correct is False
    assert result.marks_awarded == 0.0  # NOT -1.0!


def test_tita_numerical_equivalence():
    item = QuestionScoreItem(
        question_id="q6",
        section_code="QA",
        topic_code="QA-GEOM",
        question_type="TITA",
        correct_answer="14.0",
        candidate_answer="14",
        time_spent_seconds=50
    )
    result = evaluate_single_question(item)
    assert result.is_correct is True
    assert result.marks_awarded == 3.0


def test_unattempted_question_gives_zero():
    item = QuestionScoreItem(
        question_id="q7",
        section_code="DILR",
        topic_code="DILR-ARRANGEMENTS",
        question_type="MCQ",
        correct_answer="C",
        candidate_answer=None,
        time_spent_seconds=10
    )
    result = evaluate_single_question(item)
    assert result.is_attempted is False
    assert result.is_correct is False
    assert result.marks_awarded == 0.0


def test_compute_exam_scorecard_multi_section():
    items = [
        # VARC: 2 attempted (1 correct, 1 incorrect MCQ) -> Score = 3 - 1 = 2
        QuestionScoreItem(question_id="v1", section_code="VARC", topic_code="RC", question_type="MCQ", correct_answer="A", candidate_answer="A", time_spent_seconds=60),
        QuestionScoreItem(question_id="v2", section_code="VARC", topic_code="VA", question_type="MCQ", correct_answer="B", candidate_answer="C", time_spent_seconds=50),
        # DILR: 2 items (1 correct TITA, 1 unattempted) -> Score = 3 + 0 = 3
        QuestionScoreItem(question_id="d1", section_code="DILR", topic_code="PUZZLE", question_type="TITA", correct_answer="5", candidate_answer="5", time_spent_seconds=100),
        QuestionScoreItem(question_id="d2", section_code="DILR", topic_code="PUZZLE", question_type="MCQ", correct_answer="D", candidate_answer=None, time_spent_seconds=0),
        # QA: 2 items (1 wrong TITA, 1 wrong MCQ) -> Score = 0 - 1 = -1
        QuestionScoreItem(question_id="q1", section_code="QA", topic_code="ARITH", question_type="TITA", correct_answer="10", candidate_answer="12", time_spent_seconds=90),
        QuestionScoreItem(question_id="q2", section_code="QA", topic_code="ALGEBRA", question_type="MCQ", correct_answer="A", candidate_answer="B", time_spent_seconds=80),
    ]

    scorecard = compute_exam_scorecard(items)

    assert scorecard.total_questions == 6
    assert scorecard.total_attempted == 5
    assert scorecard.total_correct == 2
    assert scorecard.total_incorrect == 3
    assert scorecard.total_unattempted == 1

    # Total Score = VARC (2) + DILR (3) + QA (-1) = 4.0
    assert scorecard.total_score == 4.0
    assert scorecard.max_possible_score == 18.0
    assert scorecard.overall_accuracy_percentage == round(2 / 5 * 100.0, 2)  # 40.0%

    # Check Section Summaries
    varc_summary = scorecard.sectional_summaries["VARC"]
    assert varc_summary.net_score == 2.0
    assert varc_summary.accuracy_percentage == 50.0

    dilr_summary = scorecard.sectional_summaries["DILR"]
    assert dilr_summary.net_score == 3.0
    assert dilr_summary.accuracy_percentage == 100.0

    qa_summary = scorecard.sectional_summaries["QA"]
    assert qa_summary.net_score == -1.0
    assert qa_summary.accuracy_percentage == 0.0


def test_negative_total_score_preserved():
    """Verify that a candidate who gets only wrong MCQs receives an overall negative score."""
    items = [
        QuestionScoreItem(question_id="q1", section_code="QA", topic_code="ARITH", question_type="MCQ", correct_answer="A", candidate_answer="B", time_spent_seconds=30),
        QuestionScoreItem(question_id="q2", section_code="QA", topic_code="ALGEBRA", question_type="MCQ", correct_answer="A", candidate_answer="C", time_spent_seconds=40),
    ]
    scorecard = compute_exam_scorecard(items)
    assert scorecard.total_score == -2.0
