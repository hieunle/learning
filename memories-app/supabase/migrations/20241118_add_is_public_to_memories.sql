ALTER TABLE memories ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false NOT NULL;

CREATE POLICY "Anyone can view public memories" ON memories
  FOR SELECT USING (is_public = true);

CREATE INDEX IF NOT EXISTS idx_memories_is_public ON memories(is_public);