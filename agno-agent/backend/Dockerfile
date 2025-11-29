# Production-ready Dockerfile for AgentOS Backend
# Based on Agno best practices: https://docs.agno.com/deploy/overview

# Use official Agno Python base image with Python 3.12
FROM agnohq/python:3.12

# Set environment variables for production
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    # Prevents Python from creating .pyc files
    PYTHONHASHSEED=random \
    # pip:
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy dependency files first (for better layer caching)
COPY pyproject.toml ./

# Generate requirements.txt from pyproject.toml for UV
# UV is used for faster dependency installation
RUN pip install uv && \
    uv pip compile pyproject.toml -o requirements.txt && \
    uv pip sync requirements.txt --system

# Copy application code
COPY --chown=appuser:appuser . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/data && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health', timeout=5.0)" || exit 1

# Expose application port
EXPOSE 8000

# Set the entry point to use uvicorn with production settings
# - host 0.0.0.0 to accept connections from outside the container
# - port 8000 (standard web port)
# - workers: use multiple worker processes for production (default: 1, recommended: 2*CPU+1)
# - no reload in production for stability
CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "4", \
     "--log-level", "info", \
     "--access-log", \
     "--proxy-headers", \
     "--forwarded-allow-ips", "*"]

