"""Helpdesk agent implementation using Agno."""
from typing import Dict, Any, List, Optional, AsyncIterator
from uuid import uuid4
import json
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import tool
from app.core.config import settings
from app.core.database import get_supabase, get_agent_db
from app.core.knowledge_base import get_knowledge_base
from app.agents.tools import lookup_price

# Singleton agent instance
_agent_instance: Optional[Agent] = None


@tool
def price_lookup_tool(
    service_type: str,
    postcode: str,
    area_size: Optional[float] = None,
    item_count: Optional[int] = None
) -> str:
    """
    Look up pricing for Electrodry services.
    
    Args:
        service_type: Type of service (carpet_cleaning, upholstery_cleaning, tile_cleaning)
        postcode: Customer's postcode
        area_size: Area size in square meters (optional)
        item_count: Number of items (optional)
    
    Returns:
        JSON string with pricing information
    """
    result = lookup_price(service_type, postcode, area_size, item_count)
    return json.dumps(result, indent=2)


def create_helpdesk_agent() -> Agent:
    """Create and configure the Agno agent with proper settings."""
    
    # Get shared database instance for agent sessions
    db = get_agent_db()
    
    # Get knowledge base
    knowledge = get_knowledge_base()
    
    # Create agent with OpenAI (via OpenRouter if needed, or direct OpenAI)
    agent = Agent(
        id="helpdesk-assistant",  # Required for AgentOS compatibility
        name="Electrodry Helpdesk Assistant",
        model=OpenAIChat(
            id=settings.openrouter_model,
            api_key=settings.openrouter_api_key,
            base_url=settings.openrouter_base_url if hasattr(settings, 'openrouter_base_url') else None
        ),
        knowledge=knowledge,
        search_knowledge=True,  # Enable agentic RAG
        db=db,  # Fixed: use 'db' instead of 'storage'
        add_history_to_context=True,  # Fixed: correct parameter name
        num_history_runs=5,  # Include last 5 conversation turns for context
        # # Session state for tracking user context
        session_state={
            "user_preferences": {},
            "recent_topics": [],
            "service_history": []
        },
        # add_session_state_to_context=True,  # Make session state available to agent
        # enable_agentic_state=True,  # Allow agent to update session state automatically
        tools=[price_lookup_tool],
        instructions=[
            "You are a helpful customer service assistant for Electrodry, a professional cleaning company.",
            "Always be polite, professional, and maintain the Electrodry brand voice.",
            "Always search your knowledge base before answering questions.",
            "Always cite sources when providing information from the knowledge base.",
            "For pricing inquiries, use the price_lookup_tool to provide accurate quotes.",
            "If service is not available in a customer's region, politely explain and suggest alternatives.",
            "Never make up pricing information - always use the tool.",
            "Be concise but thorough in your responses.",
            "Include sources in your response.",
            "Track important user information in session state for personalized service.",
            "Remember user preferences and context across the conversation.",
        ],
        markdown=True,
        # enable_session_summaries=True
    )
    
    return agent


def get_helpdesk_agent() -> Agent:
    """Get or create the singleton helpdesk agent instance."""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = create_helpdesk_agent()
    return _agent_instance
