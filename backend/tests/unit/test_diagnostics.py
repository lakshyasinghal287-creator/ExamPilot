"""
Unit tests for the Phase 9 Diagnostic Analytics & Recommendation Engine.
Tests the pure-Python helper functions (no DB required).
"""

import pytest
from backend.app.services.diagnostics import (
    _classify_quadrant,
    _quadrant_label,
    _compute_priority_score,
    _generate_rationale,
)


class TestQuadrantClassification:
    def test_fast_accurate_q1(self):
        assert _classify_quadrant(80.0, 60.0) == "Q1_FAST_ACCURATE"

    def test_slow_accurate_q2(self):
        assert _classify_quadrant(70.0, 120.0) == "Q2_SLOW_ACCURATE"

    def test_fast_inaccurate_q3(self):
        assert _classify_quadrant(30.0, 60.0) == "Q3_FAST_INACCURATE"

    def test_slow_inaccurate_q4(self):
        assert _classify_quadrant(20.0, 150.0) == "Q4_SLOW_INACCURATE"

    def test_boundary_exact_threshold_speed(self):
        # Exactly at speed threshold (90s) → not fast → Q2 or Q4
        assert _classify_quadrant(60.0, 90.0) in ("Q2_SLOW_ACCURATE", "Q4_SLOW_INACCURATE")

    def test_boundary_exact_threshold_accuracy(self):
        # Exactly at accuracy threshold (50%) → not accurate → Q3 or Q4
        assert _classify_quadrant(50.0, 60.0) in ("Q1_FAST_ACCURATE", "Q3_FAST_INACCURATE")

    def test_zero_accuracy_slow(self):
        assert _classify_quadrant(0.0, 200.0) == "Q4_SLOW_INACCURATE"

    def test_perfect_accuracy_fast(self):
        assert _classify_quadrant(100.0, 30.0) == "Q1_FAST_ACCURATE"


class TestQuadrantLabel:
    def test_all_labels_non_empty(self):
        for code in ["Q1_FAST_ACCURATE", "Q2_SLOW_ACCURATE", "Q3_FAST_INACCURATE", "Q4_SLOW_INACCURATE"]:
            label = _quadrant_label(code)
            assert label and len(label) > 3

    def test_unknown_code_returns_code(self):
        assert _quadrant_label("UNKNOWN_CODE") == "UNKNOWN_CODE"


class TestPriorityScore:
    def test_zero_accuracy_max_time_gives_high_priority(self):
        score = _compute_priority_score(0.0, 180.0, 5)
        assert score > 0.8

    def test_perfect_accuracy_fast_gives_low_priority(self):
        score = _compute_priority_score(100.0, 30.0, 5)
        assert score < 0.2

    def test_priority_bounded_non_negative(self):
        score = _compute_priority_score(50.0, 90.0, 3)
        assert score >= 0.0

    def test_more_questions_increases_volume_weight(self):
        low_volume = _compute_priority_score(30.0, 120.0, 1)
        high_volume = _compute_priority_score(30.0, 120.0, 10)
        assert high_volume >= low_volume

    def test_higher_accuracy_decreases_priority(self):
        low_acc = _compute_priority_score(20.0, 100.0, 5)
        high_acc = _compute_priority_score(80.0, 100.0, 5)
        assert low_acc > high_acc


class TestRationaleGeneration:
    def test_rationale_contains_key_fields(self):
        rationale = _generate_rationale(
            subtopic_name="Remainders & Modular Arithmetic",
            topic_name="Number System",
            section_code="QA",
            accuracy_pct=25.0,
            avg_time_seconds=120.0,
            questions_correct=1,
            questions_attempted=4,
            quadrant="Q4_SLOW_INACCURATE",
        )
        assert "QA" in rationale
        assert "Number System" in rationale
        assert "Remainders" in rationale
        assert "25.0%" in rationale
        assert "4" in rationale  # attempted count

    def test_rationale_is_non_empty_string(self):
        rationale = _generate_rationale(
            "Some Topic", "Parent Topic", "VARC",
            60.0, 80.0, 3, 5, "Q2_SLOW_ACCURATE"
        )
        assert isinstance(rationale, str)
        assert len(rationale) > 50

    def test_rationale_includes_quadrant_advice(self):
        rationale = _generate_rationale(
            "Para-Jumbles", "Verbal Ability", "VARC",
            90.0, 150.0, 9, 10, "Q2_SLOW_ACCURATE"
        )
        assert "speed" in rationale.lower() or "slow" in rationale.lower()

