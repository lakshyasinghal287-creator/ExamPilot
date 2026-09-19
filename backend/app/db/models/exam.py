"""
SQLAlchemy 2.0 Models: Exam, Section, Topic, and SubTopic.
Represents the hierarchical exam syllabus and timing taxonomy.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    total_duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=120)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False, default=66)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    sections: Mapped[List["Section"]] = relationship(
        "Section",
        back_populates="exam",
        cascade="all, delete-orphan",
        order_by="Section.sequence_order",
        lazy="selectin"
    )


class Section(Base):
    __tablename__ = "sections"
    __table_args__ = (
        UniqueConstraint("exam_id", "sequence_order", name="uq_exam_section_sequence"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(32), nullable=False)  # e.g., VARC, DILR, QA
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=40)
    target_question_count: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    exam: Mapped["Exam"] = relationship("Exam", back_populates="sections", lazy="selectin")
    topics: Mapped[List["Topic"]] = relationship("Topic", back_populates="section", cascade="all, delete-orphan", lazy="selectin")


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    section_id: Mapped[str] = mapped_column(String(36), ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # e.g., QA-ARITHMETIC
    name: Mapped[str] = mapped_column(String(128), nullable=False)

    # Relationships
    section: Mapped["Section"] = relationship("Section", back_populates="topics", lazy="selectin")
    subtopics: Mapped[List["SubTopic"]] = relationship("SubTopic", back_populates="topic", cascade="all, delete-orphan", lazy="selectin")


class SubTopic(Base):
    __tablename__ = "subtopics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id: Mapped[str] = mapped_column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # e.g., QA-NUM-REMAINDERS
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    weightage_percent: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)

    # Relationships
    topic: Mapped["Topic"] = relationship("Topic", back_populates="subtopics")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="subtopic")
