# AgentOS Backend - Production Deployment Guide

This guide provides instructions for deploying the AgentOS backend to production using Docker.

## Overview

The Dockerfile is based on [Agno's official deployment recommendations](https://docs.agno.com/deploy/overview) and includes:

- **Base Image**: `agnohq/python:3.12` - Official Agno Python image
- **Dependency Management**: UV for fast dependency installation
- **Security**: Non-root user execution
- **Health Checks**: Built-in health monitoring
- **Production Settings**: Optimized uvicorn configuration with multiple workers

## Quick Start

### Local Testing with Docker Compose

1. **Set up environment variables**:
   ```bash
   # Copy and configure your .env file
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Build and run with Docker Compose**:
   ```bash
   cd backend
   docker-compose up --build
   ```

3. **Access the API**:
   - API: http://localhost:8000
   - Health Check: http://localhost:8000/health
   - API Docs: http://localhost:8000/docs

### Building the Production Image

```bash
# Build the Docker image
docker build -t agno-agent-backend:latest .

# Test the image locally
docker run -p 8000:8000 \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY \
  -e PGVECTOR_DB_URL=$PGVECTOR_DB_URL \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e OPENROUTER_API_KEY=$OPENROUTER_API_KEY \
  agno-agent-backend:latest
```

## Production Deployment Options

### Option 1: Cloud Run (Google Cloud)

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/agno-agent-backend

# Deploy to Cloud Run
gcloud run deploy agno-agent-backend \
  --image gcr.io/PROJECT_ID/agno-agent-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars="ENVIRONMENT=production" \
  --set-env-vars="SUPABASE_URL=$SUPABASE_URL" \
  --set-env-vars="SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY" \
  --set-env-vars="OPENAI_API_KEY=$OPENAI_API_KEY" \
  --allow-unauthenticated
```

### Option 2: AWS ECS

See [Agno's Agent Infra AWS template](https://docs.agno.com/templates/agent-infra-aws) for AWS-optimized deployment.

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag agno-agent-backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agno-agent-backend:latest

docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/agno-agent-backend:latest

# Deploy via ECS (configure task definition with environment variables)
```

### Option 3: Railway

See [Agno's Railway template](https://docs.agno.com/templates/agent-infra-railway) for Railway deployment.

Railway will:
- Automatically detect and build your Dockerfile
- Manage environment variables through their dashboard
- Provide a public HTTPS domain automatically

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 4: DigitalOcean App Platform

```bash
# Use DigitalOcean's App Platform via web interface or CLI
# The platform will automatically detect the Dockerfile
doctl apps create --spec .do/app.yaml
```

### Option 5: Render

Deploy via Render's web interface:
1. Connect your repository
2. Render will auto-detect the Dockerfile
3. Add environment variables through Render's dashboard
4. Deploy

## Environment Variables

Required environment variables for production:

```env
# Application
ENVIRONMENT=production
BACKEND_URL=https://your-backend-url.com
FRONTEND_URL=https://your-frontend-url.com

# Supabase (Authentication Only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# PgVector Database (Vector DB & Knowledge Base)
PGVECTOR_DB_URL=postgresql+psycopg://ai:ai@localhost:5532/ai

# OpenAI
OPENAI_API_KEY=your-openai-key

# OpenRouter
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=google/gemini-2.5-flash
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Database
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10

# Embeddings
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

## Docker Configuration Details

### Dockerfile Features

1. **Base Image**: Uses `agnohq/python:3.12` for compatibility with Agno
2. **UV Package Manager**: Fast dependency installation
3. **Non-root User**: Runs as `appuser` for security
4. **Health Check**: Monitors `/health` endpoint every 30 seconds
5. **Multi-worker**: Configured with 4 workers for production load
6. **Optimized Caching**: Copies dependencies before code for better layer caching

### Performance Tuning

Adjust the number of workers based on your instance:

```dockerfile
# Formula: (2 x CPU cores) + 1
# For 2 CPU cores: 5 workers
# For 4 CPU cores: 9 workers

CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "4", \  # Adjust this
     "--log-level", "info"]
```

## Monitoring and Observability

### Health Checks

The API includes a health check endpoint at `/health`:

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "electrodry-ai-helpdesk",
  "version": "0.1.0",
  "agent_os": "ready"
}
```

### Logs

Access logs in production:

```bash
# Docker Compose
docker-compose logs -f backend

# Docker
docker logs -f container-name

# Cloud platforms usually provide built-in log viewers
```

### AgentOS Control Plane

Monitor your agents through the [Agno Control Plane](https://os.agno.com):

- Session analytics
- Agent performance metrics
- Knowledge base statistics
- Production monitoring

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs container-name

# Verify environment variables
docker exec container-name env

# Test health endpoint
curl http://localhost:8000/health
```

### Database Connection Issues

```bash
# Verify Supabase connection
docker exec -it container-name python -c "
from app.core.config import settings
print(f'Supabase URL: {settings.supabase_url}')
"
```

### Performance Issues

1. Increase worker count for more CPU cores
2. Scale horizontally with load balancer
3. Monitor memory usage and adjust container resources
4. Check database connection pool settings

## Security Best Practices

1. **Never commit secrets**: Use environment variables or secret managers
2. **Use non-root user**: Already configured in Dockerfile
3. **Keep dependencies updated**: Regularly rebuild images with latest packages
4. **Enable HTTPS**: Use reverse proxy (Nginx, Caddy) or cloud provider's HTTPS
5. **Restrict CORS**: Update `app/main.py` with production frontend URLs only

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker Image
        run: |
          cd backend
          docker build -t agno-agent-backend:${{ github.sha }} .
      
      - name: Push to Registry
        run: |
          # Push to your container registry
          docker tag agno-agent-backend:${{ github.sha }} your-registry/agno-agent-backend:latest
          docker push your-registry/agno-agent-backend:latest
      
      - name: Deploy
        run: |
          # Deploy to your platform
          # (Platform-specific deployment commands)
```

## Additional Resources

- [Agno Deployment Docs](https://docs.agno.com/deploy/overview)
- [Agno Docker Template](https://docs.agno.com/templates/agent-infra-docker)
- [AgentOS Control Plane](https://os.agno.com)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)

## Support

For issues or questions:
- Check [Agno Documentation](https://docs.agno.com)
- Visit [Agno Community](https://community.agno.com)
- Review application logs for error details

