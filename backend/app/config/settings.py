import os
from dotenv import load_dotenv

load_dotenv()


def parse_bool(value: str) -> bool:
    return value.lower() in {"1", "true", "yes", "on"}


def parse_csv(value: str) -> list[str]:
    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


class Settings:

    APP_NAME = os.getenv(
        "APP_NAME",
        "ResearchMind AI"
    )

    APP_VERSION = os.getenv(
        "APP_VERSION",
        "1.0.0"
    )

    DEBUG = parse_bool(
        os.getenv(
            "DEBUG",
            "True"
        )
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

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "researchmind_secret_key"
    )

    CORS_ORIGINS = parse_csv(
        os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173"
        )
    )


settings = Settings()
