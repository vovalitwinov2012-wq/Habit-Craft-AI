// app.js — главный модуль (ES module)
// Инициализация приложения: связываем manager + ai + ui, и Telegram WebApp

import { CONFIG } from './config.js';
import StorageManager from './modules/storage.js';
import HabitManager from './modules/habit-manager.js';
import AICoach from './modules/ai-coach.js';
import UIEngine from './modules/ui-engine.js';

class HabitCraftApp {
  constructor() {
    this.storage = null;
    this.habitManager = null;
    this.aiCoach = null;
    this.uiEngine = null;
  }

  async init() {
    await this._waitForDOM();
    await this._initTelegramIfPresent();

    // Инициализация модулей
    this.storage = new StorageManager();
    this.habitManager = new HabitManager();
    this.aiCoach = new AICoach();
    this.uiEngine = new UIEngine(this.habitManager, this.aiCoach);

    // Запускаем UI
    this.uiEngine.init();

    // Для отладки в консоли
    window.habitCraftApp = {
      storage: this.storage,
      habitManager: this.habitManager,
      aiCoach: this.aiCoach,
      uiEngine: this.uiEngine
    };

    console.log('✅ HabitCraftApp инициализирован');
  }

  _waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => resolve());
      } else resolve();
    });
  }

  _initTelegramIfPresent() {
    return new Promise(resolve => {
      try {
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
          Telegram.WebApp.ready();
          try { Telegram.WebApp.expand(); } catch (e) { /* ignore */ }
          const theme = Telegram.WebApp.colorScheme || CONFIG.DEFAULT_THEME;
          // Передаём тему UIEngine может переопределить
          document.documentElement.setAttribute('data-theme', theme);
          console.log('Telegram WebApp обнаружен, тема:', theme);
        } else {
          console.log('Telegram WebApp не обнаружен — режим браузера');
        }
      } catch (e) {
        console.warn('Ошибка инициализации Telegram.WebApp', e);
      } finally {
        resolve();
      }
    });
  }
}

const app = new HabitCraftApp();
app.init().catch(err => console.error('Ошибка инициализации приложения', err));

export default app;