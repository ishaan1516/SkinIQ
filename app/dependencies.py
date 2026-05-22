from fastapi import Depends, HTTPException, Header
from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

async def get_current_user(authorization: str = Header(None)):
    """
    Dependency to extract and validate the JWT token from the Authorization header.
    Returns the Supabase user object if valid, otherwise throws a 401.
    """
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Not authenticated. Bearer token missing.')
    
    token = authorization.split(' ')[1]
    
    try:
        # Supabase validates the JWT and fetches the user securely
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
             raise HTTPException(status_code=401, detail='Invalid token.')
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail='Invalid or expired token.')