const { handleMessage } = require('./habitController');
const { sendAIMessage } = require('./aiService');

async function readRequestBody(req) {
  if (req.body) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  try { return raw ? JSON.parse(raw) : {}; } catch { return raw; }
}

module.exports = async function handler(req, res) {
  try {
    const url = (req.url || '').split('?')[0];
    const method = req.method || 'GET';

    if (method === 'GET' && (url === '/api/health' || url === '/health')) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (method === 'POST' && (url === '/api/ai' || url === '/ai')) {
      const body = await readRequestBody(req);
      const prompt = (body && body.prompt) ? String(body.prompt) : '';
      if (!prompt) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing prompt' }));
        return;
      }

      try {
        const aiReply = await sendAIMessage(prompt);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: aiReply }));
      } catch (error) {
        console.error('AI error:', error?.response?.data || error?.message || error);
        const fallback = 'AI service is unavailable right now. Please try again later.';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: fallback }));
      }
      return;
    }

    if (method === 'POST' && (url === '/api/webhook' || url === '/webhook')) {
      const body = await readRequestBody(req);
      await handleMessage(body);
      res.statusCode = 200;
      res.end('OK');
      return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not Found' }));
  } catch (e) {
    console.error('Handler error:', e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};
