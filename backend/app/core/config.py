from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import urllib.parse


class Settings(BaseSettings):
    """Application settings loaded strictly from environment variables."""
    
    # Database connection parameters
    user: str = "postgres"
    password: Optional[str] = None
    host: str = "localhost"
    port: int = 5432
    dbname: str = "postgres"
    
    raw_database_url: Optional[str] = None
    
    # Supabase Credentials
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    
    # Razorpay Credentials
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    razorpay_webhook_secret: Optional[str] = None
    
    # App Config & CORS
    app_name: str = "Donation Management System"
    debug: bool = True
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    @property
    def database_url(self) -> str:
        if self.raw_database_url and "YOUR_PROJECT_REF" not in self.raw_database_url:
            return self.raw_database_url
        pwd = urllib.parse.quote_plus(self.password) if self.password else ""
        return f"postgresql+asyncpg://{self.user}:{pwd}@{self.host}:{self.port}/{self.dbname}"

    @property
    def sync_database_url(self) -> str:
        pwd = urllib.parse.quote_plus(self.password) if self.password else ""
        return f"postgresql+psycopg2://{self.user}:{pwd}@{self.host}:{self.port}/{self.dbname}"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()
