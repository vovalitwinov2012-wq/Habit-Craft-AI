// Main Application Entry Point
class HabitCraftApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Initialize core components
            this.storage = new StorageManager();
            this.habitManager = new HabitManager();
            this.aiCoach = new AICoach();
            this.analytics = new Analytics();
            this.uiEngine = new UIEngine(this.habitManager, this.aiCoach);

            // Initialize Telegram Web App if available
            this.initTelegram();

            // Track app launch
            this.analytics.trackAppLaunch();

            // Set up global error handling
            this.setupErrorHandling();

            // Mark as initialized
            this.isInitialized = true;

            console.log('🚀 HabitCraft AI initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize HabitCraft AI:', error);
            this.showFatalError(error);
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
                
                // Set up back button
                Telegram.WebApp.BackButton.onClick(() => {
                    this.uiEngine.closeModals();
                });
                
                console.log('Telegram Web App initialized');
                
            } catch (error) {
                console.warn('Telegram Web App initialization failed:', error);
            }
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.analytics.trackError(event.error, {
                type: 'window_error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.analytics.trackError(new Error('Unhandled Promise Rejection'), {
                reason: event.reason
            });
        });
    }

    showFatalError(error) {
        const errorHtml = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: var(--bg-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
                text-align: center;
            ">
                <div>
                    <div style="font-size: 48px; margin-bottom: 20px;">😔</div>
                    <h2 style="color: var(--text-primary); margin-bottom: 10px;">Что-то пошло не так</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">
                        Приложение столкнулось с ошибкой. Пожалуйста, обновите страницу.
                    </p>
                    <button onclick="window.location.reload()" style="
                        background: var(--primary);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">
                        Обновить приложение
                    </button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = errorHtml;
    }

    // Public methods for debugging
    getDebugInfo() {
        return {
            initialized: this.isInitialized,
            habits: this.habitManager.habits.length,
            aiUsage: this.aiCoach.getUsageStats(),
            storage: this.storage.getStorageInfo(),
            analytics: this.analytics.getStats()
        };
    }

    // Reset app data (for testing)
    resetApp() {
        if (confirm('ВНИМАНИЕ: Это удалит все ваши данные. Продолжить?')) {
            this.storage.clearUserData();
            window.location.reload();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.habitCraftApp = new HabitCraftApp();
});

// Add some CSS for animations
const additionalStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

@keyframes celebrate {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 0; }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);