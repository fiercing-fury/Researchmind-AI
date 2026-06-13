from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool

    HOST: str
    PORT: int

    OPENAI_API_KEY: str
    DATABASE_URL: str

    class Config:
        env_file = ".env"


settings = Settings()