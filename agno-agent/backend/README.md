# Electrodry AI Helpdesk Backend

AI-powered helpdesk backend with RAG-based knowledge retrieval using Agno agents.

## Setup

1. Install dependencies:
```bash
uv sync
```

2. Configure environment variables in `.env` (copy from `.env.example`):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_DB_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key
```

   **Note about Supabase credentials:**
   - **`SUPABASE_SERVICE_KEY`**: Found in Supabase Dashboard → Settings → API → "service_role" key (starts with `eyJ...`)
   - **`SUPABASE_DB_URL`**: PostgreSQL connection string found in Supabase Dashboard → Settings → Database → Connection String → URI
     - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`
     - Replace `[YOUR-PASSWORD]` with your database password (set during project creation)

3. Set up Supabase database:
   - Enable pgvector extension
   - Run `backend/database/migrations/0001_initial_schema.sql` in Supabase SQL Editor

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


