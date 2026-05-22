from fastapi import APIRouter
from app.api.v1.endpoints import analysis, profile, auth

api_router = APIRouter()

# Register endpoints
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])