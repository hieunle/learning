"""Pydantic schemas for API requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""
    message: str = Field(..., description="User message")
    session_id: Optional[str] = Field(None, description="Chat session ID")


class Citation(BaseModel):
    """Citation/source reference."""
    document_id: str
    document_name: str
    chunk_text: str
    relevance_score: float


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    message: str = Field(..., description="Assistant response")
    session_id: str = Field(..., description="Chat session ID")
    citations: List[Citation] = Field(default_factory=list, description="Source citations")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class KnowledgeDocumentCreate(BaseModel):
    """Schema for creating a knowledge document."""
    filename: str
    content: str
    metadata: Optional[Dict[str, Any]] = None


class KnowledgeDocumentResponse(BaseModel):
    """Response schema for knowledge document."""
    id: str
    filename: str
    status: str
    chunks_count: int
    created_at: datetime
    updated_at: datetime
    metadata: Optional[Dict[str, Any]] = None


class PriceLookupRequest(BaseModel):
    """Request schema for price lookup."""
    service_type: str
    postcode: str
    area_size: Optional[float] = None


class PriceLookupResponse(BaseModel):
    """Response schema for price lookup."""
    service_type: str
    base_price: float
    final_price: float
    available: bool
    region: str
    notes: Optional[str] = None


