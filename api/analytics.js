const fetch = require('node-fetch');
module.exports = async (req,res)=>{
  try{
    if(req.method!=='POST') return res.status(405).send({error:'method'});
    const { event_type, owner=null, metadata={} } = req.body || {};
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(SUPABASE_URL && SERVICE){
      await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, { method:'POST', headers:{ apikey: SERVICE, Authorization: 'Bearer '+SERVICE, 'Content-Type':'application/json' }, body: JSON.stringify([{ event_type, owner, metadata }]) }).catch(()=>{});
    }
    res.status(200).json({ ok:true });
  }catch(e){ res.status(500).json({ error: String(e) }) }
}
