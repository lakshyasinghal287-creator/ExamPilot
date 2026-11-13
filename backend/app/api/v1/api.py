"""
Master API Router for v1 Endpoints.
Aggregates tests, questions, and analytics sub-routers.
"""

from fastapi import APIRouter
from backend.app.api.v1.tests import router as tests_router
from backend.app.api.v1.questions import router as questions_router
from backend.app.api.v1.analytics import router as analytics_router

api_router = APIRouter()
api_router.include_router(tests_router)
api_router.include_router(questions_router)
api_router.include_router(analytics_router)
