"""Simple general assistant agent implementation using Agno."""
from typing import Optional
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.db.postgres import PostgresDb
from app.core.config import settings
from app.core.knowledge_base import get_knowledge_base

# Singleton agent instance
_agent_instance: Optional[Agent] = None


def create_assistant_agent() -> Agent:
    """Create and configure a simple general assistant agent."""
    
    # Initialize database for agent sessions
    db = PostgresDb(
        db_url=settings.supabase_db_url,
        session_table="agent_sessions"
    )
    knowledge = get_knowledge_base()
    # Create agent with OpenAI
    agent = Agent(
        id="general-assistant",  # Required for AgentOS compatibility
        name="General AI Assistant",
        model=OpenAIChat(
            id=settings.openrouter_model,
            api_key=settings.openrouter_api_key,
            base_url=settings.openrouter_base_url if hasattr(settings, 'openrouter_base_url') else None
        ),
        db=db,
        knowledge=knowledge,
        search_knowledge=True,
        add_history_to_context=True,
        num_history_runs=5,  # Include last 5 conversation turns for context
        instructions=[
            "You are a helpful AI assistant that can answer any question the user wants.",
            "Always be polite, clear, and informative in your responses.",
            "If you don't know something, be honest about it.",
            "Provide accurate and helpful information to the best of your ability.",
        ],
        markdown=True,
        enable_session_summaries=True
    )
    
    return agent


def get_assistant_agent() -> Agent:
    """Get or create the singleton assistant agent instance."""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = create_assistant_agent()
    return _agent_instance

