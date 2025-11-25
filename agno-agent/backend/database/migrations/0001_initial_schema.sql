-- Electrodry AI Helpdesk - Database Schema
-- This schema works with Agno for automatic RAG functionality
-- 
-- ⚠️ NOTE: The following tables are automatically managed by Agno:
--   - knowledge_chunks: Vector embeddings storage (managed by PgVector)
--   - knowledge_contents: Content metadata tracking (managed by PostgresDb)
--   - agent_sessions: Agent conversation sessions (managed by PostgresDb)
--
-- Run this script in your Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge documents table (for tracking uploaded documents)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'processing',
    chunks_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON knowledge_documents(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for knowledge_documents
CREATE TRIGGER update_knowledge_documents_updated_at BEFORE UPDATE ON knowledge_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
