from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.repositories.profile_repository import ProfileRepository

router = APIRouter()


@router.get("/me")
async def get_current_user_profile(current_user = Depends(get_current_user)):
    """Get current user's profile information."""
    profile_repo = ProfileRepository()
    profile = profile_repo.get_profile(str(current_user.id))
    if not profile:
        return {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.user_metadata.get("full_name") if current_user.user_metadata else None,
            "avatar_url": current_user.user_metadata.get("avatar_url") if current_user.user_metadata else None,
        }
    return profile


@router.get("/history")
async def get_user_history(current_user = Depends(get_current_user)):
    """Get all past analyses for the current user, ordered by newest first."""
    profile_repo = ProfileRepository()
    analyses = profile_repo.get_user_history(str(current_user.id))
    return analyses if analyses else []
