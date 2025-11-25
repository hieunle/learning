/**
 * Supabase client utilities for Next.js (Client-side only).
 * For server-side usage, import from './supabase-server.ts'
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}


