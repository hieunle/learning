# AgentOS Knowledge API Fix

## Issue
Getting `404 Not Found` error when accessing `/v1/knowledge` endpoint.

## Root Cause
The frontend was using incorrect AgentOS Knowledge API endpoints.

## Solution
According to [Agno AgentOS API Documentation](https://docs.agno.com/reference-api/knowledge/list-content), the correct endpoints are:

### ✅ Correct AgentOS Knowledge Endpoints

| Operation | Endpoint | Method |
|-----------|----------|--------|
| List content | `/knowledge/content` | GET |
| Upload content | `/knowledge/content` | POST |
| Delete content | `/knowledge/content/{content_id}` | DELETE |
| Get content by ID | `/knowledge/content/{content_id}` | GET |

### ❌ Incorrect Endpoints (Previous)

- `/v1/knowledge` - Does NOT exist in AgentOS
- `/v1/knowledge/{id}` - Does NOT exist

## Changes Made

### 1. Frontend API Client (`frontend/lib/api.ts`)

**Updated endpoints:**
```typescript
knowledge: {
  list: (token: string) =>
    apiRequest('/knowledge/content', { method: 'GET', token }),
  
  upload: async (file: File, token: string) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${API_BASE_URL}/knowledge/content`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })
    return response.json()
  },
  
  delete: (contentId: string, token: string) =>
    apiRequest(`/knowledge/content/${contentId}`, {
      method: 'DELETE',
      token,
    }),
}
```

### 2. Admin Page (`frontend/app/dashboard/admin/page.tsx`)

**Updated response handling:**
```typescript
const response: any = await api.knowledge.list(token)
// AgentOS returns { data: [...], meta: {...} }
if (response.data && Array.isArray(response.data)) {
  return response.data
}
```

**Expected Response Format:**
```json
{
  "data": [
    {
      "id": "content_123",
      "name": "document.pdf",
      "description": "...",
      "type": "pdf",
      "size": "2.5 MB",
      "linked_to": "file_path",
      "metadata": {},
      "access_count": 5,
      "status": "completed",
      "status_message": "Processing completed",
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

### 3. Documentation Updated

Updated `docs/API_MIGRATION_GUIDE.md` with correct endpoint mappings.

## Backend Configuration

The backend is correctly configured with `contents_db` which is **required** for AgentOS Knowledge API:

```python
# backend/app/core/knowledge_base.py
def get_knowledge_base() -> Knowledge:
    contents_db = PostgresDb(
        db_url=settings.supabase_db_url,
        knowledge_table="common_knowledge_contents",  # Required!
    )
    
    vector_db = PgVector(
        table_name="common_knowledge_chunks",
        db_url=settings.supabase_db_url,
        embedder=embedder,
    )
    
    return Knowledge(
        name="Common Documentation",
        vector_db=vector_db,
        contents_db=contents_db,  # Must be provided for AgentOS Knowledge API
        max_results=10,
    )
```

## Important Notes

### 1. **ContentsDB is Mandatory**
From [Agno Docs](https://docs.agno.com/basics/knowledge/content-db):
> "If you're using AgentOS, ContentsDB is mandatory for the Knowledge management interface. The AgentOS web interface relies on ContentsDB to display and manage your knowledge content."

### 2. **Content Status**
Content goes through processing states:
- `processing` - Currently being processed
- `completed` - Successfully processed and ready
- `failed` - Processing failed

### 3. **Upload Parameters**
When uploading via `/knowledge/content`:
- `file` - The file to upload (required)
- `name` - Content name (optional, defaults to filename)
- `description` - Description (optional)
- `metadata` - JSON string with custom metadata (optional)
- `reader_id` - Reader type: 'pdf', 'text', 'csv', etc. (optional, auto-detected)
- `chunker` - Chunking strategy (optional)
- `chunk_size` - Size of chunks (optional)
- `chunk_overlap` - Overlap between chunks (optional)

### 4. **Response Codes**
- `202 Accepted` - Upload successful, processing started
- `200 OK` - List/Get successful
- `404 Not Found` - Content not found or endpoint doesn't exist
- `401 Unauthorized` - Authentication required
- `400 Bad Request` - Invalid request parameters

## Testing the Fix

### Test List Endpoint
```bash
curl -X GET "http://localhost:8000/knowledge/content" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Upload Endpoint
```bash
curl -X POST "http://localhost:8000/knowledge/content" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "name=My Document" \
  -F 'metadata={"category":"manual"}'
```

### Test Delete Endpoint
```bash
curl -X DELETE "http://localhost:8000/knowledge/content/{content_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Documentation

View full AgentOS API documentation at:
- **Interactive Docs**: http://localhost:8000/docs
- **AgentOS Config**: http://localhost:8000/config
- **Official API Reference**: https://docs.agno.com/reference-api/knowledge/list-content

## Summary

✅ **Fixed incorrect endpoint paths**  
✅ **Updated response handling for AgentOS format**  
✅ **Verified backend has required `contents_db`**  
✅ **Updated documentation**  
✅ **No linting errors**  

The Knowledge API should now work correctly with AgentOS built-in endpoints! 🎉

---

**Fixed**: November 25, 2025


