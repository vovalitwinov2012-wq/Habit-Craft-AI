// api/ai.js — Vercel serverless function (Node 20 runtime)
// Использует process.env.OPENROUTER_API_KEY — добавьте в Vercel Environment Variables.

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
    const raw = (req.body && Object.keys(req.body).length) ? req.body : JSON.parse(await getRawBody(req));
    const { type = 'advice', message = '' } = raw;

    const messages = type === 'habit_generation'
      ? [
          { role: 'system', content: 'Ты эксперт по привычкам. Верни ТОЛЬКО JSON в определённом формате.'},
          { role: 'user', content: `Создай привычку по описанию: "${String(message)}"` }
        ]
      : [
          { role: 'system', content: 'Ты AI-коуч по привычкам. Дай короткий, поддерживающий совет на русском.'},
          { role: 'user', content: String(message) }
        ];

    const requestBody = {
      model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3.1:free',
      messages,
      max_tokens: type === 'habit_generation' ? 500 : 300,
      temperature: 0.7
    };

    const r = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(requestBody)
    });

    if (!r.ok) {
      const t = await r.text().catch(()=>'');
      res.status(502).json({ success: false, message: 'AI provider error', details: t });
      return;
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? JSON.stringify(data);

    if (type === 'habit_generation') {
      try {
        const cleaned = content.replace(/```json|```/g, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        const json = match ? JSON.parse(match[0]) : null;
        if (json) { res.status(200).json({ success: true, habit: json }); return; }
      } catch (e) { /* fallthrough */ }
      res.status(200).json({ success: true, habitRaw: content });
      return;
    }

    res.status(200).json({ success: true, answer: content });
  } catch (err) {
    console.error('AI proxy error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: String(err) });
  }
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', err => reject(err));
  });
}