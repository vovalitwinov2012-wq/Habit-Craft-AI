# HabitCraft AI - Ready project (minimal premium)

This project is a ready-to-deploy Vite + React + TypeScript project with:

- Supabase integration (frontend client + server endpoints)
- AI Coach (OpenRouter deepseek model) via serverless api/ai-chat.ts
- Admin analytics endpoints (protected by ADMIN_SECRET)
- Premium mode, Sync Code, consent-based analytics
- Bilingual UI (English and Russian) with switcher on main page

**Important:** Set environment variables in Vercel (or .env for local dev):
- OPENROUTER_API_KEY (server-side)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (server-side)
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- ADMIN_SECRET

Run locally:
```
npm install
npm run dev
```

Apply Supabase migration using SQL editor or CLI:
`supabase/migrations/001_create_tables.sql`.
