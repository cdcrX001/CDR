from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    PROJECT_NAME: str = "FastAPI Supabase Auth"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # JWT Settings
    JWT_TOKEN_PREFIX: str = "Bearer"
    
    class Config:
        env_file = ".env"

settings = Settings()
