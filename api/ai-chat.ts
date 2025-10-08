import type { VercelRequest, VercelResponse } from '@vercel/node';
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try{
    if (req.method!=='POST') return res.status(405).json({ error:'Method not allowed' });
    const { messages = [], habit = null } = req.body || {};
    const systemPrompt = `You are HabitCraft AI Coach. Help users form habits: analysis, 7-day plan, motivation, tracking suggestions.`;
    const payload = { model: "deepseek/deepseek-chat-v3.1:free", messages: [{ role:'system', content: systemPrompt }, ...(habit?[{role:'system', content:'HabitContext:'+JSON.stringify(habit)}]:[]), ...messages], max_tokens:800, temperature:0.2 };
    const resp = await fetch(OPENROUTER_API_URL, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${OPENROUTER_API_KEY}` }, body: JSON.stringify(payload) });
    if(!resp.ok){ const text = await resp.text(); return res.status(502).json({ error:'ai_provider_error', detail: text }) }
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? null;
    return res.status(200).json({ message: content, raw: data });
  } catch(e){ console.error(e); return res.status(500).json({ error:'internal', detail: String(e) }) }
}
