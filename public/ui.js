import { setLanguage } from "./i18n.js";
import { addHabit, renderTodayHabits } from "./habit-tracker.js";
import { getAICoachAdvice } from "./ai-coach.js";

export function setupUI() {
  // Переключение языка
  document.getElementById("lang-ru").addEventListener("click", () => {
    setLanguage("ru");
  });

  document.getElementById("lang-en").addEventListener("click", () => {
    setLanguage("en");
  });

  // Переключение табов
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const tabId = btn.id.replace("tab-", "");
      document.getElementById(`tab-${tabId}-content`).classList.add("active");

      if (tabId === "today") {
        getAICoachAdvice();
        renderTodayHabits();
      }
    });
  });

  // Кнопка добавления привычки
  document.getElementById("add-habit-btn").addEventListener("click", () => {
    const name = prompt("Название привычки:");
    if (name) addHabit(name);
  });

  // Кнопка премиума
  document.getElementById("premium-upgrade").addEventListener("click", () => {
    Telegram.WebApp.showAlert("Премиум будет подключён через Telegram Payments.");
  });
}