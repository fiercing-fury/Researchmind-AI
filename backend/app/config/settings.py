import os
from dotenv import load_dotenv

load_dotenv()


class Settings:

    APP_NAME = os.getenv(
        "APP_NAME",
        "ResearchMind AI"
    )

    APP_VERSION = os.getenv(
        "APP_VERSION",
        "1.0.0"
    )

    DEBUG = os.getenv(
        "DEBUG",
        "True"
    )

    HOST = os.getenv(
        "HOST",
        "127.0.0.1"
    )

    PORT = int(
        os.getenv(
            "PORT",
            8000
        )
    )

    DATABASE_URL = os.getenv(
        "DATABASE_URL"
    )

    OPENAI_API_KEY = os.getenv(
        "OPENAI_API_KEY"
    )

    GEMINI_API_KEY = os.getenv(
        "GEMINI_API_KEY"
    )


settings = Settings()