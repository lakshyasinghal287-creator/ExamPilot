"""
FastAPI Router for CAT Test Lifecycle Endpoints.
Handles test initiation, response auto-saving, and exam submission.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_db
from backend.app.db.models.attempt import PaletteState, TestMode
from backend.app.services.test_engine import (
    start_test_session,
    save_question_response,
    submit_and_score_exam,
)

router = APIRouter(prefix="/tests", tags=["Tests"])


class StartTestRequest(BaseModel):
    user_id: str
    exam_code: str = "CAT-2026"
    mode: TestMode = TestMode.MOCK_EXAM


class SaveResponseRequest(BaseModel):
    question_id: str
    selected_option_id: Optional[str] = None
    tita_answer_text: Optional[str] = None
    palette_state: PaletteState = PaletteState.ANSWERED
    time_spent_delta_seconds: int = Field(default=0, ge=0)


@router.post("/start", status_code=status.HTTP_201_CREATED)
async def start_test(
    request: StartTestRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Initializes a new CAT test session and returns Section 1 payload.
    """
    try:
        session_data = await start_test_session(
            user_id=request.user_id,
            exam_code=request.exam_code,
            db=db,
            mode=request.mode
        )
        return session_data
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )


@router.post("/{attempt_id}/save-response", status_code=status.HTTP_200_OK)
async def save_response(
    attempt_id: str,
    request: SaveResponseRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Auto-saves a student response during the test session.
    """
    try:
        result = await save_question_response(
            test_attempt_id=attempt_id,
            question_id=request.question_id,
            selected_option_id=request.selected_option_id,
            tita_answer_text=request.tita_answer_text,
            palette_state=request.palette_state,
            time_spent_delta=request.time_spent_delta_seconds,
            db=db
        )
        return result
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )


@router.post("/{attempt_id}/finish", status_code=status.HTTP_200_OK)
async def finish_exam(
    attempt_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits the test attempt, computes deterministic CAT marks (+3/-1/0),
    and returns the comprehensive scorecard.
    """
    try:
        summary = await submit_and_score_exam(
            test_attempt_id=attempt_id,
            db=db
        )
        return summary
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )
