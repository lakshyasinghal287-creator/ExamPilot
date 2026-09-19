"""
SQLAlchemy 2.0 Declarative Base.
Provides shared metadata and base class for all relational models.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy 2.0 mapped entity models.
    """
    pass
