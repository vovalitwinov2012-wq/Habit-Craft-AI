const KEY = 'HABITCRAFT_CLIENT_ID';
const SYNC_KEY = 'HABITCRAFT_SYNC_OWNER';

export function getClientId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch (e) {
    return `fallback-${Date.now()}`;
  }
}

export function setSyncOwner(ownerId: string) {
  try { localStorage.setItem(SYNC_KEY, ownerId); } catch {}
}

export function getSyncOwner(): string | null {
  try { return localStorage.getItem(SYNC_KEY); } catch { return null; }
}
