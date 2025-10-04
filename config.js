// config.js — конфигурация приложения HabitCraft AI

export const CONFIG = {
    APP_NAME: 'HabitCraft AI',
    VERSION: '1.2.0',
    DEFAULT_THEME: 'light',
    AI_API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    AI_MODEL: 'deepseek/deepseek-chat-v3.1:free',
    AI_REQUESTS_PER_DAY: 10,
    STORAGE_KEYS: {
        HABITS: 'habits',
        SETTINGS: 'settings',
        AI_REQUESTS: 'ai_requests'
    }
};

// Прокидываем ключ из переменных окружения Vercel (build-time)
window.__ENV__ = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || null
};