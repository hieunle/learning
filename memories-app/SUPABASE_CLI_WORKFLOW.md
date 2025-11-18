# Supabase CLI Database Workflow Guide

## 🔄 When to Use `supabase db diff` vs Manual SQL Files

### **Use `supabase db diff` When:**
1. **You've made changes in the Supabase Dashboard** (via web UI)
2. **You want to capture existing schema changes** that weren't tracked
3. **You're migrating from an existing database** to a migration-based workflow
4. **You need to sync local changes** with your team

### **Use Manual SQL Files When:**
1. **You're starting fresh** with a new feature
2. **You want full control** over the migration logic
3. **You need to write complex migrations** (data transformations, etc.)
4. **You're working in a team** and want to review changes before applying

## 📋 Proper Workflow Examples

### **Workflow 1: Dashboard Changes → Capture with diff**
```bash
# Step 1: Make changes in Supabase Dashboard (add table, column, etc.)
# Step 2: Generate diff to capture those changes
supabase db diff --file 20240115_add_user_profile_table

# This creates a migration file with the differences
# Step 3: Review the generated file
# Step 4: Commit the migration to version control
```

### **Workflow 2: Manual Migration → Write SQL File**
```sql
-- Create new file: supabase/migrations/20240115_create_user_profiles.sql
-- Write your migration manually:
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

## 🛠️ Setting Up Supabase CLI

### **Installation**
```bash
# Install Supabase CLI
npm install -g supabase

# Or use Homebrew (macOS)
brew install supabase/tap/supabase
```

### **Initialize Project**
```bash
# Navigate to your project directory
cd memories-app

# Initialize Supabase
supabase init

# This creates:
# - supabase/config.toml
# - supabase/migrations/ directory
# - .env.local for local development
```

### **Connect to Your Project**
```bash
# Link to your Supabase project
supabase login
supabase link --project-ref your-project-ref

# Find your project ref in your Supabase dashboard URL
# https://app.supabase.com/project/your-project-ref
```

## 🔄 Complete Development Workflow

### **1. Local Development with CLI**
```bash
# Start local Supabase instance
supabase start

# This runs a local Postgres database
# You can now make changes and test locally
```

### **2. Make Schema Changes**
```bash
# Option A: Use SQL Editor locally
# Connect to localhost:5432 and make changes

# Option B: Use migrations
# Create new migration file
supabase migration new add_user_profiles

# Edit the generated file with your SQL
```

### **3. Generate Diff (if needed)**
```bash
# If you made changes via dashboard or local SQL
supabase db diff --file 20240115_capture_changes
```

### **4. Apply Migrations**
```bash
# Apply migrations to local database
supabase migration up

# Or reset and reapply all migrations
supabase db reset
```

### **5. Deploy to Production**
```bash
# Push migrations to your Supabase project
supabase db push

# This applies all pending migrations to your live database
```

## 📝 Migration File Naming Conventions

### **Good Naming Examples:**
```
20240115_create_user_profiles.sql
20240116_add_bio_to_profiles.sql
20240117_add_avatar_url_to_profiles.sql
20240118_create_posts_table.sql
20240119_add_soft_delete_to_posts.sql
```

### **Poor Naming Examples:**
```
migration1.sql
update.sql
new_table.sql
fix.sql
```

## 🎯 Real-World Example: Adding User Profiles to Memories App

### **Step 1: Create Migration**
```bash
supabase migration new add_user_profiles
```

### **Step 2: Write Migration**
```sql
-- supabase/migrations/20240115_add_user_profiles.sql
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;
```

### **Step 3: Apply Locally**
```bash
supabase migration up
# or
supabase db reset  # To reset and reapply all migrations
```

### **Step 4: Test Changes**
```bash
# Your local database now has the new table
# Test your application with the new schema
```

### **Step 5: Deploy**
```bash
supabase db push
# This applies the migration to your live Supabase project
```

## ⚠️ Important Considerations

### **When NOT to use `db diff`:**
- **Don't use diff for every change** - Write manual migrations for new features
- **Don't rely on diff for complex migrations** - Manual SQL gives you more control
- **Don't use diff in CI/CD** - Use explicit migrations instead

### **Best Practices:**
1. **Write migrations manually** for new features
2. **Use diff sparingly** - mainly to capture dashboard changes
3. **Always review generated diffs** before committing
4. **Test migrations locally** before pushing to production
5. **Keep migrations small and focused**
6. **Never edit existing migrations** after they've been applied

## 🔧 Troubleshooting

### **Common Issues:**
```bash
# Diff shows no changes
supabase db diff --schema public  # Specify schema explicitly

# Permission errors
supabase db diff --use-mlc  # Use managed local cluster

# Connection issues
supabase status  # Check local instance status
```

This workflow ensures your database changes are properly version controlled and can be reliably deployed across environments!