// api/ai.js — Vercel serverless function proxy for OpenRouter (or any compatible provider)
// Использует process.env.OPENROUTER_API_KEY (добавьте в Vercel Project Settings)
// Node 18 имеет глобальный fetch — мы его используем.

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ success: false, message: 'AI API key not configured on server' });
    return;
  }

  try {
    const body = (req.body && Object.keys(req.body).length) ? req.body : JSON.parse(await getRawBody(req));
    const { type = 'advice', message = '', preferences = {}, context = {} } = body;

    let messages;
    if (type === 'habit_generation') {
      messages = [
        {
          role: 'system',
          content: `Ты эксперт по формированию привычек. Верни ТОЛЬКО JSON-объект в формате:
{
  "name": "Название привычки (2-4 слова)",
  "description": "Короткое мотивирующее описание",
  "color": "#4CAF50",
  "frequency": "daily",
  "motivationTips": ["Совет 1","Совет 2"]
}`
        },
        { role: 'user', content: `Создай привычку по описанию: "${String(message)}"` }
      ];
    } else {
      messages = [
        { role: 'system', content: 'Ты AI-коуч по привычкам. Дай короткий поддерживающий совет (2-3 предложения). Отвечай на русском.' },
        { role: 'user', content: String(message) }
      ];
    }

    const requestBody = {
      model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3.1:free',
      messages,
      max_tokens: type === 'habit_generation' ? 500 : 300,
      temperature: 0.7
    };

    const r = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      res.status(502).json({ success: false, message: 'AI provider error', details: text });
      return;
    }

    const data = await r.json();
    let content = '';

    if (data?.choices && Array.isArray(data.choices) && data.choices[0]?.message) {
      content = data.choices[0].message.content;
    } else {
      content = typeof data === 'string' ? data : JSON.stringify(data);
    }

    if (type === 'habit_generation') {
      try {
        const cleaned = content.replace(/```json|```/g, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        const json = match ? JSON.parse(match[0]) : null;
        if (json) {
          res.status(200).json({ success: true, habit: json });
          return;
        }
      } catch (err) {
        // fallthrough to returning raw content
      }
      res.status(200).json({ success: true, habitRaw: content });
      return;
    } else {
      res.status(200).json({ success: true, answer: content });
      return;
    }
  } catch (err) {
    console.error('AI proxy error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: String(err) });
  }
};

// Вспомогательная функция для чтения сырого тела запроса (если нужно)
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', err => reject(err));
  });
}