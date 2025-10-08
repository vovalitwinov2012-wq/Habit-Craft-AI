import type { VercelRequest, VercelResponse } from '@vercel/node';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try{
    if (req.method!=='POST') return res.status(405).json({ error:'Method not allowed' });
    const { event_type, owner=null, metadata={} } = req.body || {};
    let storeOwner = null;
    if (owner && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(owner)}&select=consent_analytics`, { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
      if (r.ok) { const d = await r.json(); if (Array.isArray(d) && d[0] && d[0].consent_analytics===true) storeOwner = owner; }
    }
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, { method:'POST', headers:{ apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type':'application/json' }, body: JSON.stringify([{ event_type, owner: storeOwner, metadata }]) }).catch(()=>{});
    }
    return res.status(200).json({ ok:true });
  } catch(e){ console.error(e); return res.status(500).json({ error:'internal' }) }
}
