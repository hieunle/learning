from agno.knowledge.knowledge import Knowledge
from agno.knowledge.embedder.openai import OpenAIEmbedder
from agno.vectordb.pgvector import PgVector
from agno.db.postgres import PostgresDb
from app.core.config import settings

def get_knowledge_base() -> Knowledge:
    """
    Create and return the shared Knowledge base instance.
    Uses PgVector for storage and OpenAI for embeddings.
    
    Following Agno best practices:
    - Uses PostgresDb for content tracking (metadata, status)
    - Uses PgVector for vector embeddings storage
    - Embedder is initialized separately and shared
    
    Note: Chunking is configured in the Reader when adding content,
    not in the Knowledge class itself. See settings.chunk_size and 
    settings.chunk_overlap for the configured values to use in readers.
    """
    # Initialize embedder (shared between vector db and knowledge base)
    embedder = OpenAIEmbedder(
        id=settings.embedding_model,
        dimensions=settings.embedding_dimensions,
        api_key=settings.openai_api_key
    )
    
    # Initialize vector database for storing embeddings
    vector_db = PgVector(
        table_name="common_knowledge_chunks",
        db_url=settings.supabase_db_url,
        embedder=embedder,
    )
    
    # Initialize contents database for tracking content metadata
    contents_db = PostgresDb(
        db_url=settings.supabase_db_url,
        knowledge_table="common_knowledge_contents",
    )
    
    # Create knowledge base with both databases
    return Knowledge(
        name="Common Documentation",
        vector_db=vector_db,
        contents_db=contents_db,  # Enables content tracking and management
        max_results=10,  # Maximum number of search results to return
    )

