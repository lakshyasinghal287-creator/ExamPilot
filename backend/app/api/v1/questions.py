"""
FastAPI Router for Question Generation and Validation Endpoints.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.models.question import Question
from backend.app.ai_pipeline.pipeline import (
    process_and_validate_question_payload,
    generate_and_validate_question,
)

router = APIRouter(prefix="/questions", tags=["Questions"])


class GenerateQuestionRequest(BaseModel):
    subtopic_id: str
    prompt: str = "Generate a CAT standard Quantitative Ability remainder question."
    system_instruction: str = "You are a senior CAT faculty expert."


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
