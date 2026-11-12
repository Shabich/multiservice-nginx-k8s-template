from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://app:app@localhost:5432/app"
    root_path: str = "/api/py"


settings = Settings()
