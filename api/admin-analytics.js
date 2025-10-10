const fetch = require('node-fetch');
module.exports = async (req,res)=>{
  try{
    const ADMIN = process.env.ADMIN_SECRET;
    const auth = req.headers['x-admin-secret'] || '';
    if(!ADMIN || auth !== ADMIN) return res.status(401).json({ error:'unauthorized' });
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const counters = await fetch(`${SUPABASE_URL}/rest/v1/analytics_counters`, { headers:{ apikey: SERVICE, Authorization: 'Bearer '+SERVICE } }).then(r=>r.json()).catch(()=>[]);
    const events = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events?select=*&order=created_at.desc&limit=200`, { headers:{ apikey: SERVICE, Authorization: 'Bearer '+SERVICE } }).then(r=>r.json()).catch(()=>[]);
    res.json({ counters, events });
  }catch(e){ res.status(500).json({ error: String(e) }) }
}
