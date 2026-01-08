from .database_manager import database, USE_API_CLIENT

# Импортируем USE_SUPABASE из database_manager
import os
USE_SUPABASE = os.getenv("USE_SUPABASE", "false").lower() == "true"

__all__ = ["database", "USE_API_CLIENT", "USE_SUPABASE"]