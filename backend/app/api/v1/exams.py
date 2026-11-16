"""
Exams API Router.
Provides read-only access to available exams and their sections.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
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

