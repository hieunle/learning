"""Application configuration settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow"
    )
    
    # Supabase Configuration (Authentication Only)
    supabase_url: str
    supabase_service_key: str
    
    # PgVector Database Configuration (Vector DB & Knowledge Base)
    pgvector_db_url: str  # Local PostgreSQL with pgvector extension
    
    # OpenAI Configuration
    openai_api_key: str
    
    # OpenRouter Configuration
    openrouter_api_key: str
    openrouter_model: str = "google/gemini-2.5-flash"
    openrouter_base_url: Optional[str] = "https://openrouter.ai/api/v1"
    
    # Backend Configuration
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    
    # Environment
    environment: str = "development"
    
    # Database
    database_pool_size: int = 5
    database_max_overflow: int = 10
    
    # Embedding Configuration
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    chunk_size: int = 1000
    chunk_overlap: int = 200


# Global settings instance
settings = Settings()

