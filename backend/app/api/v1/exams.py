"""
Exams API Router.
Provides access to available exams, sections, and automated full paper generation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from backend.app.db.session import get_db
from backend.app.db.models.exam import Exam, Section

router = APIRouter(prefix="/exams", tags=["exams"])


class SectionInfo(BaseModel):
    code: str
    name: str
    sequence_order: int
    duration_minutes: int
    target_question_count: int


class ExamInfo(BaseModel):
    code: str
    name: str
    total_duration_minutes: int
    total_questions: int
    sections: List[SectionInfo]


class GenerateAiMockRequest(BaseModel):
    custom_title: Optional[str] = None


@router.get("/", response_model=List[ExamInfo])
async def list_exams(db: AsyncSession = Depends(get_db)):
    """Return all active exams with their sections."""
    result = await db.execute(
        select(Exam).where(Exam.is_active == True).order_by(Exam.code)
    )
    exams = result.scalars().all()
    if not exams:
        raise HTTPException(status_code=404, detail="No active exams found in database.")

    out = []
    for exam in exams:
        sections = sorted(exam.sections, key=lambda s: s.sequence_order)
        out.append(ExamInfo(
            code=exam.code,
            name=exam.name,
            total_duration_minutes=exam.total_duration_minutes,
            total_questions=exam.total_questions,
            sections=[
                SectionInfo(
                    code=s.code,
                    name=s.name,
                    sequence_order=s.sequence_order,
                    duration_minutes=s.duration_minutes,
                    target_question_count=s.target_question_count,
                )
                for s in sections
            ],
        ))
    return out


@router.post("/generate-ai-mock", status_code=status.HTTP_201_CREATED)
async def generate_ai_mock_endpoint(
    request: GenerateAiMockRequest = GenerateAiMockRequest(),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Synthesizes a full, authentic 66-question CAT mock exam using Google Gemini AI,
    complete with SymPy math verification and multi-section taxonomy.
    """
    from backend.app.services.ai_paper_generator import generate_complete_ai_cat_exam
    try:
        result = await generate_complete_ai_cat_exam(db, custom_title=request.custom_title)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to synthesize complete AI mock exam: {str(exc)}"
        )


@router.get("/{exam_code}", response_model=ExamInfo)
async def get_exam(exam_code: str, db: AsyncSession = Depends(get_db)):
    """Return a specific exam by code."""
    result = await db.execute(
        select(Exam).where(Exam.code == exam_code.upper())
    )
    exam = result.scalar_one_or_none()
    if not exam:
        raise HTTPException(status_code=404, detail=f"Exam '{exam_code}' not found.")

    sections = sorted(exam.sections, key=lambda s: s.sequence_order)
    return ExamInfo(
        code=exam.code,
        name=exam.name,
        total_duration_minutes=exam.total_duration_minutes,
        total_questions=exam.total_questions,
        sections=[
            SectionInfo(
                code=s.code,
                name=s.name,
                sequence_order=s.sequence_order,
                duration_minutes=s.duration_minutes,
                target_question_count=s.target_question_count,
            )
            for s in sections
        ],
    )
