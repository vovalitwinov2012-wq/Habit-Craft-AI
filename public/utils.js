export function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadData(key) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

export function formatDate(date) {
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}