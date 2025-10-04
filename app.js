// Main Application
class HabitCraftApp {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        try {
            // Initialize core components
            this.storage = new StorageManager();
            this.habitManager = new HabitManager();
            this.aiCoach = new AICoach();
            this.analytics = new Analytics();
            this.uiEngine = new UIEngine(this.habitManager, this.aiCoach);

            // Initialize Telegram Web App
            this.initTelegram();

            // Track app launch
            this.analytics.trackAppLaunch();

            // Set up global error handling
            this.setupErrorHandling();

            this.isInitialized = true;
            console.log('🚀 HabitCraft AI initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize HabitCraft AI:', error);
        }
    }

    initTelegram() {
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            try {
                Telegram.WebApp.ready();
                Telegram.WebApp.expand();
                
                // Set theme based on Telegram
                const theme = Telegram.WebApp.colorScheme;
                this.uiEngine.saveTheme(theme);
                this.uiEngine.applyTheme();
                
            } catch (error) {
                console.warn('Telegram Web App initialization failed:', error);
            }
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.habitCraftApp = new HabitCraftApp();
    window.habitCraftApp.init();
});