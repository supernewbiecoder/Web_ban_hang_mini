import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    APP_NAME = os.getenv("APP_NAME", "mini_ecommerce_website")
    APP_ENV = os.getenv("APP_ENV", "development")
    DEBUG = os.getenv("DEBUG") == "True"

    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", 8000))

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")

    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "web_ban_hang_mini")

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",")

    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    EXPIRATION_JWT = 3600
