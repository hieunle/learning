# Electrodry AI Helpdesk Frontend

Modern web interface for the AI-powered helpdesk system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Authentication**: Secure login with Supabase Auth
- **Chat Interface**: Real-time chat with AI agent
- **Citations**: Source references for all AI responses
- **Admin Portal**: Upload and manage knowledge base documents
- **Responsive Design**: Works on desktop and mobile

## Project Structure

```
app/
├── dashboard/
│   ├── page.tsx          # Chat interface
│   ├── admin/
│   │   └── page.tsx      # Admin dashboard
│   └── layout.tsx        # Dashboard layout
├── login/
│   └── page.tsx          # Login page
└── layout.tsx            # Root layout

components/
└── ui/                   # shadcn/ui components

lib/
├── auth-context.tsx      # Authentication context
├── providers.tsx         # App providers
├── supabase.ts          # Supabase client
├── api.ts               # API client
└── utils.ts             # Utilities
```

## Build

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Authentication**: Supabase Auth
