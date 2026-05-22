from fastapi import APIRouter, Depends
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/me")
async def get_current_user(current_user = Depends(get_current_user)):
    """Get current authenticated user information."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.user_metadata.get("full_name") if current_user.user_metadata else None,
        "avatar_url": current_user.user_metadata.get("avatar_url") if current_user.user_metadata else None,
    }
