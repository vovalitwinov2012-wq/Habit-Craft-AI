import { supabase } from '@/integrations/supabase/client'
import { getClientId, getSyncOwner } from '@/lib/clientId'

export async function loadHabits(){ const owner = getSyncOwner() || getClientId(); const { data } = await supabase.from('habits').select('*').eq('owner', owner).order('updated_at',{ascending:false}); return data||[] }
export async function saveHabits(habits:any[]){ const owner = getSyncOwner() || getClientId(); const rows = habits.map(h=>({ id:h.id, owner, title:h.title, completed_dates:h.completedDates||[], goal:h.goal||7, updated_at: new Date().toISOString() })); await supabase.from('habits').upsert(rows,{onConflict:'id'}); try{ localStorage.setItem('habitcraft_habits_local', JSON.stringify(habits)) }catch{} }
export async function createSyncCode(){ const owner = getClientId(); const code='HC-'+Math.random().toString(36).slice(2,8).toUpperCase(); await supabase.from('users').upsert({ id: owner, metadata: { syncCode: code } }, { onConflict: 'id' }); return code }
export async function linkBySyncCode(code:string){ const { data } = await supabase.from('users').select('id, metadata').ilike('metadata->>syncCode', code).maybeSingle(); if(!data) throw new Error('not found'); localStorage.setItem('HABITCRAFT_SYNC_OWNER', data.id); return data.id }
