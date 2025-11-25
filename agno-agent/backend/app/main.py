"""Main FastAPI application entry point with AgentOS integration."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.agent_os import agent_os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown."""
    # Startup
    logger.info("=" * 60)
    logger.info("🚀 Electrodry AI Helpdesk API Starting")
    logger.info("=" * 60)
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Frontend URL: {settings.frontend_url}")
    logger.info(f"Backend URL: {settings.backend_url}")
    logger.info("AgentOS Features Enabled:")
    logger.info("  ✓ Session Management")
    logger.info("  ✓ Knowledge Management")
    logger.info("  ✓ Agent Runs API")
    logger.info("  ✓ Production Monitoring")
    logger.info("=" * 60)
    
    yield
    
    # Shutdown
    logger.info("Shutting down Electrodry AI Helpdesk API")


# Option 1: Use AgentOS app as base (RECOMMENDED for production)
# This gives you all AgentOS built-in endpoints + custom routes
app = agent_os.get_app()

# Update app metadata
app.title = "Electrodry AI Helpdesk API"
app.description = "AI-powered helpdesk with RAG-based knowledge retrieval, powered by AgentOS"
app.version = "0.1.0"

# Add lifespan handler
app.router.lifespan_context = lifespan

# Option 2: Use custom FastAPI app and manually integrate (if you need more control)
# Uncomment below if you prefer custom app
# app = FastAPI(
#     title="Electrodry AI Helpdesk API",
#     description="AI-powered helpdesk with RAG-based knowledge retrieval",
#     version="0.1.0",
#     docs_url="/api/docs",
#     redoc_url="/api/redoc",
#     openapi_url="/api/openapi.json"
# )

# Configure CORS - Allow Agno Control Plane URLs
cors_origins = [
    settings.frontend_url,
    "http://localhost:3000",
    "http://localhost:3001",
    "https://os.agno.com",
    "https://os-stg.agno.com",
    "https://app.agno.com",
    "https://agno.com",
    "https://www.agno.com",
]

logger.info(f"Configuring CORS for origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

logger.info("Application initialized with AgentOS")
logger.info(f"AgentOS provides built-in endpoints at /v1/")
logger.info(f"Custom endpoints available at /api/v1/")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Electrodry AI Helpdesk API",
        "version": "0.1.0",
        "powered_by": "AgentOS",
        "endpoints": {
            "agno_built_in_api": "/v1/",
            "docs": "/docs",
            "agent_os_ui": "https://os.agno.com"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint for AgentOS control plane."""
    return {
        "status": "healthy",
        "service": "electrodry-ai-helpdesk",
        "version": "0.1.0",
        "agent_os": "ready"
    }


if __name__ == "__main__":
    agent_os.serve(app="app.main:app", host="0.0.0.0", port=8000, reload=True)


