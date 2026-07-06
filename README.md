# CSProjectHub

An open platform where Computer Science students (with a focus on Nigerian/African
universities) can submit, browse, search, and fork final-year projects.

**Stack:** Vite + React + React Router + Tailwind CSS + Supabase (Database, Auth,
Storage, Realtime). Deploys to Vercel.

## Getting started

1. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key.
2. Run the SQL in `supabase/schema.sql` against your Supabase project (SQL Editor).
3. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

## Project structure

- `src/lib/supabaseClient.js` — shared Supabase client, reads keys from env vars.
- `src/pages/` — one component per route (see `src/App.jsx` for the route table).
- `src/components/` — shared UI pieces (navbar, etc.).
- `supabase/schema.sql` — tables, indexes, RLS policies, and the signup trigger.

This project is being built in phases; each page stub notes which phase fills it in.
