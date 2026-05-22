from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    OPENROUTER_API_KEY: str
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # Pydantic v2 config to load from the .env file
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

@lru_cache()
def get_settings() -> Settings:
    """
    Creates and caches a Settings instance. 
    lru_cache ensures we only read the .env file once.
    """
    return Settings()