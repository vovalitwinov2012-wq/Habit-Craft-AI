// Main Application
class HabitCraftApp {
    constructor() {
        this.isInitialized = false;
        console.log('🚀 HabitCraftApp constructor called');
    }

    async init() {
        try {
            console.log('🎯 Starting HabitCraft AI initialization...');
            
            // Wait for DOM to be fully ready
            await this.waitForDOM();
            console.log('✅ DOM is ready');
            
            // Initialize core components
            console.log('🔄 Initializing core components...');
            this.storage = new StorageManager();
            this.habitManager = new HabitManager();
            this.aiCoach = new AICoach();
            this.uiEngine = new UIEngine(this.habitManager, this.aiCoach);

            // Initialize UI Engine
            console.log('🔄 Initializing UI Engine...');
            this.uiEngine.init();

            // Initialize Telegram Web App
            console.log('🔄 Initializing Telegram WebApp...');
            this.initTelegram();

            this.isInitialized = true;
            console.log('🎉 HabitCraft AI initialized successfully!');
            
        } catch (error) {
            console.error('💥 Failed to initialize HabitCraft AI:', error);
        }
    }

    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                console.log('⏳ Waiting for DOM content loaded...');
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                console.log('⚡ DOM already ready');
                resolve();
            }
        });
    }

    initTelegram() {
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            try {
                Telegram.WebApp.ready();
                Telegram.WebApp.expand();
                console.log('✅ Telegram WebApp initialized successfully');
                
                // Set theme based on Telegram
                const theme = Telegram.WebApp.colorScheme;
                this.uiEngine.saveTheme(theme);
                this.uiEngine.applyTheme();
                console.log('🎨 Telegram theme applied:', theme);
                
            } catch (error) {
                console.warn('⚠️ Telegram Web App initialization failed:', error);
            }
        } else {
            console.log('ℹ️ Telegram WebApp not detected, running in standalone mode');
        }
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('💥 Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled promise rejection:', event.reason);
});

// Initialize the application when DOM is loaded
console.log('🎬 Starting HabitCraft AI application...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOMContentLoaded event fired');
    window.habitCraftApp = new HabitCraftApp();
    window.habitCraftApp.init().catch(error => {
        console.error('💥 App initialization failed:', error);
    });
});

// Fallback initialization for cases where DOMContentLoaded already fired
if (document.readyState !== 'loading') {
    console.log('⚡ DOM already ready, initializing immediately');
    window.habitCraftApp = new HabitCraftApp();
    window.habitCraftApp.init().catch(error => {
        console.error('💥 App initialization failed:', error);
    });
}