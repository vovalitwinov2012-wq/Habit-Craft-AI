// app.js — главный модуль приложения
// Импортируем модули как ES-модули

import { CONFIG } from './config.js';
import StorageManager from './modules/storage.js';
import HabitManager from './modules/habit-manager.js';
import AICoach from './modules/ai-coach.js';
import UIEngine from './modules/ui-engine.js';

// Обёртка инициализации приложения
class HabitCraftApp {
    constructor() {
        this.storage = null;
        this.habitManager = null;
        this.aiCoach = null;
        this.uiEngine = null;
    }

    async init() {
        try {
            await this._waitForDOM();

            this.storage = new StorageManager();
            this.habitManager = new HabitManager();
            this.aiCoach = new AICoach();
            this.uiEngine = new UIEngine(this.habitManager, this.aiCoach);

            // Инициализация UI
            this.uiEngine.init();

            // Инициализация Telegram WebApp (если доступно)
            this._initTelegram();

            console.log('✅ HabitCraft AI инициализирован');
        } catch (err) {
            console.error('Ошибка инициализации приложения', err);
        }
    }

    _waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => resolve());
            } else {
                resolve();
            }
        });
    }

    _initTelegram() {
        try {
            if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                Telegram.WebApp.ready();
                try { Telegram.WebApp.expand(); } catch (e) { /* ignore */ }
                const scheme = Telegram.WebApp.colorScheme || CONFIG.DEFAULT_THEME;
                this.uiEngine.saveTheme(scheme);
                this.uiEngine.applyTheme();
                console.log('Telegram WebApp detected');
            } else {
                console.log('Telegram WebApp не обнаружен — запущено в браузере');
            }
        } catch (e) {
            console.warn('Ошибка инициализации Telegram WebApp', e);
        }
    }
}

// Старт приложения
const app = new HabitCraftApp();
app.init().catch(err => console.error(err));

// Экспортируем для отладки в консоли, если нужно
export default app;