const fetch = require('node-fetch');
module.exports = async (req, res) => {
  try{
    if(req.method !== 'POST') return res.status(405).send({error:'method'});
    const { messages = [], context = null } = req.body || {};
    const OPENROUTER = process.env.OPENROUTER_API_KEY;
    const payload = { model: 'deepseek/deepseek-chat-v3.1:free', messages: [{role:'system', content:'You are HabitCraft AI Coach. Provide analysis, 7-day plan and motivation.'}, ...(context?[{role:'system', content: 'HabitContext:'+JSON.stringify(context)}]:[]), ...messages], max_tokens:800, temperature:0.2 };
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer '+OPENROUTER }, body: JSON.stringify(payload) });
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || null;
    res.status(200).json({ message: content, raw: data });
  }catch(e){ console.error(e); res.status(500).json({ error: String(e) }) }
}
