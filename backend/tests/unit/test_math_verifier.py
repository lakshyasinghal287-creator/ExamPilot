"""
Unit Tests for SymPy Deterministic Mathematical Verification Engine.
Validates algebraic solving, arithmetic, modular arithmetic, sandboxing security, and hallucination rejection.
"""

import pytest
from backend.app.ai_pipeline.math_verifier import verify_math_solution


def test_arithmetic_verification_success():
    expr = "25 * 4 + 15"
    claimed = "115"
    result = verify_math_solution(expr, claimed)
    assert result.is_valid is True
    assert result.computed_value == "115"
    assert result.error_message is None


def test_quadratic_roots_verification():
    # x^2 - 5x + 6 = 0 -> roots are 2, 3
    expr = "solve(x**2 - 5*x + 6, x)"
    claimed = "[2, 3]"
    result = verify_math_solution(expr, claimed)
    assert result.is_valid is True

    # Also handles set/comma variations: "3, 2"
    result_reversed = verify_math_solution(expr, "3, 2")
    assert result_reversed.is_valid is True


def test_modular_arithmetic_remainders():
    # 2^10 mod 7 = 1024 mod 7 = 2
    expr = "pow(2, 10, 7)"
    claimed = "2"
    result = verify_math_solution(expr, claimed)
    assert result.is_valid is True
    assert result.computed_value == "2"


def test_permutations_and_factorials():
    # 5! / 3! = 120 / 6 = 20
    expr = "factorial(5) / factorial(3)"
    claimed = "20"
    result = verify_math_solution(expr, claimed)
    assert result.is_valid is True


def test_rational_fraction_equivalence():
    # 1/4 == 0.25
    expr = "Rational(1, 4)"
    claimed = "0.25"
    result = verify_math_solution(expr, claimed)
    assert result.is_valid is True


def test_rejection_of_ai_math_hallucination():
    """
    Simulates an LLM proposing a quadratic problem where the claimed answer is wrong:
    x^2 - 9 = 0 -> roots are -3, 3, but the LLM claims answer is 9.
    """
    expr = "solve(x**2 - 9, x)"
    claimed_hallucination = "9"
    result = verify_math_solution(expr, claimed_hallucination)
    assert result.is_valid is False
    assert result.computed_value == "[-3, 3]"
    assert "Mathematical discrepancy" in result.error_message


def test_security_sandbox_rejects_import():
    """Verify that malicious injection via __import__ is blocked at the AST level."""
    malicious_expr = "__import__('os').system('dir')"
    result = verify_math_solution(malicious_expr, "0")
    assert result.is_valid is False
    assert "Security sandbox rejection" in result.error_message


def test_security_sandbox_rejects_arbitrary_attributes():
    """Verify that accessing private attributes (like __class__) is blocked."""
    malicious_expr = "(1).__class__.__bases__"
    result = verify_math_solution(malicious_expr, "None")
    assert result.is_valid is False
    assert "Security sandbox rejection" in result.error_message


def test_empty_expression_fails():
    result = verify_math_solution("", "42")
    assert result.is_valid is False
    assert "empty or missing" in result.error_message
