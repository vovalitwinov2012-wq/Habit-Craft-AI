const translations = {
  ru: {
    today: "Сегодня",
    habits: "Привычки",
    stats: "Статистика",
    profile: "Профиль",
    advice: "AI-совет",
    add_habit: "Добавить привычку",
    premium: "Премиум",
    streak: "Дней подряд: ",
    progress: "Прогресс: ",
    mood: "Настроение",
    focus_timer: "Таймер фокуса",
  },
  en: {
    today: "Today",
    habits: "Habits",
    stats: "Stats",
    profile: "Profile",
    advice: "AI Advice",
    add_habit: "Add Habit",
    premium: "Premium",
    streak: "Streak: ",
    progress: "Progress: ",
    mood: "Mood",
    focus_timer: "Focus Timer",
  },
};

let currentLang = localStorage.getItem("lang") || "ru";

export function t(key) {
  return translations[currentLang][key] || key;
}

export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  // Обновить интерфейс
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}