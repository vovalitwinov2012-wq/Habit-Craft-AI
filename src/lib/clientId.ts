export function getClientId(): string { try{ let id = localStorage.getItem('HABITCRAFT_CLIENT_ID'); if(!id){ id = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`; localStorage.setItem('HABITCRAFT_CLIENT_ID', id); } return id }catch(e){ return `fallback-${Date.now()}` } }
export function getSyncOwner(){ try{ return localStorage.getItem('HABITCRAFT_SYNC_OWNER') }catch{return null} }
