"""
Multi-Stage AI Question Generation and Validation Pipeline.
Coordinates:
1. Prompt generation & LLM invocation
2. Pydantic structural schema validation
3. SymPy deterministic mathematical verification (for QA questions)
4. Database banking with status VALIDATED or REJECTED.
"""

from typing import Dict, Any, Optional
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.schemas.question import QuestionCreateSchema
from backend.app.ai_pipeline.provider import BaseLLMProvider, get_llm_provider
from backend.app.ai_pipeline.math_verifier import verify_math_solution, MathVerificationResult
from backend.app.db.models.question import Question, QuestionOption, QuestionType, ValidationStatus


class PipelineResult:
    """Represents the complete result of running the question pipeline."""

    def __init__(
        self,
        is_success: bool,
        question_id: Optional[str] = None,
        validated_schema: Optional[QuestionCreateSchema] = None,
        math_verification: Optional[MathVerificationResult] = None,
        rejection_reason: Optional[str] = None
    ):
        self.is_success = is_success
        self.question_id = question_id
        self.validated_schema = validated_schema
        self.math_verification = math_verification
        self.rejection_reason = rejection_reason


async def process_and_validate_question_payload(
    raw_payload: Dict[str, Any],
    db_session: Optional[AsyncSession] = None,
    subtopic_id: Optional[str] = None
) -> PipelineResult:
    """
    Executes the multi-stage validation pipeline over a candidate JSON question dictionary:
    Stage 1: Pydantic Structural Schema Check
    Stage 2: Deterministic SymPy Math Verification (if QA section)
    Stage 3: Database insertion (if db_session and subtopic_id provided)
    """
    # Stage 1: Pydantic Schema Validation
    try:
        validated_q = QuestionCreateSchema.model_validate(raw_payload)
    except ValidationError as val_err:
        return PipelineResult(
            is_success=False,
            rejection_reason=f"Structural Schema Failure: {str(val_err)}"
        )

    math_result: Optional[MathVerificationResult] = None

    # Stage 2: Mathematical Verification (if QA section and verification expression provided)
    if validated_q.section_code == "QA":
        if not validated_q.verification_expression:
            return PipelineResult(
                is_success=False,
                validated_schema=validated_q,
                rejection_reason="QA question rejected: Missing required SymPy verification expression."
            )

        # For MCQs, find the text of the claimed correct option to verify against math result
        target_answer_value = validated_q.correct_answer
        if validated_q.question_type == "MCQ" and validated_q.options:
            correct_opt = next(o for o in validated_q.options if o.option_key == validated_q.correct_answer)
            target_answer_value = correct_opt.option_text

        math_result = verify_math_solution(
            validated_q.verification_expression,
            target_answer_value
        )

        if not math_result.is_valid:
            return PipelineResult(
                is_success=False,
                validated_schema=validated_q,
                math_verification=math_result,
                rejection_reason=f"Math Verification Failure: {math_result.error_message}"
            )

    # Stage 3: Database Persistence (if session provided)
    saved_question_id: Optional[str] = None
    if db_session and subtopic_id:
        q_entity = Question(
            subtopic_id=subtopic_id,
            question_type=QuestionType(validated_q.question_type),
            question_text=validated_q.question_text,
            correct_answer=validated_q.correct_answer,
            explanation=validated_q.explanation,
            difficulty_level=validated_q.difficulty_level,
            validation_status=ValidationStatus.VALIDATED,
            verification_metadata={
                "expression": validated_q.verification_expression,
                "verified": True,
                "derivation": math_result.derivation_summary if math_result else "N/A"
            } if math_result else None
        )
        db_session.add(q_entity)
        await db_session.flush()

        if validated_q.options:
            for opt_data in validated_q.options:
                opt_entity = QuestionOption(
                    question_id=q_entity.id,
                    option_key=opt_data.option_key,
                    option_text=opt_data.option_text,
                    is_correct=opt_data.is_correct
                )
                db_session.add(opt_entity)

        await db_session.commit()
        saved_question_id = q_entity.id

    return PipelineResult(
        is_success=True,
        question_id=saved_question_id,
        validated_schema=validated_q,
        math_verification=math_result
    )


async def generate_and_validate_question(
    prompt: str,
    system_instruction: str,
    provider: Optional[BaseLLMProvider] = None,
    db_session: Optional[AsyncSession] = None,
    subtopic_id: Optional[str] = None
) -> PipelineResult:
    """
    Coordinates end-to-end question generation from an LLM followed by full deterministic validation.
    """
    llm = provider or get_llm_provider()
    raw_json = await llm.generate_structured_json(prompt, system_instruction)
    return await process_and_validate_question_payload(
        raw_payload=raw_json,
        db_session=db_session,
        subtopic_id=subtopic_id
    )
