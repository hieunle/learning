# Agno Quick Reference Guide

## Creating an Agent with RAG

### Basic Agent Setup
```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.knowledge.knowledge import Knowledge
from agno.knowledge.embedder.openai import OpenAIEmbedder
from agno.vectordb.pgvector import PgVector

# Setup Knowledge Base
knowledge = Knowledge(
    vector_db=PgVector(
        db_url="postgresql+psycopg://user:pass@host:port/db",
        table_name="knowledge_chunks",
        embedder=OpenAIEmbedder(model="text-embedding-3-small"),
    ),
)

# Create Agent with RAG
agent = Agent(
    name="My Agent",
    model=OpenAIChat(id="gpt-4"),
    knowledge=knowledge,
    search_knowledge=True,  # Enable automatic RAG
    instructions=[
        "Always search your knowledge before answering.",
        "Include sources in your response.",
    ],
    markdown=True,
)
```

---

## Adding Knowledge Content

### Add Text Content
```python
await knowledge.aadd_content(
    content="Your text content here...",
    name="document_name",
    metadata={"source": "manual", "category": "docs"}
)
```

### Add from URL
```python
await knowledge.aadd_content(
    url="https://example.com/document.pdf",
    name="Document Name",
    metadata={"source": "web"}
)
```

### Add from File
```python
await knowledge.aadd_content(
    path="./path/to/document.pdf",
    name="Local Document",
    metadata={"source": "local"}
)
```

---

## Using the Agent

### Synchronous
```python
response = agent.run("What is your question?")
print(response.content)
```

### Asynchronous
```python
response = await agent.arun("What is your question?")
print(response.content)
```

### Streaming
```python
agent.print_response("Your question", stream=True)

# Or async streaming
async for chunk in agent.arun_stream("Your question"):
    print(chunk.content, end="", flush=True)
```

---

## Adding Tools

### Define a Tool
```python
def search_database(query: str, limit: int = 10) -> str:
    """
    Search the database for relevant information.
    
    Args:
        query: The search query
        limit: Maximum number of results
        
    Returns:
        JSON string with search results
    """
    # Your implementation
    results = perform_search(query, limit)
    return json.dumps(results)

# Add to agent
agent = Agent(
    tools=[search_database],
    ...
)
```

---

## Vector Database Options

### PgVector (PostgreSQL)
```python
from agno.vectordb.pgvector import PgVector

vector_db = PgVector(
    db_url="postgresql+psycopg://...",
    table_name="embeddings",
    embedder=OpenAIEmbedder(),
)
```

### LanceDB
```python
from agno.vectordb.lancedb import LanceDb, SearchType

vector_db = LanceDb(
    uri="tmp/lancedb",
    table_name="embeddings",
    search_type=SearchType.hybrid,
    embedder=OpenAIEmbedder(),
)
```

---

## Embedder Options

### OpenAI
```python
from agno.knowledge.embedder.openai import OpenAIEmbedder

embedder = OpenAIEmbedder(
    model="text-embedding-3-small",
    api_key="your-key"
)
```

### Cohere
```python
from agno.knowledge.embedder.cohere import CohereEmbedder

embedder = CohereEmbedder(
    id="embed-v4.0",
    api_key="your-key"
)
```

---

## Model Options

### OpenAI
```python
from agno.models.openai import OpenAIChat

model = OpenAIChat(
    id="gpt-4",
    api_key="your-key"
)
```

### Claude (Anthropic)
```python
from agno.models.anthropic import Claude

model = Claude(
    id="claude-sonnet-4-20250514",
    api_key="your-key"
)
```

### Gemini
```python
from agno.models.google import Gemini

model = Gemini(
    id="gemini-2.0-flash-exp",
    api_key="your-key"
)
```

### Via OpenRouter
```python
from agno.models.openai import OpenAIChat

model = OpenAIChat(
    id="google/gemini-2.0-flash-exp:free",
    api_key="your-openrouter-key",
    base_url="https://openrouter.ai/api/v1"
)
```

