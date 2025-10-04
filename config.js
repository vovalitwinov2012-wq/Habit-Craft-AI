// config.js — конфигурация приложения (экспортируется как ES-модуль)
// Комментарии на русском.

export const CONFIG = {
    APP_NAME: 'HabitCraft AI',
    VERSION: '1.1.0',
    
    // Ограничения бесплатной версии
    MAX_FREE_HABITS: 20,
    MAX_PREMIUM_HABITS: 200,
    
    // AI
    AI_REQUESTS_PER_DAY: 5,
    AI_MODEL: "deepseek/deepseek-chat-v3.1:free",
    AI_API_URL: "https://openrouter.ai/api/v1/chat/completions",
    
    // Флаги
    ENABLE_AI: true,
    ENABLE_PREMIUM: true,
    ENABLE_ANALYTICS: false,
    
    // UI
    DEFAULT_THEME: 'light',
    ANIMATION_DURATION: 300,
    
    // Ключи хранилища
    STORAGE_KEYS: {
        HABITS: 'habits',
        SETTINGS: 'settings',
        STATS: 'stats',
        AI_REQUESTS: 'ai_requests',
        THEME: 'theme'
    }
};

// Глобальная точка для конфиденциальных данных (например, ключ API)
// Задавай window.APP_CONFIG.OPENROUTER_API_KEY до загрузки приложения, если хочешь использовать реальный AI.
// Пример:
// <script>window.APP_CONFIG = { OPENROUTER_API_KEY: 'sk-xxxx' }</script>
window.APP_CONFIG = window.APP_CONFIG || { OPENROUTER_API_KEY: null };