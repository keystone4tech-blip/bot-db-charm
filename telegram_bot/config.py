import os
from dotenv import load_dotenv

load_dotenv()

# Bot settings
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
BOT_USERNAME = os.getenv('BOT_USERNAME', 'your_bot_username')

# Backend API
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:3000/api')
API_TIMEOUT = 30

# Admin
ADMIN_ID = int(os.getenv('ADMIN_ID', 0))
ADMIN_IDS = [int(id) for id in os.getenv('ADMIN_IDS', str(ADMIN_ID)).split(',') if id.strip()]

# Logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Database (если нужна локальная БД)
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 5432))
DB_NAME = os.getenv('DB_NAME', 'keystone')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD')
