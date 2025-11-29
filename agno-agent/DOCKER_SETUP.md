# Docker Setup Guide

This guide explains how to run the Electrodry AI Helpdesk using Docker Compose.

## 🐳 Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

## 📋 Quick Start

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd agno-agent
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration (Authentication)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# API Keys
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...

# Frontend Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Configure Backend Environment

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with the same values as above, plus:

```env
# Database (automatically configured for Docker)
PGVECTOR_DB_URL=postgresql+psycopg://ai:ai@pgvector:5432/ai

# Backend configuration
BACKEND_URL=http://backend:8000
FRONTEND_URL=http://frontend:3000
ENVIRONMENT=docker
```

### 4. Start All Services

```bash
# Return to project root
cd ..

# Start all services (pgvector, backend, frontend)
docker-compose up --build
```

Or run in detached mode:

```bash
docker-compose up --build -d
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PgVector Database**: localhost:5532

## 🏗️ Architecture

The Docker setup includes three services:

### 1. PgVector Database
- **Image**: `agnohq/pgvector:16`
- **Purpose**: Vector database for embeddings and knowledge base
- **Port**: 5532 (mapped to internal 5432)
- **Volume**: `agno_pgvector_data` (persistent storage)
- **Credentials**: 
  - User: `ai`
  - Password: `ai`
  - Database: `ai`

### 2. Backend (FastAPI + Agno)
- **Build**: From `./backend/Dockerfile`
- **Port**: 8000
- **Dependencies**: pgvector (with health check)
- **Features**:
  - AgentOS integration
  - Automatic RAG
  - Knowledge base management
  - 4 worker processes

### 3. Frontend (Next.js)
- **Build**: From `./frontend/Dockerfile`
- **Port**: 3000
- **Dependencies**: backend (with health check)
- **Features**:
  - Server-side rendering
  - Static optimization
  - Production build

## 🔧 Docker Commands

### Start Services
```bash
# Start all services
docker-compose up

# Start with rebuild
docker-compose up --build

# Start in background
docker-compose up -d
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f pgvector
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Execute Commands in Containers
```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh

# Database shell
docker-compose exec pgvector psql -U ai -d ai
```

## 🗄️ Database Management

### Access Database
```bash
# Using docker-compose
docker-compose exec pgvector psql -U ai -d ai

# Using external client (localhost:5532)
psql -h localhost -p 5532 -U ai -d ai
```

### Run Migrations
```bash
# Execute SQL migration file
docker-compose exec pgvector psql -U ai -d ai -f /path/to/migration.sql
```

### Backup Database
```bash
# Create backup
docker-compose exec pgvector pg_dump -U ai -d ai > backup.sql

# Restore backup
docker-compose exec -T pgvector psql -U ai -d ai < backup.sql
```

### Reset Database
```bash
# Stop services
docker-compose down

# Remove volume
docker volume rm agno_pgvector_data

# Start fresh
docker-compose up --build
```

## 🔍 Health Checks

### Backend Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-29T..."
}
```

### Database Health Check
```bash
docker-compose exec pgvector pg_isready -U ai -d ai
```

### View Service Status
```bash
docker-compose ps
```

## 🐛 Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
docker-compose logs backend
```

**Common issues:**
- Missing environment variables → Check `backend/.env`
- Database not ready → Wait for pgvector health check
- Port 8000 in use → Stop other services using port 8000

### Frontend Won't Connect to Backend

**Issue**: CORS or connection errors

**Solution**: Ensure environment variables are correct:
```env
NEXT_PUBLIC_BACKEND_URL=http://backend:8000
```

**Note**: Inside Docker, services use service names (e.g., `backend`), not `localhost`.

### Database Connection Failed

**Check if pgvector is running:**
```bash
docker-compose ps pgvector
```

**Check database logs:**
```bash
docker-compose logs pgvector
```

**Test connection:**
```bash
docker-compose exec pgvector pg_isready -U ai -d ai
```

### Port Already in Use

**Error**: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution**: Change port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Map to different host port
```

### Out of Memory

**Symptoms**: Services crash or become unresponsive

**Solution**: Increase Docker memory limit in Docker Desktop settings (minimum 4GB recommended).

## 📊 Monitoring

### View Resource Usage
```bash
docker stats
```

### View Container Details
```bash
docker-compose ps -a
docker inspect <container_name>
```

## 🔐 Security Notes

### Production Deployment

**DO NOT** use default database credentials in production:

```yaml
environment:
  - POSTGRES_PASSWORD=<strong-random-password>
```

**Use secrets management:**
- Docker Secrets
- AWS Secrets Manager
- HashiCorp Vault
- Environment-specific `.env` files (not committed to git)

### Network Security

For production, consider:
- Internal network for services
- Only expose frontend publicly
- Use reverse proxy (nginx, Traefik)
- Enable HTTPS/TLS

## 🚀 Development Mode

For development with hot-reloading:

### Backend Hot Reload
Already configured with volume mounting:
```yaml
volumes:
  - ./backend:/app
```

Edit files in `./backend` and changes will be reflected immediately (requires `--reload` flag in uvicorn).

### Frontend Hot Reload
For development, run frontend locally instead:
```bash
# Stop frontend container
docker-compose stop frontend

# Run frontend locally
cd frontend
npm run dev
```

Update `.env.local` to point to Docker backend:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 📦 Production Deployment

### Build Production Images
```bash
docker-compose build --no-cache
```

### Tag Images
```bash
docker tag agno-agent-backend:latest your-registry/agno-backend:v1.0.0
docker tag agno-agent-frontend:latest your-registry/agno-frontend:v1.0.0
```

### Push to Registry
```bash
docker push your-registry/agno-backend:v1.0.0
docker push your-registry/agno-frontend:v1.0.0
```

### Deploy to Cloud

See platform-specific guides:
- [AWS ECS](docs/deploy-aws.md)
- [Google Cloud Run](docs/deploy-gcp.md)
- [Azure Container Instances](docs/deploy-azure.md)
- [Railway](https://railway.app) - Auto-deploy from Dockerfile
- [Render](https://render.com) - Auto-deploy from Dockerfile

## 📝 Environment Variables Reference

### Required for All Environments

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJ...` |
| `OPENAI_API_KEY` | OpenAI API key for embeddings | `sk-...` |
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM | `sk-or-...` |

### Docker-Specific (Auto-configured)

| Variable | Value | Purpose |
|----------|-------|---------|
| `PGVECTOR_DB_URL` | `postgresql+psycopg://ai:ai@pgvector:5432/ai` | Database connection |
| `BACKEND_URL` | `http://backend:8000` | Internal backend URL |
| `FRONTEND_URL` | `http://frontend:3000` | Internal frontend URL |

## 🔄 Updates and Maintenance

### Update Dependencies
```bash
# Rebuild with latest base images
docker-compose build --pull --no-cache

# Restart services
docker-compose up -d
```

### Clean Up
```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune

# Remove all unused data
docker system prune -a
```

---

**Need Help?** Check the main [README.md](../README.md) or [SETUP.md](../SETUP.md) for more information.

