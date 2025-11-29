"""Database connection and session management.

Architecture:
- Supabase: Used ONLY for user authentication (Supabase Auth)
- PgVector: Local PostgreSQL with pgvector for vector embeddings and knowledge base
"""
from typing import Optional
from supabase import create_client, Client
from agno.db.postgres import PostgresDb
from app.core.config import settings

# Supabase client for authentication only
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_key
)

# Singleton PostgresDb instance for agent sessions
_agent_db_instance: Optional[PostgresDb] = None


def get_supabase() -> Client:
    """Get Supabase client instance for authentication."""
    return supabase


def get_agent_db() -> PostgresDb:
    """
    Get or create the shared PostgresDb instance for agent sessions.
    Uses local pgvector database.
    
    This ensures all agents share the same database connection pool
    and session table for better resource management.
    """
    global _agent_db_instance
    if _agent_db_instance is None:
        _agent_db_instance = PostgresDb(
            db_url=settings.pgvector_db_url,
            session_table="agent_sessions"
        )
    return _agent_db_instance


