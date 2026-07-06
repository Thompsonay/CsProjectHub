// This file creates a single shared Supabase client that the rest of the
// app imports wherever it needs to talk to the database, auth, or storage.
//
// Vite exposes env vars to the browser only if they're prefixed with
// VITE_ — that's why the variable names below start with VITE_.
// The actual values live in your local .env file (never committed) and
// are documented in .env.example.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill in ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project settings.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
