// app.js — точка входа HabitCraft AI
import { CONFIG } from "./config.js";
import StorageManager from "./modules/storage.js";
import HabitManager from "./modules/habit-manager.js";
import AICoach from "./modules/ai-coach.js";
import UIEngine from "./modules/ui-engine.js";

class HabitCraftApp {
  async init() {
    await this.waitForDOM();
    await this.initTelegram();

    this.storage = new StorageManager();
    this.habitManager = new HabitManager();
    this.aiCoach = new AICoach();
    this.ui = new UIEngine(this.habitManager, this.aiCoach);

    this.ui.init();
    console.log("✅ HabitCraft AI инициализирован");
  }

  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", resolve);
      } else resolve();
    });
  }

  async initTelegram() {
    return new Promise((resolve) => {
      try {
        if (typeof Telegram !== "undefined" && Telegram.WebApp) {
          Telegram.WebApp.ready();
          Telegram.WebApp.expand();
          const theme = Telegram.WebApp.colorScheme || CONFIG.DEFAULT_THEME;
          document.documentElement.setAttribute("data-theme", theme);
          console.log("🤖 Telegram WebApp готов");
        } else {
          console.log("ℹ️ Запуск вне Telegram WebApp (browser mode)");
        }
      } catch (err) {
        console.warn("⚠️ Ошибка Telegram init:", err);
      } finally {
        resolve();
      }
    });
  }
}

new HabitCraftApp().init();