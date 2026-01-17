from .database_manager import database, USE_API_CLIENT

# Импортируем переменные из database_manager
import os
USE_SUPABASE = os.getenv("USE_SUPABASE", "false").lower() == "true"
USE_DB_API = os.getenv("USE_DB_API", "false").lower() == "true"
USE_SQLITE = os.getenv("USE_SQLITE", "false").lower() == "true"

__all__ = ["database", "USE_API_CLIENT", "USE_SUPABASE", "USE_DB_API", "USE_SQLITE"]