import { supabase } from '@/integrations/supabase/client'
import { getClientId, getSyncOwner, setSyncOwner } from '@/lib/clientId'

const STORAGE_KEY = 'habitcraft_habits_local'

export async function loadHabits(){
  const owner = getSyncOwner() || getClientId();
  try {
    const { data, error } = await supabase.from('habits').select('*').eq('owner', owner).order('updated_at', {ascending:false});
    if (error) throw error;
    return (data||[]).map((d:any)=>({ id:d.id, title:d.title, quote:d.quote, color:d.color, completedDates:d.completed_dates||[], completedDays:d.completed_days||0, totalDays:d.total_days||1, goal:d.goal, createdAt:d.created_at, updatedAt:d.updated_at }))
  } catch(e){
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw?JSON.parse(raw):[] } catch { return [] }
  }
}

export async function saveHabits(habits:any[]){
  const owner = getSyncOwner() || getClientId();
  const rows = habits.map(h=>({ id:h.id, owner, title:h.title, quote:h.quote||null, color:h.color||null, completed_days:h.completedDays||0, total_days:h.totalDays||1, completed_dates:h.completedDates||[], category:h.category||null, goal:h.goal||null, reminder:h.reminder||null, created_at:h.createdAt||new Date().toISOString(), updated_at:new Date().toISOString() }));
  try {
    const { data, error } = await supabase.from('habits').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); }catch{}
    return data;
  } catch(e){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); }catch{}
    return null;
  }
}

export function mergeByLatest(local:any[], remote:any[]){
  const map = new Map();
  (local||[]).forEach(h=>map.set(h.id, h));
  (remote||[]).forEach(r=>{ const localH = map.get(r.id); if(!localH) map.set(r.id,r); else { const lt = new Date(localH.updatedAt||0).getTime(); const rt = new Date(r.updatedAt||r.updated_at||0).getTime(); if(rt>=lt) map.set(r.id, r); } });
  return Array.from(map.values());
}

export async function syncHabits(localHabits:any[]){
  const remote = await loadHabits();
  const merged = mergeByLatest(localHabits, remote);
  await saveHabits(merged);
  return merged;
}

export async function createSyncCode(){
  const owner = getClientId();
  const syncCode = 'HC-'+Math.random().toString(36).slice(2,8).toUpperCase();
  await supabase.from('users').upsert({ id: owner, metadata: { syncCode } }, { onConflict: 'id' });
  return syncCode;
}

export async function linkBySyncCode(code:string){
  const { data, error } = await supabase.from('users').select('id, metadata').ilike('metadata->>syncCode', code).maybeSingle();
  if(error) throw error;
  if(!data) throw new Error('not found');
  setSyncOwner(data.id);
  return data.id;
}

export async function setPremiumForOwner(ownerId:string, isPremium:boolean){
  await supabase.from('users').upsert({ id: ownerId, is_premium: isPremium }, { onConflict: 'id' });
  return true;
}

export async function logAnalytics(eventType:string, metadata:any={}, ownerId:string|null=null){
  try{ await fetch('/api/analytics', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event_type: eventType, owner: ownerId, metadata }) }) }catch(e){ console.warn('analytics failed', e) }
}
