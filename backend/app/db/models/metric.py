"""
SQLAlchemy 2.0 Models: PerformanceMetric and Recommendation.
Represents analytical aggregates and explainable adaptive remediation plans.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_attempt_id: Mapped[str] = mapped_column(String(36), ForeignKey("test_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id: Mapped[str] = mapped_column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    accuracy_percentage: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    questions_attempted: Mapped[int] = mapped_column(Integer, nullable=False)
    questions_correct: Mapped[int] = mapped_column(Integer, nullable=False)
    avg_time_spent_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    speed_accuracy_quadrant: Mapped[str] = mapped_column(String(32), nullable=False)

    # Relationships
    test_attempt: Mapped["TestAttempt"] = relationship("TestAttempt", back_populates="performance_metrics")
    topic: Mapped["Topic"] = relationship("Topic")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_subtopic_id: Mapped[str] = mapped_column(String(36), ForeignKey("subtopics.id", ondelete="CASCADE"), nullable=False, index=True)
    priority_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    rationale_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="recommendations")
    target_subtopic: Mapped["SubTopic"] = relationship("SubTopic")
