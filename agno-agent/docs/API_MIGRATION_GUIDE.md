# API Migration Guide: AgentOS Built-in Endpoints

This guide documents the migration from custom API endpoints to AgentOS built-in endpoints.

## Overview

The backend now uses **AgentOS**, Agno's production runtime that provides built-in RESTful API endpoints for:
- Running agents: `POST /agents/{agent_id}/runs`
- Managing sessions: `/v1/sessions/*`
- Managing knowledge: `/v1/knowledge/*`
- Managing memories: `/v1/memories/*`

All AgentOS endpoints are served under `/v1/` (except agent runs which are at `/agents/`).

## API Endpoint Changes

### 1. Chat / Agent Run API

**Old Custom Endpoint:**
```
POST /api/v1/chat/
Content-Type: application/json
Body: { "message": "...", "session_id": "..." }
```

**New AgentOS Endpoint:**
```
POST /agents/{agent_id}/runs
Content-Type: application/x-www-form-urlencoded

Form fields:
- message: string (required)
- session_id: string (optional)
- user_id: string (optional)
- stream: boolean (default: false)
```

**Response Format:**
```json
{
  "run_id": "run_abc123",
  "agent_id": "helpdesk-assistant",
  "agent_name": "Electrodry Helpdesk Assistant",
  "session_id": "session_xyz789",
  "user_id": "user@example.com",
  "content": "The assistant's response text...",
  "content_type": "text",
  "messages": [...],
  "metrics": {
    "time": 1.234,
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  },
  "references": [
    {
      "id": "ref_123",
      "name": "Document Name",
      "content": "Referenced content chunk...",
      "score": 0.95,
      "document_id": "doc_456"
    }
  ]
}
```

### 2. Knowledge Management API

**Old Custom Endpoints:**
```
GET    /api/v1/knowledge/documents
POST   /api/v1/knowledge/upload
DELETE /api/v1/knowledge/documents/{id}
```

**New AgentOS Endpoints:**
```
GET    /knowledge/content       # List all knowledge content
POST   /knowledge/content       # Add new document/content
DELETE /knowledge/content/{id}  # Delete content by ID
```

**Upload Document (New Format):**
```
POST /knowledge/content
Content-Type: multipart/form-data

Form fields:
- file: file (required)
- name: string (optional - defaults to filename)
- description: string (optional)
- metadata: JSON string (optional)
- reader_id: string (optional - e.g., 'pdf', 'text', 'csv')
- chunker: string (optional - chunking strategy)
- chunk_size: integer (optional)
- chunk_overlap: integer (optional)
```

**List Response Format:**
```json
{
  "data": [
    {
      "id": "content_123",
      "name": "Service Manual.pdf",
      "description": "Service documentation",
      "type": "pdf",
      "size": "2.5 MB",
      "linked_to": "file_path",
      "metadata": {
        "document_type": "manual",
        "category": "service"
      },
      "access_count": 5,
      "status": "completed",
      "status_message": "Processing completed successfully",
      "created_at": "2025-11-25T10:00:00Z",
      "updated_at": "2025-11-25T10:05:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total_pages": 1,
    "total_count": 1,
    "search_time_ms": 45
  }
}
```

### 3. Session Management API

**New AgentOS Endpoints:**
```
GET    /v1/sessions                    # List all sessions
GET    /v1/sessions?user_id={user_id}  # List sessions for user
GET    /v1/sessions/{session_id}       # Get specific session
DELETE /v1/sessions/{session_id}       # Delete session
```

## Frontend Integration

### API Client Updates

The frontend API client (`frontend/lib/api.ts`) has been updated to use AgentOS endpoints:

**Running an Agent:**
```typescript
import { api } from '@/lib/api'

// Run the helpdesk agent
const response = await api.agents.run(
  'helpdesk-assistant',  // agent_id
  'How much does carpet cleaning cost?',  // message
  sessionId,  // session_id (optional)
  userId,     // user_id (optional)
  token,      // auth token
  false       // stream (optional)
)

// Access response
console.log(response.content)  // The agent's response
console.log(response.references)  // Knowledge base citations
```

**Managing Knowledge:**
```typescript
// List documents
const documents = await api.knowledge.list(token)

// Upload document
const file = new File([...], 'manual.pdf')
await api.knowledge.upload(file, token)

// Delete document
await api.knowledge.delete(documentId, token)
```

**Managing Sessions:**
```typescript
// List all sessions
const sessions = await api.sessions.list(token)

// List sessions for specific user
const userSessions = await api.sessions.list(token, userId)

// Get specific session
const session = await api.sessions.get(sessionId, token)

// Delete session
await api.sessions.delete(sessionId, token)
```

## Available Agents

The backend defines the following agents:

1. **helpdesk-assistant** (`id: "helpdesk-assistant"`)
   - Main Electrodry customer service agent
   - Has access to knowledge base (RAG enabled)
   - Includes pricing lookup tool
   - Maintains conversation history

2. **general-assistant** (`id: "general-assistant"`)
   - General-purpose AI assistant
   - Has access to knowledge base
   - No specialized tools

## Response Handling

### Agent Run Response

The `RunOutput` from AgentOS includes:

- **`content`**: The main response text
- **`references`**: Citations from knowledge base (for RAG responses)
- **`run_id`**: Unique identifier for this run
- **`session_id`**: Session identifier (for conversation continuity)
- **`metrics`**: Token usage and timing information
- **`messages`**: Full conversation context

### Knowledge References (Citations)

When an agent uses the knowledge base, the response includes `references`:

```typescript
response.references = [
  {
    id: "ref_123",
    name: "Service Manual.pdf",
    content: "Carpet cleaning prices start from...",
    score: 0.95,
    document_id: "doc_456"
  }
]
```

Map these to your Citation UI components:

```typescript
const citations = response.references?.map(ref => ({
  document_id: ref.document_id || ref.id,
  document_name: ref.name,
  chunk_text: ref.content,
  relevance_score: ref.score,
}))
```

## Authentication

AgentOS supports bearer token authentication when a security key is configured:

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

All API routes require authentication when the backend has `AGNO_API_KEY` set.

## Key Benefits

1. **Production-Ready**: AgentOS is battle-tested for production workloads
2. **Built-in Features**: Session management, metrics, monitoring out of the box
3. **Horizontal Scalability**: Designed to scale across multiple instances
4. **AgentOS Control Plane**: Can connect to Agno's UI for monitoring and management
5. **Standardized API**: Consistent endpoint structure and response formats

## Migration Checklist

- [x] Update API client to use AgentOS endpoints
- [x] Update chat response handling for RunOutput format
- [x] Update knowledge list handling for AgentOS content format
- [x] Update citation mapping for references format
- [x] Test agent runs with form-based input
- [ ] Test knowledge upload with multipart/form-data
- [ ] Test session management endpoints
- [ ] Update error handling for AgentOS error responses

## Testing

Access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **AgentOS Config**: http://localhost:8000/config

## Additional Resources

- [AgentOS Documentation](https://docs.agno.com/agent-os/overview)
- [AgentOS API Reference](https://docs.agno.com/reference-api/overview)
- [Agent Runs API](https://docs.agno.com/agent-os/api/usage)
- [Knowledge Management](https://docs.agno.com/agent-os/features/knowledge-management)

---

**Last Updated**: November 25, 2025

