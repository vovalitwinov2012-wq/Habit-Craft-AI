# Habit-Craft-AI

**Repository & Bot name:** Habit-Craft-AI

This archive contains a minimal but complete scaffold for the Habit-Craft-AI Telegram Web App + a small proxy backend for AI (OpenRouter) and for webhook handling.
**Important:** No API keys are included. Fill `.env` in `/backend` with your secrets.

## Structure

- `/backend` — Express-based server (webhook + AI proxy).
- `/frontend` — Vite + React + Tailwind Telegram Web App (SPA).
- `.gitignore`, `.env.example` — templates.

## Quick local run (development)

### Prerequisites
- Node.js 18+ and npm
- ngrok (optional) for exposing local webhook to Telegram for testing

### Steps

1. Install backend deps:
```bash
cd backend
npm install
```

2. Install frontend deps:
```bash
cd ../frontend
npm install
```

3. Create backend `.env` based on `.env.example`:
```
TELEGRAM_BOT_TOKEN=
OPENROUTER_API_KEY=
WEBHOOK_URL=   # your public reachable webhook, e.g. from ngrok or Vercel URL
```

4. Run backend (development):
```bash
cd ../backend
npm run dev
```

5. Run frontend (development):
```bash
cd ../frontend
npm run dev
```

6. Expose backend to internet (for Telegram webhook) using ngrok (optional):
```bash
npx ngrok http 3000
# copy NGROK URL and set WEBHOOK_URL accordingly, then set webhook:
curl -F "url=https://<ngrok-id>.ngrok.io/webhook" \
  https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook
```

## Deployment
- Deploy the frontend + backend to Vercel (recommended). Set environment variables there:
  - `OPENROUTER_API_KEY`
  - `TELEGRAM_BOT_TOKEN`
  - `WEBHOOK_URL` (your deployed URL + `/webhook`)

## Security
- Do **not** commit `.env` or API keys.
- The backend proxies AI requests so the client never contains the AI key.
- For storage syncing you can enable GitHub Gists or other storage; that is not included by default.

## Notes
This scaffold is intended as a starting point. It includes core files and a working flow for:
- Telegram init / basic Web App rendering
- Proxying OpenRouter AI model calls via backend
- Minimal habit UI and AI assistant widget

Customize further per your needs.
