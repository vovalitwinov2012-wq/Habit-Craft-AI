// Main Application
class HabitCraftApp {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('🚀 Initializing HabitCraft AI...');
            
            // Wait for DOM to be fully ready
            await this.waitForDOM();
            
            // Initialize core components
            this.storage = new StorageManager();
            this.habitManager = new HabitManager();
            this.aiCoach = new AICoach();
            this.analytics = new Analytics();
            this.uiEngine = new UIEngine(this.habitManager, this.aiCoach);

            // Initialize UI Engine
            this.uiEngine.init();

            // Initialize Telegram Web App
            this.initTelegram();

            // Track app launch
            this.analytics.trackAppLaunch();

            this.isInitialized = true;
            console.log('✅ HabitCraft AI initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize HabitCraft AI:', error);
        }
    }

    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    initTelegram() {
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            try {
                Telegram.WebApp.ready();
                Telegram.WebApp.expand();
                console.log('✅ Telegram WebApp initialized');
            } catch (error) {
                console.warn('⚠️ Telegram Web App initialization failed:', error);
            }
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.habitCraftApp = new HabitCraftApp();
    window.habitCraftApp.init();
});