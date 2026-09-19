"""
Asynchronous Database Engine and Session Management.
Supports both local SQLite WAL mode and production PostgreSQL.
"""

import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from backend.app.core.config import settings


def _prepare_sqlite_directory(url: str) -> None:
    """Ensures local directory exists if using SQLite file storage."""
    if url.startswith("sqlite+aiosqlite:///"):
        file_path = url.replace("sqlite+aiosqlite:///", "")
        if file_path != ":memory:":
            dir_name = os.path.dirname(file_path)
            if dir_name:
                os.makedirs(dir_name, exist_ok=True)


_prepare_sqlite_directory(settings.DATABASE_URL)

# Create asynchronous engine
engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding an asynchronous database session.
    Automatically closes session upon request completion.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
