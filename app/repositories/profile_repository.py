from app.repositories.base import BaseRepository
from app.core.exceptions import SkinIQException

class ProfileRepository(BaseRepository):
    def get_profile(self, user_id: str) -> dict:
        """Fetches the user's basic profile."""
        try:
            response = self.supabase.table("profiles").select("*").eq("id", user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise SkinIQException(status_code=500, detail=f"Database error fetching profile: {str(e)}")
            
    def get_user_history(self, user_id: str) -> list:
        """Fetches all past analyses for the user, ordered by newest first."""
        try:
            response = self.supabase.table("analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            raise SkinIQException(status_code=500, detail=f"Database error fetching history: {str(e)}")