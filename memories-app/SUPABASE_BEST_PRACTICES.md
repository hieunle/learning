# Best Practices for Working with Supabase

## 🚀 Development Workflow

### 1. **Local Development Setup**
```bash
# Use environment variables for all Supabase credentials
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # For admin operations
```

### 2. **Database Schema Management**
```sql
-- Always use migrations for schema changes
-- Create a new migration file for each change
-- Use descriptive names: 20240101_add_user_profiles.sql

-- Example migration structure
CREATE TABLE IF NOT EXISTS table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS immediately
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies with descriptive names
CREATE POLICY "Users can manage own data" ON table_name
  FOR ALL USING (auth.uid() = user_id);
```

## 🔐 Security Best Practices

### **Row Level Security (RLS)**
```sql
-- Always enable RLS on user-facing tables
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Use auth.uid() for user identification
CREATE POLICY "Users can view own memories" ON memories
  FOR SELECT USING (auth.uid() = user_id);

-- Be specific with policy operations
CREATE POLICY "Users can insert own memories" ON memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### **Client-Side Security**
```typescript
// Never expose service role keys in client code
// Use anon key for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Always validate user authentication before operations
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  throw new Error('User must be authenticated')
}
```

## 📊 Database Design Patterns

### **User-Associated Tables**
```sql
-- Pattern for tables that belong to users
CREATE TABLE memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for performance
CREATE INDEX idx_memories_user_id ON memories(user_id);
```

### **Soft Deletes**
```sql
-- Add deleted_at for soft deletes instead of hard deletes
ALTER TABLE memories ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Update policies to exclude soft-deleted records
CREATE POLICY "Users can view non-deleted memories" ON memories
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
```

## 🔄 Data Fetching Patterns

### **Service Layer Pattern**
```typescript
// Create dedicated service files
export const memoryService = {
  async getMemories(): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createMemory(title: string, description: string): Promise<Memory> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to create memories')
    }

    const { data, error } = await supabase
      .from('memories')
      .insert([{ title, description, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```

### **Real-time Subscriptions**
```typescript
// Use Supabase real-time for live updates
useEffect(() => {
  const subscription = supabase
    .channel('memories-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'memories' },
      (payload) => {
        console.log('Change received!', payload)
        // Handle the change in your app
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

## 🧪 Testing & Debugging

### **Test RLS Policies**
```sql
-- Test your policies directly in SQL Editor
-- Set role to authenticated and test queries
SET ROLE authenticated;
SELECT * FROM memories; -- Should only show user's memories

-- Test with specific user ID
SELECT auth.uid(); -- Check current user
```

### **Error Handling**
```typescript
// Always handle Supabase errors properly
try {
  const { data, error } = await supabase.from('memories').select()
  if (error) {
    // Handle specific error codes
    if (error.code === 'PGRST116') {
      // No rows found
    } else if (error.code === '42501') {
      // RLS policy violation
    }
    throw error
  }
  return data
} catch (error) {
  console.error('Supabase error:', error)
  // Show user-friendly error messages
}
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── supabase.ts          # Client configuration
│   └── supabase.types.ts    # Generated types (optional)
├── services/
│   ├── auth.service.ts      # Authentication logic
│   ├── memory.service.ts    # Memory operations
│   └── user.service.ts      # User profile operations
├── store/
│   ├── auth.store.ts        # Auth state management
│   └── memory.store.ts      # Memory state management
├── types/
│   ├── database.types.ts    # Database type definitions
│   └── app.types.ts         # Application types
└── utils/
    ├── supabase.utils.ts    # Supabase utilities
    └── error.utils.ts       # Error handling utilities
```

## ⚡ Performance Tips

### **Query Optimization**
```typescript
// Use select() to limit returned columns
const { data } = await supabase
  .from('memories')
  .select('id, title, created_at') // Only get what you need
  .order('created_at', { ascending: false })
  .limit(10) // Limit results

// Use filters efficiently
const { data } = await supabase
  .from('memories')
  .select('*')
  .eq('user_id', userId) // Use indexes
  .gte('created_at', startDate) // Range queries
```

### **Caching Strategy**
```typescript
// Implement client-side caching
const memoryCache = new Map()

export const getCachedMemories = async (userId: string) => {
  if (memoryCache.has(userId)) {
    return memoryCache.get(userId)
  }
  
  const memories = await memoryService.getMemories()
  memoryCache.set(userId, memories)
  return memories
}
```

## 🚀 Deployment Tips

### **Environment Variables**
```bash
# Production environment variables
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
# Never expose service role key in client-side code
```

### **Database Migrations**
```bash
# Use Supabase CLI for migrations
supabase db diff --file migration_name
supabase db push
```

## 📚 Common Pitfalls to Avoid

1. **Don't disable RLS** - Always use RLS for user data
2. **Don't expose service role keys** - Only use anon keys client-side
3. **Don't forget indexes** - Add indexes on frequently queried columns
4. **Don't hardcode user IDs** - Always use `auth.uid()` in policies
5. **Don't forget error handling** - Supabase operations can fail
6. **Don't use serial IDs** - Use UUIDs for better security

## 🔗 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Database Best Practices](https://supabase.com/docs/guides/database/tables)

This approach ensures your Supabase integration is secure, performant, and maintainable!