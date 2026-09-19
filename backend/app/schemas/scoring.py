"""
Pydantic Schemas for the CAT Scoring Engine.
Models inputs (candidate responses) and outputs (scorecards, accuracy metrics).
"""

from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field


class QuestionScoreItem(BaseModel):
    """
    Represents a single question's candidate response and ground truth for evaluation.
    """
    question_id: str
    section_code: Literal["VARC", "DILR", "QA"]
    topic_code: str
    question_type: Literal["MCQ", "TITA"]
    correct_answer: str = Field(..., description="Canonical correct option key (e.g. 'A') or exact numeric value")
    candidate_answer: Optional[str] = Field(None, description="Selected option key or typed TITA string (None if unattempted)")
    time_spent_seconds: int = Field(default=0, ge=0)


class QuestionEvaluationResult(BaseModel):
    """
    Detailed evaluation outcome for an individual question attempt.
    """
    question_id: str
    section_code: str
    topic_code: str
    question_type: str
    is_attempted: bool
    is_correct: bool
    marks_awarded: float
    time_spent_seconds: int


class SectionScoreSummary(BaseModel):
    """
    Section-level performance aggregate.
    """
    section_code: str
    total_questions: int
    attempted: int
    correct: int
    incorrect: int
    unattempted: int
    net_score: float
    accuracy_percentage: float
    total_time_spent_seconds: int


class ExamScorecard(BaseModel):
    """
    Comprehensive exam evaluation scorecard returned after submission.
    """
    total_score: float
    max_possible_score: float
    total_questions: int
    total_attempted: int
    total_correct: int
    total_incorrect: int
    total_unattempted: int
    overall_accuracy_percentage: float
    sectional_summaries: Dict[str, SectionScoreSummary]
    question_evaluations: List[QuestionEvaluationResult]
