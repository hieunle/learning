"""Database connection and session management."""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from supabase import create_client, Client
from app.core.config import settings

# Supabase client
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_key
)

# SQLAlchemy setup for direct database access
# Extract connection details from Supabase URL
# Format: postgresql://[user[:password]@][host][:port][/dbname]
database_url = settings.supabase_url.replace("https://", "").split(".")[0]
SQLALCHEMY_DATABASE_URL = f"postgresql://postgres:[password]@db.{database_url}.supabase.co:5432/postgres"

# Note: In production, use proper connection string from Supabase settings
# For now, we'll primarily use the Supabase client

Base = declarative_base()


def get_supabase() -> Client:
    """Get Supabase client instance."""
    return supabase


