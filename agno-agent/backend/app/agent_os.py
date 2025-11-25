"""AgentOS setup for production-ready agent runtime."""
from agno.os import AgentOS
from app.agents.helpdesk import get_helpdesk_agent
from app.agents.assistant import get_assistant_agent
from app.core.knowledge_base import get_knowledge_base


def create_agent_os() -> AgentOS:
    """
    Create and configure AgentOS with helpdesk agent.
    
    AgentOS provides:
    - Built-in session management APIs
    - Knowledge management endpoints
    - Production-ready monitoring
    - Horizontal scalability
    """
    
    # Get agents and knowledge
    helpdesk_agent = get_helpdesk_agent()
    assistant_agent = get_assistant_agent()
    knowledge = get_knowledge_base()
    
    # Create AgentOS
    agent_os = AgentOS(
        description="Electrodry AI Helpdesk - Production Runtime",
        agents=[helpdesk_agent, assistant_agent],
        knowledge=[knowledge],
    )
    
    return agent_os


# Create the AgentOS instance
agent_os = create_agent_os()

# Get the FastAPI app
app = agent_os.get_app()

