"""
FastAPI Router for Question Generation and Validation Endpoints.
"""

from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.models.question import Question
from backend.app.db.models.exam import SubTopic
from backend.app.ai_pipeline.pipeline import (
    process_and_validate_question_payload,
    generate_and_validate_question,
)
from backend.app.ai_pipeline.provider import get_llm_provider
from backend.app.ai_pipeline.prompt_builder import build_cat_question_prompt

router = APIRouter(prefix="/questions", tags=["Questions"])


class GenerateQuestionRequest(BaseModel):
    subtopic_id: str
    prompt: str = "Generate a CAT standard Quantitative Ability remainder question."
    system_instruction: str = "You are a senior CAT faculty expert."


class LiveGenerateRequest(BaseModel):
    section_code: str = Field(default="QA", description="VARC, DILR, or QA")
    topic_name: Optional[str] = Field(default=None, description="Topic name e.g. Number Systems, Algebra, Reading Comprehension")
    subtopic_code: Optional[str] = Field(default=None, description="Optional subtopic code")
    difficulty_level: int = Field(default=3, ge=1, le=5)
    question_type: str = Field(default="MCQ", description="MCQ or TITA")


@router.post("/generate-live", status_code=status.HTTP_200_OK)
async def generate_live_question_endpoint(
    request: LiveGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Real-time AI question generator powered by Google Gemini (with SymPy mathematical verification).
    Can be used by student for live targeted practice drills.
    """
    prompt, system_instruction = build_cat_question_prompt(
        section_code=request.section_code,
        topic_name=request.topic_name,
        subtopic_code=request.subtopic_code,
        difficulty_level=request.difficulty_level,
        question_type=request.question_type
    )

    provider = get_llm_provider()
    try:
        raw_json = await provider.generate_structured_json(prompt, system_instruction)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Provider generation failed: {str(exc)}"
        )

    # Validate structure & SymPy mathematics
    result = await process_and_validate_question_payload(raw_json)
    if not result.is_success:
        # If SymPy rejected the math or schema had issues, return detailed 422
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Question rejected by verification pipeline: {result.rejection_reason}"
        )

    return {
        "status": "VALIDATED",
        "question": result.validated_schema.model_dump() if result.validated_schema else raw_json,
        "math_verified": result.math_verification.is_valid if result.math_verification else None,
        "derivation": result.math_verification.derivation_summary if result.math_verification else None
    }


@router.post("/validate-payload", status_code=status.HTTP_200_OK)
async def validate_question_payload_endpoint(
    payload: Dict[str, Any]
):
    """
    Dry-run validation of a candidate question payload without saving to the database.
    """
    result = await process_and_validate_question_payload(payload)
    if not result.is_success:
        raise HTTPException(
            status_code=422,
            detail=result.rejection_reason
        )
    return {
        "status": "VALIDATED",
        "math_verified": result.math_verification.is_valid if result.math_verification else None,
        "derivation": result.math_verification.derivation_summary if result.math_verification else None
    }


@router.post("/generate-and-bank", status_code=status.HTTP_201_CREATED)
async def generate_and_bank_question(
    request: GenerateQuestionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a structured question, validates schema & math, and persists to question bank.
    """
    result = await generate_and_validate_question(
        prompt=request.prompt,
        system_instruction=request.system_instruction,
        db_session=db,
        subtopic_id=request.subtopic_id
    )
    if not result.is_success:
        raise HTTPException(
            status_code=422,
            detail=result.rejection_reason
        )
    return {
        "status": "BANKED",
        "question_id": result.question_id,
        "derivation": result.math_verification.derivation_summary if result.math_verification else None
    }


@router.get("/{question_id}", status_code=status.HTTP_200_OK)
async def get_question_detail(
    question_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves full question details including verified solution (for review/analytics).
    """
    stmt = select(Question).where(Question.id == question_id)
    res = await db.execute(stmt)
    q = res.scalar_one_or_none()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found.")

    return {
        "question_id": q.id,
        "question_type": q.question_type.value,
        "question_text": q.question_text,
        "correct_answer": q.correct_answer,
        "explanation": q.explanation,
        "difficulty_level": q.difficulty_level,
        "validation_status": q.validation_status.value,
        "options": [
            {"key": o.option_key, "text": o.option_text, "is_correct": o.is_correct}
            for o in q.options
        ] if q.options else []
    }
