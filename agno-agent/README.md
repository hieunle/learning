# Electrodry AI Helpdesk

An AI-powered helpdesk system using RAG (Retrieval Augmented Generation) for intelligent customer service responses.

## ✨ Features

- 🤖 **AI Agent** - Powered by Agno with automatic RAG
- 📚 **Knowledge Base** - Upload documents for context-aware responses
- 💬 **Chat Interface** - Modern, responsive chat UI
- 📊 **Admin Portal** - Manage knowledge base documents
- 🔒 **Authentication** - Secure login with Supabase Auth
- 💰 **Price Lookup** - Integrated pricing tool for service quotes
- 📝 **Citations** - Automatic source references in responses

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account
- OpenAI API key
- OpenRouter API key

### Setup

1. **Clone and Install**
   ```bash
   # Backend
   cd backend
   uv sync
   
   # Frontend
   cd frontend
   npm install
   ```

2. **Configure Environment**
   
   Create `.env` files from examples:
   - `backend/.env` (see [SETUP.md](SETUP.md))
   - `frontend/.env.local`

3. **Database Setup**
   ```bash
   # Run schema in Supabase SQL Editor
   # See docs/DATABASE_SETUP.md for details
   ```

4. **Run the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   uv run uvicorn app.main:app --reload
   
   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

5. **Access** → http://localhost:3000

## 📖 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup guide
- **[docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)** - Database configuration
- **[docs/agno_quick_reference.md](docs/agno_quick_reference.md)** - Code patterns & examples
- **[docs/](docs/)** - Additional documentation

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Agno** - AI agent framework with automatic RAG
- **Supabase** - PostgreSQL + pgvector + Auth
- **OpenAI** - Embeddings (text-embedding-3-small)
- **OpenRouter** - LLM access (Gemini)

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Data fetching

## 📁 Project Structure

```
agno-agent/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── agents/      # Agno agents & tools
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Config, auth, database
│   │   ├── knowledge/   # RAG ingestion
│   │   └── models/      # Data models
│   └── database/
│       └── migrations/
│           └── 0001_initial_schema.sql  # Database schema migrations
│
├── frontend/            # Next.js frontend
│   ├── app/            # Pages & routes
│   ├── components/     # UI components
│   └── lib/            # Utilities & API client
│
└── docs/               # Documentation
    ├── DATABASE_SETUP.md
    └── agno_quick_reference.md
```

## 🔑 Key Features

### Automatic RAG (Retrieval Augmented Generation)
- Upload documents (TXT, PDF)
- Automatic chunking and embedding
- Vector similarity search
- Context-aware responses with citations

### AI Agent
- Powered by Agno framework
- Custom tools (price lookup)
- Brand-compliant responses
- Streaming support

### Admin Portal
- Upload & manage knowledge documents
- Track processing status
- Delete outdated content

## 🛠️ Development

### Backend Development
```bash
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Run Tests
```bash
# Backend
cd backend
uv run pytest

# Frontend
cd frontend
npm test
```

## 📊 API Endpoints

- `GET /api/v1/health` - Health check
- `POST /api/v1/chat` - Chat with agent
- `POST /api/v1/knowledge/upload` - Upload document (admin)
- `GET /api/v1/knowledge/documents` - List documents
- `DELETE /api/v1/knowledge/documents/{id}` - Delete document (admin)

## 🔒 Authentication

Uses Supabase Auth with JWT tokens. Protected routes require valid authentication.

## 🌟 What's New

**Latest Updates:**
- ✅ Migrated to Agno's automatic RAG (55% less code!)
- ✅ Proper model class initialization
- ✅ Real streaming support
- ✅ Automatic citation handling
- ✅ Optimized vector search

See [docs/IMPLEMENTATION_NOTES.md](docs/IMPLEMENTATION_NOTES.md) for details.

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the setup guide first.

## 📧 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review setup guide
3. Check database configuration

---

**Built with ❤️ using Agno, FastAPI, and Next.js**
