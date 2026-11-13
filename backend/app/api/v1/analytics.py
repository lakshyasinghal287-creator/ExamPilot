"""
FastAPI Router for Diagnostic Analytics & Recommendation Endpoints.
Phase 9: Provides explainable performance diagnostics after exam submission.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_db
from backend.app.services.diagnostics import compute_and_persist_diagnostics, get_user_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post("/{test_attempt_id}/compute", status_code=status.HTTP_201_CREATED)
async def compute_diagnostics(
    test_attempt_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Computes and persists diagnostic analytics for a completed test attempt.
    Call this right after /tests/{id}/finish to generate performance metrics
    and explainable subtopic recommendations.
    """
    try:
        result = await compute_and_persist_diagnostics(test_attempt_id, db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/users/{user_id}", status_code=status.HTTP_200_OK)
async def get_analytics(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the latest diagnostic analytics for a student:
    - Topic-wise performance metrics (accuracy, avg time, speed-accuracy quadrant)
    - Top 10 prioritised subtopic recommendations with explainable rationale
    """
    result = await get_user_analytics(user_id, db)
    return result

