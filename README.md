# Habit Craft AI

A Telegram bot and web application for building better habits with AI assistance.

## Features

- 🤖 AI-powered habit advice using OpenRouter API
- 📱 Telegram bot integration
- 🌐 Web interface
- 🌍 Multi-language support (English/Russian)
- 📊 Habit tracking and management

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory with:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-app.vercel.app/api/webhook

# AI Service Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 2. Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Set the webhook URL to `https://your-app.vercel.app/api/webhook`

### 3. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy

### 4. Setup Webhook (Optional)

After deployment, you can set up the webhook automatically:

```bash
cd backend
npm run setup-webhook
```

## Usage

### Telegram Bot Commands

- `/start` or `/help` - Show help message
- `/new <name>` - Add new habit
- `/list` - Show all habits
- `/done <number>` - Mark habit as done/pending
- `/delete <number>` - Delete habit
- `/ai <question>` - Ask AI advisor

### Web Interface

Visit your deployed app to use the web interface with the same functionality.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/ai` - AI chat endpoint
- `POST /api/webhook` - Telegram webhook

## Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```