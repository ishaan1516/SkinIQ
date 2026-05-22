from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

class BaseRepository:
    def __init__(self):
        # Initialize the Supabase client
        self.supabase: Client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY
        )