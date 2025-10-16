/**
 * Minimal Express server for Habit-Craft-AI
 * - /webhook  -> Telegram webhook receiver (basic)
 * - /api/openrouter -> proxy to OpenRouter AI (keeps key secret)
 *
 * NOTE: This is a small scaffold. Add validation and security checks for production.
 */

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

app.get('/', (req, res) => {
  res.send('Habit-Craft-AI backend is running.');
});

// Telegram webhook receiver (basic)
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    // For simplicity we handle messages with text "ai: ..." and "start"
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      if (text.toLowerCase().startsWith('ai:')) {
        const prompt = text.substring(3).trim();
        const aiResp = await askAI(prompt);
        // send message back
        await sendTelegramMessage(chatId, aiResp);
      } else if (text === '/start') {
        await sendTelegramMessage(body.message.chat.id, "Welcome to Habit-Craft-AI! Send 'ai: <your question>' to ask the AI coach.");
      } else {
        await sendTelegramMessage(chatId, "Echo: " + text + "\nTip: prefix your message with 'ai:' to ask the AI coach.");
      }
    }
    res.status(200).send('ok');
  } catch (err) {
    console.error('webhook error', err);
    res.status(200).send('ok');
  }
});

// Proxy to OpenRouter AI
app.post('/api/openrouter', async (req, res) => {
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
  }

  const body = req.body;
  if (!body || !body.messages) {
    return res.status(400).json({ error: 'missing messages in body' });
  }

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.WEBHOOK_URL || ''
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: body.messages
      })
    });

    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('openrouter proxy err', err);
    return res.status(500).json({ error: 'proxy error' });
  }
});

async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not set; skipping send');
    return;
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

// helper askAI used in webhook and available for direct calls
async function askAI(prompt) {
  if (!OPENROUTER_API_KEY) return "AI key not configured on server.";
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          { role: 'system', content: 'You are a helpful habit coach. Answer concisely in the user language.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || JSON.stringify(data);
    return content;
  } catch (err) {
    console.error('askAI err', err);
    return 'AI error';
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Backend listening on port', PORT);
});
