const fetch = require('node-fetch');

async function askAI(prompt, OPENROUTER_API_KEY) {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not provided');
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat-v3.1:free',
      messages: [
        { role: 'system', content: 'You are a helpful habit coach.' },
        { role: 'user', content: prompt }
      ]
    })
  });
  const data = await r.json();
  return data;
}

module.exports = { askAI };
