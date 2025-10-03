// Telegram WebApp Init Data для синхронизации
export function getTelegramUserId() {
  const initData = Telegram.WebApp.initDataUnsafe;
  return initData.user?.id || null;
}

export function saveData(key, value) {
  const userId = getTelegramUserId();
  if (!userId) {
    console.warn("No Telegram user ID found. Saving locally.");
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  // В реальной реализации: отправка на бота через API
  localStorage.setItem(`user-${userId}-${key}`, JSON.stringify(value));
}

export function loadData(key) {
  const userId = getTelegramUserId();
  if (!userId) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  const item = localStorage.getItem(`user-${userId}-${key}`);
  return item ? JSON.parse(item) : null;
}

export function formatDate(date) {
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}