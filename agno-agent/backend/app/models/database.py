"""Database models using Pydantic for Supabase integration."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID, uuid4


class KnowledgeDocument(BaseModel):
    """Knowledge document model."""
    id: UUID = Field(default_factory=uuid4)
    filename: str
    status: str = "processing"
    chunks_count: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[UUID] = None


class KnowledgeChunk(BaseModel):
    """Knowledge chunk model for vector storage."""
    id: UUID = Field(default_factory=uuid4)
    document_id: UUID
    content: str
    embedding: Optional[List[float]] = None
    chunk_index: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)


class ChatSession(BaseModel):
    """Chat session model."""
    id: UUID = Field(default_factory=uuid4)
    user_id: Optional[UUID] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ChatMessage(BaseModel):
    """Chat message model."""
    id: UUID = Field(default_factory=uuid4)
    session_id: UUID
    role: str  # 'user' or 'assistant'
    content: str
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)


