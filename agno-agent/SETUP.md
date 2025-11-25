# Electrodry AI Helpdesk - Setup Guide

This guide will help you set up and run the Electrodry AI Helpdesk system locally.

## Prerequisites

- Python 3.11+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) - Python package manager
- Supabase account
- OpenAI API key
- OpenRouter API key

## Step 1: Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Enable the `pgvector` extension:
   - Go to Database → Extensions
   - Search for "vector" and enable it

3. Run the database schema:
   - Go to SQL Editor
   - Copy and paste the contents of `backend/database/migrations/0001_initial_schema.sql`
   - Execute the script

4. Create the vector search function:
   - Copy and paste the contents of `backend/vector_search_function.sql`
   - Execute the script

5. Get your credentials:
   - Go to Settings → API
   - Copy `Project URL` (SUPABASE_URL)
   - Copy `anon` public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Copy `service_role` key (SUPABASE_SERVICE_KEY) - **Keep this secret!**

## Step 2: Environment Configuration

### Backend Environment

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

### Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Step 3: Install Dependencies

### Backend

```bash
cd backend
uv sync
```

### Frontend

```bash
cd frontend
npm install
```

## Step 4: Create a User Account

You need to create a user account in Supabase to access the application:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → Create new user
3. Enter email and password
4. The user will be created and can log in to the application

## Step 5: Run the Application

### Terminal 1 - Backend

```bash
cd backend
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/api/docs`

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Step 6: First Login

1. Navigate to `http://localhost:3000`
2. You'll be redirected to the login page
3. Enter the email and password you created in Supabase
4. You'll be redirected to the chat interface

## Step 7: Upload Knowledge Documents

1. Click "Admin" in the navigation
2. Click "Upload Document"
3. Select a text or PDF file containing knowledge base content
4. Wait for processing to complete
5. The document will be chunked, embedded, and added to the vector store

## Step 8: Test the Chat

1. Click "Chat" in the navigation
2. Ask questions about the uploaded documents
3. The AI will respond with information from the knowledge base and cite sources
4. Try asking for price quotes (e.g., "How much does carpet cleaning cost in Sydney 2000 for 50 square meters?")

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check API status

### Knowledge Base (Protected - requires authentication)
- `POST /api/v1/knowledge/upload` - Upload document (admin only)
- `GET /api/v1/knowledge/documents` - List documents
- `DELETE /api/v1/knowledge/documents/{id}` - Delete document (admin only)

### Chat (Protected - requires authentication)
- `POST /api/v1/chat/` - Send message and get response
- `POST /api/v1/chat/stream` - Stream response (SSE)

## Troubleshooting

### Backend won't start
- Check that all environment variables are set correctly
- Verify Supabase credentials
- Ensure uv dependencies are installed: `uv sync`

### Frontend build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check that `.env.local` exists with correct values

### Authentication fails
- Verify Supabase credentials in frontend `.env.local`
- Check that user exists in Supabase Auth dashboard
- Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is the `anon` key, not `service_role`

### Vector search not working
- Ensure `pgvector` extension is enabled in Supabase
- Verify the `match_knowledge_chunks` function was created successfully
- Check that documents are uploaded and show status "completed"

### Price lookup not working
- The tool is mock data in `backend/app/agents/tools.py`
- Modify pricing rules as needed for your business

## Next Steps

### Add More Features
- Implement chat history persistence
- Add user roles and permissions
- Create analytics dashboard
- Add support for more file types (Word, Excel)
- Implement conversation export

### Production Deployment
- Set up proper environment variables
- Configure CORS for production domain
- Set up SSL/TLS certificates
- Configure rate limiting
- Set up monitoring and logging
- Use production-grade OpenRouter/OpenAI plans

## Architecture Overview

```
Frontend (Next.js)
    ↓ HTTP/REST
Backend (FastAPI)
    ↓
┌───────────────┬──────────────┐
│               │              │
Agno Agent   Supabase      OpenAI
(LLM)       (PostgreSQL)  (Embeddings)
            + pgvector
```

## Support

For issues or questions, refer to:
- Agno Documentation: https://github.com/agno-agi/agno
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs


