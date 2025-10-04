// config.js — глобальная конфигурация приложения
// Комментарии на русском

export const CONFIG = {
  APP_NAME: 'HabitCraft AI',
  VERSION: '1.0.0',
  MAX_FREE_HABITS: 10,
  MAX_PREMIUM_HABITS: 50,
  AI_REQUESTS_PER_DAY: 5,
  AI_MODEL: "deepseek/deepseek-chat-v3.1:free",
  AI_API_URL: "https://openrouter.ai/api/v1/chat/completions",
  ENABLE_AI: true,
  ENABLE_ANALYTICS: false,
  ENABLE_PREMIUM: false,
  DEFAULT_THEME: 'light',
  ANIMATION_DURATION: 300,
  STORAGE_KEYS: {
    HABITS: 'habits',
    SETTINGS: 'settings',
    STATS: 'stats',
    AI_REQUESTS: 'ai_requests'
  }
};

// Экспортим также глобально (для старого кода/инспекции)
window.CONFIG = window.CONFIG || {};
window.CONFIG._LOCAL = window.CONFIG._LOCAL || CONFIG;
console.log('✅ CONFIG загружен', CONFIG.APP_NAME);