---

## Search and Retrieval

### Manual Search
```python
# Search knowledge base manually
results = await knowledge.asearch(
    query="your search query",
    num_documents=5
)

for result in results:
    print(result.content)
    print(result.metadata)
    print(result.score)
```

### Automatic (via Agent)
When `search_knowledge=True`, the agent automatically searches when needed:
```python
agent = Agent(
    knowledge=knowledge,
    search_knowledge=True,  # Agent decides when to search
)

response = await agent.arun("Question requiring knowledge base")
# Agent automatically retrieves relevant docs
```

---

## Best Practices

### 1. Always Use Async
```python
# Good
response = await agent.arun(message)

# Avoid (blocks event loop)
response = agent.run(message)
```

### 2. Enable Search in Instructions
```python
agent = Agent(
    instructions=[
        "Always search your knowledge before answering.",
        "Include sources in your response.",
        "If information is not in the knowledge base, say so clearly.",
    ],
    search_knowledge=True,
)
```

### 3. Add Metadata to Content
```python
await knowledge.aadd_content(
    content=text,
    metadata={
        "source": "manual",
        "category": "product_info",
        "created_by": user_id,
        "document_id": doc_id,
    }
)
```

### 4. Use Proper Chunking
Agno handles chunking automatically, but you can configure:
```python
knowledge = Knowledge(
    vector_db=PgVector(...),
    chunk_size=1000,  # Characters per chunk
    chunk_overlap=200,  # Overlap between chunks
)
```

### 5. Handle Citations
```python
response = await agent.arun(message)

# Extract references
if hasattr(response, 'references'):
    for ref in response.references:
        print(f"Source: {ref.get('name')}")
        print(f"Content: {ref.get('content')}")
        print(f"Score: {ref.get('score')}")
```

---

## Common Patterns

### Pattern 1: RAG Agent with Tools
```python
agent = Agent(
    model=OpenAIChat(id="gpt-4"),
    knowledge=knowledge,
    search_knowledge=True,
    tools=[pricing_tool, booking_tool],
    instructions=[
        "Search knowledge for general information.",
        "Use tools for specific actions.",
    ],
)
```

### Pattern 2: Streaming with Progress
```python
async def stream_with_progress(message: str):
    chunks = []
    async for chunk in agent.arun_stream(message):
        chunks.append(chunk.content)
        print(chunk.content, end="", flush=True)
    
    full_response = "".join(chunks)
    return full_response
```

### Pattern 3: Multi-Document Ingestion
```python
async def ingest_multiple_docs(documents):
    for doc in documents:
        await knowledge.aadd_content(
            content=doc['content'],
            name=doc['name'],
            metadata=doc['metadata']
        )
    print(f"Ingested {len(documents)} documents")
```

---

## Troubleshooting

### Issue: Agent doesn't search knowledge
**Solution:** Ensure `search_knowledge=True` and add instructions:
```python
agent = Agent(
    knowledge=knowledge,
    search_knowledge=True,
    instructions=["Always search your knowledge before answering."],
)
```

### Issue: No citations in response
**Solution:** Add instruction to include sources:
```python
instructions=["Include sources in your response."]
```

### Issue: Slow embedding generation
**Solution:** Use smaller embedding model or batch processing:
```python
embedder = OpenAIEmbedder(model="text-embedding-3-small")  # Faster
```

### Issue: Poor search results
**Solution:** 
1. Use hybrid search: `search_type=SearchType.hybrid`
2. Add reranker: `reranker=CohereReranker(model="rerank-v3.5")`
3. Adjust similarity threshold

---

## Resources

- **Documentation:** https://docs.agno.com
- **GitHub:** https://github.com/agno-agi/agno
- **Examples:** https://github.com/agno-agi/agno-docs/tree/main/examples
- **Discord:** Join the Agno community

---

**Last Updated:** November 22, 2025


