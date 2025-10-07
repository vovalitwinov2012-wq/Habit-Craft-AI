SECURITY & DEPLOY NOTES

- Removed references to third-party 'Lovable' branding and API keys.
- Replaced LOVABLE_API_KEY usage with OPENROUTER_API_KEY placeholder. Configure OPENROUTER_API_KEY in Vercel environment variables.
- Sensitive files (.env) are listed in .gitignore. Do NOT commit real keys to the repository.
- Storage: Implemented a Telegram-only storage module (best-effort); note Telegram Bot API lacks native key-value storage — consider encrypted external DB for production.
- Deployment: Vercel recommended; ensure BOT_TOKEN and OPENROUTER_API_KEY stored in Vercel project env variables.


SUPABASE INTEGRATION

- Added `supabaseService.ts` in `src/services/` for saving/loading habits from Supabase.
- Migration SQL created in `supabase/migrations/001_create_tables.sql`.
- Frontend now attempts to sync habits with Supabase using the client anon key; client identity is created locally and stored in localStorage as HABITCRAFT_CLIENT_ID.
