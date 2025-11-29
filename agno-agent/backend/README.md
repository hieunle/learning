# Electrodry AI Helpdesk Backend

AI-powered helpdesk backend with RAG-based knowledge retrieval using Agno agents.

## Setup

1. Install dependencies:
```bash
uv sync
```

2. Configure environment variables in `.env` (copy from `.env.example`):
```env
# Supabase (Authentication Only)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Local PgVector Database (Vector DB & Knowledge Base)
PGVECTOR_DB_URL=postgresql+psycopg://ai:ai@localhost:5532/ai

# API Keys
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key
```

   **Database Architecture:**
   - **Supabase**: Used ONLY for user authentication (Supabase Auth)
   - **PgVector**: Local PostgreSQL with pgvector extension for vector embeddings and knowledge base

3. Start local PgVector database:
```bash
docker run -d \
  -e POSTGRES_DB=ai \
  -e POSTGRES_USER=ai \
  -e POSTGRES_PASSWORD=ai \
  -e PGDATA=/var/lib/postgresql/data/pgdata \
  -v pgvolume:/var/lib/postgresql/data \
  -p 5532:5432 \
  --name pgvector \
  agnohq/pgvector:16
```

4. Run the server:
```bash
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## Project Structure

```
app/
├── agents/          # Agno agent definitions
│   ├── helpdesk.py  # Main helpdesk agent
│   └── tools.py     # Agent tools (price lookup)
├── api/             # FastAPI routes
│   ├── chat.py      # Chat endpoints
│   ├── knowledge.py # Knowledge base endpoints
│   └── health.py    # Health check
├── core/            # Core utilities
│   ├── config.py    # Settings
│   ├── database.py  # Database connection
│   └── auth.py      # Authentication
├── knowledge/       # RAG processing
│   ├── ingest.py    # Document ingestion
│   └── text_processing.py  # Text chunking
├── models/          # Data models
│   ├── schemas.py   # API schemas
│   └── database.py  # Database models
└── main.py          # FastAPI app
```

## Development

Run with auto-reload:
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Testing

```bash
# Install dev dependencies
uv pip install pytest pytest-asyncio httpx

# Run tests
uv run pytest
```

## Docker Deployment

### Quick Start with Docker Compose

1. **Build and run with Docker Compose**:
```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`

### Building for Production

```bash
# Build the Docker image
docker build -t agno-agent-backend:latest .

# Run the container
docker run -p 8000:8000 \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY \
  -e PGVECTOR_DB_URL=$PGVECTOR_DB_URL \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e OPENROUTER_API_KEY=$OPENROUTER_API_KEY \
  agno-agent-backend:latest
```

### Deployment Platforms

The Dockerfile is production-ready and can be deployed to:
- **Railway**: Automatic deployment from Dockerfile
- **Google Cloud Run**: `gcloud run deploy`
- **AWS ECS**: Push to ECR and deploy via ECS
- **DigitalOcean**: App Platform with automatic Dockerfile detection
- **Render**: Direct deployment via web interface

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Docker Features

- ✅ Based on official `agnohq/python:3.12` image
- ✅ UV package manager for fast dependency installation
- ✅ Non-root user for security
- ✅ Built-in health checks
- ✅ Multi-worker configuration for production
- ✅ Optimized layer caching


