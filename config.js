// Configuration for HabitCraft AI
const CONFIG = {
    // App Settings
    APP_NAME: 'HabitCraft AI',
    VERSION: '1.0.0',
    
    // Habit Limits
    MAX_FREE_HABITS: 10,
    MAX_PREMIUM_HABITS: 50,
    
    // AI Settings
    AI_REQUESTS_PER_DAY: 5,
    AI_MODEL: "deepseek/deepseek-chat-v3.1:free",
    AI_API_URL: "https://openrouter.ai/api/v1/chat/completions",
    
    // Feature Flags
    ENABLE_AI: true,
    ENABLE_ANALYTICS: true,
    ENABLE_PREMIUM: false,
    
    // UI Settings
    DEFAULT_THEME: 'light',
    ANIMATION_DURATION: 300,
    
    // Storage Keys
    STORAGE_KEYS: {
        HABITS: 'habits',
        SETTINGS: 'settings',
        STATS: 'stats',
        AI_REQUESTS: 'ai_requests'
    }
};

// Initialize global APP_CONFIG for API keys
window.APP_CONFIG = window.APP_CONFIG || {
    OPENROUTER_API_KEY: null
};