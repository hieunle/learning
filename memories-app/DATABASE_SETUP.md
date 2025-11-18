# Database Setup Instructions

## 🗄️ Initial Setup

This app requires a single database setup step. Run the SQL script in your Supabase project:

### **One-Time Setup**
1. Go to your Supabase project **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/20241118_initial_setup.sql`
3. Click **Run** to execute the script

### **What This Creates:**
- `memories` table with title and description fields
- Row Level Security (RLS) policies to protect user data
- Proper indexes for performance
- User permissions for authenticated access

## 🔧 Troubleshooting

### **If You Get Permission Errors:**
The RLS policies ensure users can only access their own memories. If you see errors like:
```
new row violates row-level security policy for table "memories"
```

This usually means the app isn't properly setting the `user_id` field. The application code handles this automatically, so this shouldn't occur with normal usage.

### **If You Need to Reset the Database:**
```sql
-- Drop existing table (WARNING: This deletes all data!)
DROP TABLE IF EXISTS memories CASCADE;

-- Then re-run the setup script
```

## 📋 Schema Overview

```sql
-- Main memories table
CREATE TABLE memories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Security policies ensure users only see their own memories
-- Indexes optimize queries by user_id
```

That's it! No additional SQL files or fixes needed.