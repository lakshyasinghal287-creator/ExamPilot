"""
Deterministic Mathematical Verification Engine.
Validates LLM-generated Quantitative Ability answers using SymPy inside an AST-restricted sandbox.
Rejects math hallucinations before questions enter the Question Bank.
"""

import ast
from typing import Optional, Any, Dict
from pydantic import BaseModel
import sympy as sp


class MathVerificationResult(BaseModel):
    """
    Structured outcome of symbolic math verification.
    """
    is_valid: bool
    claimed_answer: str
    computed_value: Optional[str] = None
    derivation_summary: str = ""
    error_message: Optional[str] = None


# Whitelist of permitted AST node types for security sandboxing
_ALLOWED_AST_NODES = (
    ast.Expression,
    ast.BinOp,
    ast.UnaryOp,
    ast.Constant,
    ast.Call,
    ast.Name,
    ast.Load,
    ast.List,
    ast.Tuple,
    ast.Set,
    ast.Dict,
    # Operators
    ast.Add,
    ast.Sub,
    ast.Mult,
    ast.Div,
    ast.FloorDiv,
    ast.Mod,
    ast.Pow,
    ast.USub,
    ast.UAdd,
)

# Safe execution scope for SymPy mathematical symbols and functions
_SAFE_SYMPY_SCOPE: Dict[str, Any] = {
    # Symbols & Variables
    "x": sp.Symbol("x"),
    "y": sp.Symbol("y"),
    "z": sp.Symbol("z"),
    "n": sp.Symbol("n"),
    "symbols": sp.symbols,
    "Symbol": sp.Symbol,
    # Core Mathematical Solvers
    "solve": sp.solve,
    "Eq": sp.Eq,
    "simplify": sp.simplify,
    "expand": sp.expand,
    "factor": sp.factor,
    # Arithmetic & Number Theory
    "pow": pow,
    "sqrt": sp.sqrt,
    "factorial": sp.factorial,
    "gcd": sp.gcd,
    "lcm": sp.lcm,
    "Abs": sp.Abs,
    "abs": abs,
    "log": sp.log,
    "Rational": sp.Rational,
    # Casting & Utilities
    "int": int,
    "float": float,
    "round": round,
    "pi": sp.pi,
    "E": sp.E,
}


def _validate_ast_safety(tree: ast.AST) -> None:
    """
    Recursively inspects the AST tree to ensure no malicious nodes (imports, calls to os/sys,
    attribute access, assignments) exist.
    """
    for node in ast.walk(tree):
        if not isinstance(node, _ALLOWED_AST_NODES):
            raise SecurityError(
                f"Disallowed AST node type '{type(node).__name__}' in mathematical verification script."
            )


class SecurityError(Exception):
    """Raised when an expression contains unauthorized or unsafe code structures."""
    pass


def _canonicalize_for_comparison(val_str: str) -> str:
    """
    Normalizes whitespace, brackets, and ordering for robust comparison.
    """
    cleaned = val_str.strip().replace(" ", "").replace("{", "[").replace("}", "]")
    return cleaned


def _check_mathematical_equivalence(computed: Any, claimed: str) -> bool:
    """
    Compares the SymPy computed object against the claimed string answer.
    Supports numbers, fractions, algebraic sets, and lists.
    """
    claimed_clean = claimed.strip()

    # 1. Direct string match
    if str(computed).strip() == claimed_clean:
        return True

    # 2. Canonicalized string match (e.g. "[2, 3]" vs "2, 3" or "{2, 3}")
    if _canonicalize_for_comparison(str(computed)) == _canonicalize_for_comparison(claimed_clean):
        return True

    # 3. Direct float comparison
    try:
        comp_float = float(computed)
        claimed_float = float(claimed_clean)
        if abs(comp_float - claimed_float) < 1e-5:
            return True
    except (ValueError, TypeError):
        pass

    # 4. Rational / Fraction equivalence (e.g., Rational(1, 2) vs "0.5" or "1/2")
    try:
        claimed_sym = sp.sympify(claimed_clean)
        if sp.simplify(computed - claimed_sym) == 0:
            return True
    except Exception:
        pass

    # 5. List/Set equivalence (e.g. quadratic roots: solve returns [-2, 3], claimed is "3, -2")
    if isinstance(computed, (list, tuple, set)):
        try:
            comp_elements = {_canonicalize_for_comparison(str(item)) for item in computed}
            claimed_parts = {_canonicalize_for_comparison(p) for p in claimed_clean.split(",")}
            if comp_elements == claimed_parts:
                return True
        except Exception:
            pass

    return False


def verify_math_solution(
    verification_expression: str,
    claimed_answer: str
) -> MathVerificationResult:
    """
    Deterministically executes a mathematical verification expression in an AST-restricted
    sandbox and validates whether the evaluated solution matches the claimed answer.
    """
    if not verification_expression or not verification_expression.strip():
        return MathVerificationResult(
            is_valid=False,
            claimed_answer=claimed_answer,
            error_message="Verification expression is empty or missing."
        )

    expr_clean = verification_expression.strip()

    # Step 1: Parse and inspect AST for security
    try:
        parsed_ast = ast.parse(expr_clean, mode="eval")
        _validate_ast_safety(parsed_ast)
    except SecurityError as sec_err:
        return MathVerificationResult(
            is_valid=False,
            claimed_answer=claimed_answer,
            error_message=f"Security sandbox rejection: {str(sec_err)}"
        )
    except SyntaxError as syn_err:
        return MathVerificationResult(
            is_valid=False,
            claimed_answer=claimed_answer,
            error_message=f"Syntax error in verification expression: {str(syn_err)}"
        )

    # Step 2: Compile and execute within the restricted SymPy scope
    try:
        compiled_code = compile(parsed_ast, "<sympy_sandbox>", "eval")
        computed_result = eval(compiled_code, {"__builtins__": {}}, _SAFE_SYMPY_SCOPE)
    except Exception as exec_err:
        return MathVerificationResult(
            is_valid=False,
            claimed_answer=claimed_answer,
            error_message=f"Execution error during symbolic solving: {str(exec_err)}"
        )

    computed_str = str(computed_result)

    # Step 3: Compare computed result against claimed answer
    is_equivalent = _check_mathematical_equivalence(computed_result, claimed_answer)

    if is_equivalent:
        return MathVerificationResult(
            is_valid=True,
            claimed_answer=claimed_answer,
            computed_value=computed_str,
            derivation_summary=f"Deterministically verified via SymPy: {expr_clean} = {computed_str}",
            error_message=None
        )
    else:
        return MathVerificationResult(
            is_valid=False,
            claimed_answer=claimed_answer,
            computed_value=computed_str,
            derivation_summary=f"Computed {computed_str} from expression, but claimed answer was '{claimed_answer}'",
            error_message="Mathematical discrepancy: calculated value does not match claimed answer key."
        )
