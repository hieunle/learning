# Memories App

A simple React web application for managing personal memories with Supabase authentication.

## Features

- User authentication (sign up, sign in, sign out)
- Create, read, update, and delete memories
- Each memory has a title and description
- Responsive design with Tailwind CSS
- Row Level Security (RLS) policies for data protection

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to Project Settings > API
3. Copy your project URL and anon key

### 2. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials to the `.env` file:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Set up the Database

1. Go to your Supabase project SQL Editor
2. Copy and run the SQL from `supabase/migrations/20241118_initial_setup.sql`
3. This will create the memories table with proper RLS policies

**📋 For detailed database setup instructions, see [DATABASE_SETUP.md](DATABASE_SETUP.md)**

### 4. Run the Application

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

## Project Structure

```
src/
├── components/       # Reusable components
├── lib/             # Supabase client configuration
├── pages/           # Page components
├── services/        # API service functions
├── store/           # Zustand state management
└── types/           # TypeScript type definitions

supabase/
└── migrations/      # Database migration SQL files
    └── 20241118_initial_setup.sql  # Initial database setup
```

## Technologies Used

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Supabase for authentication and database
- Zustand for state management
- Lucide React for icons

## Security Features

- Row Level Security (RLS) policies ensure users can only access their own memories
- Authentication handled by Supabase Auth
- All database operations are protected by user-specific policies
