"""
SQLAlchemy 2.0 Models: Question and QuestionOption.
Represents persistent test items in the reusable question bank.
"""

import uuid
import enum
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, JSON, UniqueConstraint, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class QuestionType(str, enum.Enum):
    MCQ = "MCQ"
    TITA = "TITA"


class ValidationStatus(str, enum.Enum):
    PENDING_VALIDATION = "PENDING_VALIDATION"
    VALIDATED = "VALIDATED"
    REJECTED = "REJECTED"


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subtopic_id: Mapped[str] = mapped_column(String(36), ForeignKey("subtopics.id", ondelete="RESTRICT"), nullable=False, index=True)
    question_type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType, native_enum=False, length=16),
        nullable=False,
        default=QuestionType.MCQ
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty_level: Mapped[int] = mapped_column(Integer, nullable=False, default=3, index=True)
    validation_status: Mapped[ValidationStatus] = mapped_column(
        Enum(ValidationStatus, native_enum=False, length=32),
        nullable=False,
        default=ValidationStatus.PENDING_VALIDATION,
        index=True
    )
    verification_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    times_attempted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    times_correct: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    subtopic: Mapped["SubTopic"] = relationship("SubTopic", back_populates="questions", lazy="selectin")
    options: Mapped[List["QuestionOption"]] = relationship(
        "QuestionOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.option_key",
        lazy="selectin"
    )


class QuestionOption(Base):
    __tablename__ = "question_options"
    __table_args__ = (
        UniqueConstraint("question_id", "option_key", name="uq_question_option_key"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id: Mapped[str] = mapped_column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_key: Mapped[str] = mapped_column(String(4), nullable=False)  # "A", "B", "C", "D"
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    question: Mapped["Question"] = relationship("Question", back_populates="options")
