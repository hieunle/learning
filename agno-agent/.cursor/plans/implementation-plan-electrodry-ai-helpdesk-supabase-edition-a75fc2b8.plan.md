<!-- a75fc2b8-4593-4b97-963b-3b7b0f4c7611 cc84af00-38c2-4a3c-912b-36460af07e95 -->
# Implementation Plan: Electrodry AI Helpdesk (Supabase Edition)

This plan outlines the steps to build the AI Helpdesk system phase 1 using Supabase for persistence and auth.

## Phase 1: Project Initialization & Infrastructure

1.  **Monorepo Setup**

    - Create root directory structure: `frontend/`, `backend/`.
    - Initialize Git repository.
    - Create shared `.env` template (Supabase credentials, API keys).

2.  **Supabase Integration (Database & Auth)**

    - Setup Supabase project (instructions/env vars).
    - Configure environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (backend), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend).
    - Ensure `pgvector` extension is enabled in Supabase.
    - Define Database schema (can be applied via SQL editor or migrations).

3.  **Backend Setup (Python/uv)**

    - Initialize `backend/` directory using `uv init`.
    - Dependencies: `fastapi`, `uvicorn`, `agno`, `sqlalchemy` (or `supabase` python client), `pydantic`, `python-dotenv`, `openai`, `gotrue` (for auth verification if needed).
    - Establish directory structure: `app/api`, `app/core`, `app/models`, `app/agents`, `app/knowledge`.
    - Implement Supabase Auth middleware for protected endpoints.

4.  **Frontend Setup (Next.js)**

    - Initialize `frontend/` using `create-next-app`.
    - Install dependencies: `lucide-react`, `clsx`, `tailwind-merge`, `@supabase/ssr`, `@supabase/supabase-js`.
    - Initialize `shadcn/ui` components.
    - Setup `zustand` and `tanstack/react-query`.
    - Implement Supabase Auth provider/hooks.

## Phase 2: Backend Development (API & Agents)

5.  **Database Implementation**

    - Define models for `KnowledgeDocument` and `ChatSession`.
    - Implement database connection using Supabase client or SQLAlchemy with Supabase connection string.
    - Create migration scripts/SQL definitions.

6.  **Knowledge Base (RAG) Engine**

    - Implement `KnowledgeBase` using Agno's PgVector support pointed at Supabase.
    - Create ingestion service:
        - Chunking and embedding (OpenAI).
        - Storage in Supabase `vector` compatible table.
    - Create API endpoints: `POST /api/v1/knowledge/upload` (protected).

7.  **Agent Construction**

    - Configure LLM client (OpenRouter/Gemini).
    - Create "Helpdesk Agent" in `app/agents/helpdesk.py`.
    - Connect Agent to Supabase vector store.
    - Implement "Price Lookup" tool.
    - Create API endpoint: `POST /api/v1/chat` (protected).

## Phase 3: Frontend Development (UI/UX)

8.  **Authentication UI**

    - Create Login page.
    - Implement Auth context/middleware to protect Admin/Internal routes.

9.  **Admin Portal (Knowledge Management)**

    - Create Admin Dashboard layout.
    - Implement "Upload Document" with file picker.
    - Implement "Knowledge Library" table.
    - Connect to backend `knowledge` endpoints.

10. **Agent Assist Interface**

    - Create Chat UI component.
    - Implement "Citations" display.
    - Integrate with `POST /api/v1/chat`.

## Phase 4: Integration & Refinement

11. **End-to-End Testing**

    - Verify Auth flow (Frontend -> Backend verification).
    - Test RAG flow (Upload -> Embed -> Query).
    - Validate Agent responses.

12. **Final Polish**

    - Error handling, loading states, responsive design.
    - Documentation.

### To-dos

- [x] Initialize monorepo structure, git, and docker-compose.yml with Postgres+pgvector
- [x] Setup Backend: Initialize uv project, install dependencies, structure folders
- [ ] Setup Frontend: Initialize Next.js, install shadcn/ui, zustand, react-query
- [ ] Implement Backend Database: Models and connection logic
- [ ] Implement RAG Service: Ingestion, embedding, and storage endpoints
- [ ] Implement Agent Logic: Agno agent setup with tools and chat endpoint
- [ ] Implement Admin UI: Document upload and management pages
- [ ] Implement Chat UI: Agent assist interface with history and citations