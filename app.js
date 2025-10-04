// app.js — точка входа приложения HabitCraft AI
// Исправлено: ждет готовности Telegram WebApp и DOM перед запуском
import { CONFIG } from './config.js';
import StorageManager from './modules/storage.js';
import HabitManager from './modules/habit-manager.js';
import AICoach from './modules/ai-coach.js';
import UIEngine from './modules/ui-engine.js';

class HabitCraftApp {
    constructor() {
        this.initialized = false;
    }

    async init() {
        await this.waitForDOM();

        // Telegram WebApp ready
        await this.initTelegram();

        // Инициализация сервисов
        this.storage = new StorageManager();
        this.habitManager = new HabitManager();
        this.aiCoach = new AICoach();
        this.ui = new UIEngine(this.habitManager, this.aiCoach);

        // Запуск UI
        this.ui.init();
        this.initialized = true;

        console.log('✅ HabitCraft AI запущен');
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

    async initTelegram() {
        return new Promise((resolve) => {
            try {
                if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                    Telegram.WebApp.ready();
                    Telegram.WebApp.expand();

                    const theme = Telegram.WebApp.colorScheme || CONFIG.DEFAULT_THEME;
                    document.documentElement.setAttribute('data-theme', theme);
                    console.log('🤖 Telegram WebApp готов, тема:', theme);
                } else {
                    console.log('Запуск вне Telegram WebApp (браузерный режим)');
                }
            } catch (err) {
                console.warn('Ошибка Telegram WebApp init', err);
            } finally {
                resolve();
            }
        });
    }
}

// Запускаем приложение
const app = new HabitCraftApp();
app.init().catch(console.error);

export default app;