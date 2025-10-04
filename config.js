// config.js — конфигурация приложения
export const CONFIG = {
  APP_NAME: "HabitCraft AI",
  VERSION: "1.2.2",
  DEFAULT_THEME: "light",
  AI_API_URL: "/api/ai", // мы используем serverless-прокси на Vercel
  AI_MODEL: "deepseek/deepseek-chat-v3.1:free",
  AI_REQUESTS_PER_DAY: 5,
  STORAGE_KEYS: {
    HABITS: "habits",
    SETTINGS: "settings",
    STATS: "stats",
    AI_REQUESTS: "ai_requests",
    THEME: "theme"
  }
};

// Примечание: ключ не помещаем в клиент — используем serverless-прокси.
window.APP_CONFIG = window.APP_CONFIG || {};