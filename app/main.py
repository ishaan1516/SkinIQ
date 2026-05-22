from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.config import get_settings

settings = get_settings()

def create_app() -> FastAPI:
    app = FastAPI(
        title="SkinIQ Enterprise API",
        version="1.0.0",
        description="AI-Powered Skin Intelligence Platform API"
    )

    # Configure CORS for local development and future Vercel deployment
    allowed_origins = [
        "http://localhost:5173",  # Standard Vite React port
        "http://localhost:3000"
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount the v1 API routes
    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health", tags=["System"])
    async def health_check():
        """Public health check endpoint for monitoring."""
        return {"status": "healthy", "environment": settings.ENVIRONMENT}

    return app

app = create_app()