"""
ExamPilot: FastAPI Application Entrypoint.
Initializes the ASGI server, configures CORS middleware, mounts REST routes,
and exposes Swagger / OpenAPI interactive documentation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.api.v1.api import api_router


def create_application() -> FastAPI:
    """Application factory for ExamPilot backend."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="AI-Powered CAT Mock Test Engine, Question Bank, and Deterministic Validator",
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Configure CORS for local frontend development (React Vite: 5173, 3000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check endpoint
    @app.get(f"{settings.API_V1_STR}/health", tags=["System"])
    async def health_check():
        return {
            "status": "healthy",
            "app_name": settings.APP_NAME,
            "environment": settings.ENVIRONMENT
        }

    # Mount v1 REST API
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_application()
