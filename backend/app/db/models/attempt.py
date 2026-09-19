"""
SQLAlchemy 2.0 Models: TestAttempt and QuestionAttempt.
Captures exam sessions, per-question telemetry, palette states, and deterministic score results.
"""

import uuid
import enum
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, JSON, Numeric, UniqueConstraint, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class TestMode(str, enum.Enum):
    __test__ = False
    MOCK_EXAM = "MOCK_EXAM"
    PRACTICE_DRILL = "PRACTICE_DRILL"


class AttemptStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    TIMED_OUT = "TIMED_OUT"
    ABANDONED = "ABANDONED"


class PaletteState(str, enum.Enum):
    NOT_VISITED = "NOT_VISITED"
    NOT_ANSWERED = "NOT_ANSWERED"
    ANSWERED = "ANSWERED"
    MARKED_REVIEW = "MARKED_REVIEW"
    ANSWERED_AND_MARKED = "ANSWERED_AND_MARKED"


class TestAttempt(Base):
    __tablename__ = "test_attempts"
    __test__ = False

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("exams.id", ondelete="RESTRICT"), nullable=False, index=True)
    mode: Mapped[TestMode] = mapped_column(
        Enum(TestMode, native_enum=False, length=32),
        default=TestMode.MOCK_EXAM,
        nullable=False
    )
    status: Mapped[AttemptStatus] = mapped_column(
        Enum(AttemptStatus, native_enum=False, length=32),
        default=AttemptStatus.IN_PROGRESS,
        nullable=False,
        index=True
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Persisted Scores (Computed upon submission via scoring engine)
    total_score: Mapped[Optional[float]] = mapped_column(Numeric(6, 2), nullable=True)
    varc_score: Mapped[Optional[float]] = mapped_column(Numeric(6, 2), nullable=True)
    dilr_score: Mapped[Optional[float]] = mapped_column(Numeric(6, 2), nullable=True)
    qa_score: Mapped[Optional[float]] = mapped_column(Numeric(6, 2), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="test_attempts", lazy="selectin")
    question_attempts: Mapped[List["QuestionAttempt"]] = relationship(
        "QuestionAttempt",
        back_populates="test_attempt",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    performance_metrics: Mapped[List["PerformanceMetric"]] = relationship(
        "PerformanceMetric",
        back_populates="test_attempt",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class QuestionAttempt(Base):
    __tablename__ = "question_attempts"
    __table_args__ = (
        UniqueConstraint("test_attempt_id", "question_id", name="uq_attempt_question"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_attempt_id: Mapped[str] = mapped_column(String(36), ForeignKey("test_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[str] = mapped_column(String(36), ForeignKey("questions.id", ondelete="RESTRICT"), nullable=False, index=True)
    selected_option_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("question_options.id", ondelete="SET NULL"), nullable=True)
    tita_answer_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    palette_state: Mapped[PaletteState] = mapped_column(
        Enum(PaletteState, native_enum=False, length=32),
        default=PaletteState.NOT_VISITED,
        nullable=False
    )
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    marks_awarded: Mapped[Optional[float]] = mapped_column(Numeric(4, 2), nullable=True)
    reflection_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Relationships
    test_attempt: Mapped["TestAttempt"] = relationship("TestAttempt", back_populates="question_attempts", lazy="selectin")
    question: Mapped["Question"] = relationship("Question", lazy="selectin")
    selected_option: Mapped[Optional["QuestionOption"]] = relationship("QuestionOption", lazy="selectin")
