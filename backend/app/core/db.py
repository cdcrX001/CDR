from supabase import create_client, Client
from .config import settings
from functools import lru_cache

@lru_cache()
def get_supabase() -> Client:
    """
    Create and cache Supabase client instance.
    Uses environment variables for configuration.
    """
    supabase: Client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY
    )
    return supabase

def get_user_by_token(token: str):
    """
    Get user details from Supabase using JWT token.
    """
    try:
        supabase = get_supabase()
        return supabase.auth.get_user(token)
    except Exception as e:
        return None
