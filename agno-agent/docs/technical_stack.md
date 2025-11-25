# Technical Stack Recommendation

## Overview
This project follows a modern, AI-native architecture focusing on performance, type safety, and rapid iteration. It utilizes **Agno** for agent orchestration and **Next.js** for the frontend, with **PostgreSQL** serving as the unified data and vector store.

## 1. Frontend (Admin Portal & Internal UI)
*Industry standard for internal dashboards, offering excellent performance and rapid UI development.*

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
  - Handles server-side rendering and API integration.
- **Language:** [TypeScript](https://www.typescriptlang.org/)
  - Essential for type safety across frontend/backend interfaces.
- **UI Library:** [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
  - Highly customizable, accessible, and professional components.
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) 
  - Simple, lightweight state management (avoiding Redux complexity).
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest)
  - Robust caching, synchronization, and server state management.

## 2. Backend (Agent API)
*High-performance, async-native Python environment optimized for AI agents.*

- **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/)
  - High-performance async API with automatic OpenAPI/Swagger documentation.
- **Agent Framework:** [Agno](https://github.com/agno-agi/agno)
  - Orchestrates "Agent Assist" and "RAG" logic.
  - Handles memory, knowledge base attachment, and tool calling.
- **Dependency Management:** [uv](https://github.com/astral-sh/uv)
  - Extremely fast Python package installer and resolver.
- **Validation:** [Pydantic V2](https://docs.pydantic.dev/latest/)
  - Data validation and settings management; tightly integrated with FastAPI and Agno.

## 3. AI & Data Layer
*Unified storage approach to reduce infrastructure overhead.*

- **Database & Vector Store:** [PostgreSQL](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector)
  - Serves as both the application database (users, logs) and the vector store for RAG.
  - Also used by Agno for agent memory/storage.
- **LLM Provider:** [OpenRouter](https://openrouter.ai/)
  - **Model:** Google Gemini (e.g., Gemini 2.5 Pro or Flash)
  - accessed via OpenRouter's unified API for flexibility and performance.
- **Embeddings:** OpenAI `text-embedding-3-small`
  - Efficient and cost-effective for knowledge base retrieval.

## 4. Infrastructure & DevOps
- **Containerization:** [Docker](https://www.docker.com/)
  - Standardized development and deployment environments.
- **CI/CD:** GitHub Actions
  - Automated testing, linting, and deployment pipelines.

## 5. Proposed Project Structure (Monorepo)

```text
/
├── frontend/             # Next.js application (TypeScript)
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/              # Python application
│   ├── app/
│   │   ├── agents/       # Agno agent definitions
│   │   ├── api/          # FastAPI routes & endpoints
│   │   ├── knowledge/    # RAG processing & ingestion logic
│   │   └── models/       # Pydantic & DB models
│   ├── pyproject.toml    # Project metadata
│   └── uv.lock           # Dependency lockfile
├── docker-compose.yml    # Local development orchestration
└── .env                  # Shared environment variables
```

