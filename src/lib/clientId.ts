export function getClientId(): string {
  const KEY = 'HABITCRAFT_CLIENT_ID';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch (e) {
    // fallback to timestamp based id
    return `fallback-${Date.now()}`;
  }
}
