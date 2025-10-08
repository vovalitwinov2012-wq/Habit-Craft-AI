import type { VercelRequest, VercelResponse } from '@vercel/node';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method!=='GET') return res.status(405).json({ error:'Method not allowed' });
  const auth = req.headers['x-admin-secret'] || null;
  if (!ADMIN_SECRET || auth !== ADMIN_SECRET) return res.status(401).json({ error:'unauthorized' });
  try {
    const counters = await fetch(`${SUPABASE_URL}/rest/v1/analytics_counters`, { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }).then(r=>r.json()).catch(()=>[]);
    const events = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events?select=*&order=created_at.desc&limit=200`, { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }).then(r=>r.json()).catch(()=>[]);
    return res.status(200).json({ counters, events });
  } catch(e){ console.error(e); return res.status(500).json({ error:'internal' }) }
}
