// app.client.js — главный клиентский класс приложения
// Экспорт по умолчанию, импортируется в index.html и рендерит SPA в контейнер mount.

import { StorageManager } from './modules/storage.js';
import { HabitManager } from './modules/habit-manager.js';
import { AICoach } from './modules/ai-coach.js';
import { UIEngine } from './modules/ui-engine.js';
import { CONFIG } from './config.js';

export default class App {
  constructor({ mount }) {
    this.mount = mount;
    this.storage = new StorageManager();
    this.habitManager = new HabitManager(this.storage);
    this.aiCoach = new AICoach(this.storage);
    this.ui = new UIEngine({
      mount: this.mount,
      habitManager: this.habitManager,
      aiCoach: this.aiCoach,
      config: CONFIG,
      storage: this.storage
    });
    console.log('🚀 App constructed');
  }

  async init() {
    try {
      // Рендер основной разметки и инициализация UI
      this.ui.renderShell();
      await this.ui.init(); // внутри UIEngine — setup listeners и initial render
      console.log('🎉 Приложение инициализировано');
      this.initTelegramIntegration();
    } catch (err) {
      console.error('Ошибка инициализации приложения', err);
      // Простое уведомление пользователю:
      this.mount.innerHTML = `<div class="fatal">Ошибка инициализации: ${this.escapeHtml(err.message || err)}</div>`;
    }
  }

  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[m]));
  }

  initTelegramIntegration() {
    try {
      if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand?.();
        const color = Telegram.WebApp.colorScheme || 'light';
        this.ui.applyTheme(color === 'dark' ? 'dark' : 'light');
        console.log('✅ Telegram WebApp integrated');
      } else {
        console.log('ℹ️ Telegram WebApp не найдена — standalone режим');
      }
    } catch (e) {
      console.warn('⚠️ Ошибка интеграции Telegram', e);
    }
  }
}