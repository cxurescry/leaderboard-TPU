import os
from dotenv import load_dotenv

load_dotenv()

class Settings:

    # Database settings

    DB_USER           = os.getenv("DB_USER")
    DB_HOST           = os.getenv("DB_HOST")
    DB_NAME           = os.getenv("DB_NAME")
    DB_PASSWORD       = os.getenv("DB_PASSWORD")
    DB_PORT           = os.getenv("DB_PORT")
    
    # TPU OAuth Settings

    TPU_CLIENT_ID     = os.getenv("TPU_CLIENT_ID", "your_client_id")
    TPU_CLIENT_SECRET = os.getenv("TPU_CLIENT_SECRET", "your_client_secret")
    TPU_API_KEY       = os.getenv("TPU_API_KEY", "your_api_key")
    
    TPU_AUTH_URL      = "https://oauth.tpu.ru/authorize"
    TPU_TOKEN_URL     = "https://oauth.tpu.ru/access_token"
    TPU_USER_INFO_URL = "https://api.tpu.ru/v2/auth/user"
    TPU_LOGOUT_URL    = "https://oauth.tpu.ru/auth/logout"
    
    SECRET_KEY        = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    TPU_REDIRECT_URI  = "http://localhost:8000/auth/callback"

settings = Settings()
