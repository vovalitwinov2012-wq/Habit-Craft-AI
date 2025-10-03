import { t, setLanguage } from "./i18n.js";
import { getAICoachAdvice, generateHabitTrackerFromAI } from "./ai-coach.js";
import { addHabit, getHabits, updateHabitProgress, deleteHabit, resetHabitProgress } from "./habit-tracker.js";
import { renderHabitCalendar } from "./calendar.js";
import { loadData, saveData, getTodayKey } from "./utils.js";

let currentHabitForStats = null;

export function setupUI() {
  // Переключение языка
  document.getElementById("lang-switch").addEventListener("click", () => {
    const newLang = localStorage.getItem("lang") === "ru" ? "en" : "ru";
    setLanguage(newLang);
    renderHabits();
  });

  // Кнопка добавления
  document.getElementById("add-habit-btn").addEventListener("click", () => {
    openAddHabitModal();
  });

  // Отправка AI
  document.getElementById("ai-submit").addEventListener("click", async () => {
    const input = document.getElementById("ai-input");
    const content = input.value.trim();
    if (!content) return;

    const response = await getAICoachAdvice(content);
    document.getElementById("ai-response").textContent = response;

    // Если AI сгенерировал трекер
    if (content.toLowerCase().includes("привычка") || content.toLowerCase().includes("habit")) {
      const tracker = await generateHabitTrackerFromAI(content);
      if (tracker) {
        openAddHabitModal(tracker);
      }
    }
  });

  // Закрытие модалки
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });
}

function openAddHabitModal(preData = null) {
  const modal = document.getElementById("modal-overlay");
  const body = document.getElementById("modal-body");
  const title = document.getElementById("modal-title");

  title.textContent = t("add_habit");
  body.innerHTML = `
    <label>${t("habit_name")}<input type="text" id="habit-name" value="${preData?.name || ''}"></label>
    <label>${t("habit_motivation")}
      <textarea id="habit-motivation">${preData?.motivation || ''}</textarea>
      <button id="ai-motivate-btn">${t("ai_generate")}</button>
    </label>
    <label>${t("repeat")}
      <select id="habit-repeat">
        <option value="daily" ${preData?.repeat === 'daily' ? 'selected' : ''}>${t("daily")}</option>
        <option value="weekly" ${preData?.repeat === 'weekly' ? 'selected' : ''}>${t("weekly")}</option>
        <option value="custom" ${preData?.repeat === 'custom' ? 'selected' : ''}>${t("custom")}</option>
      </select>
      <div id="custom-repeat" style="display: ${preData?.repeat === 'custom' ? 'block' : 'none'};">
        <input type="number" id="custom-times" min="1" max="7" value="${preData?.customFrequency?.times || 1}"> ${t("times")}
        <input type="number" id="custom-days" min="1" max="365" value="${preData?.customFrequency?.days || 7}"> ${t("days")}
      </div>
    </label>
    <label>${t("choose_color")}
      <div class="color-picker">
        <span class="color-option" style="background: var(--yellow);" data-color="yellow"></span>
        <span class="color-option" style="background: var(--purple);" data-color="purple"></span>
        <span class="color-option" style="background: var(--cyan);" data-color="cyan"></span>
        <span class="color-option premium" data-color="other">...</span>
      </div>
    </label>
    <label>
      <input type="checkbox" id="habit-reminder"> ${t("remind_me")}
    </label>
    <div id="reminder-time" style="display: none;">
      <input type="number" id="reminder-hour" min="0" max="23" value="9"> :
      <input type="number" id="reminder-minute" min="0" max="59" value="0">
    </div>
  `;

  // Логика переключения напоминания
  document.getElementById("habit-reminder").addEventListener("change", (e) => {
    document.getElementById("reminder-time").style.display = e.target.checked ? "block" : "none";
  });

  // Логика "Повторять"
  document.getElementById("habit-repeat").addEventListener("change", (e) => {
    document.getElementById("custom-repeat").style.display = e.target.value === "custom" ? "block" : "none";
  });

  // Выбор цвета
  document.querySelectorAll(".color-option").forEach(el => {
    el.addEventListener("click", (e) => {
      if (e.target.classList.contains("premium")) {
        alert(t("premium_color_locked"));
        return;
      }
      document.querySelectorAll(".color-option").forEach(c => c.classList.remove("selected"));
      e.target.classList.add("selected");
    });
  });

  // Генерация мотивации через AI
  document.getElementById("ai-motivate-btn").addEventListener("click", async () => {
    const name = document.getElementById("habit-name").value;
    if (!name) return;
    const advice = await getAICoachAdvice(`Мотивация для привычки: ${name}`);
    document.getElementById("habit-motivation").value = advice;
  });

  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

export function renderHabits() {
  const container = document.getElementById("habits-list");
  container.innerHTML = "";

  const today = new Date();
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  getHabits().forEach(habit => {
    const todayKey = getTodayKey();
    const habitProgress = habit.progress[todayKey] || [0, 0, 0, 0, 0];
    const completedCount = habitProgress.filter(p => p === 1).length;
    const progressPercent = habitProgress.length > 0 ? Math.round((completedCount / habitProgress.length) * 100) : 0;

    const card = document.createElement("div");
    card.className = "habit-card";
    card.style.borderLeft = `4px solid var(--${habit.color})`;

    let datesHTML = "";
    dates.forEach((date, index) => {
      const isCompleted = habitProgress[index] === 1;
      datesHTML += `
        <div class="habit-date">
          <div>${date.getDate()}</div>
          <div>${date.toLocaleDateString([], { weekday: 'short' })}</div>
          <div class="habit-check ${isCompleted ? 'checked' : ''}" data-habit="${habit.id}" data-date="${date.toISOString().split('T')[0]}" data-index="${index}">
            ${isCompleted ? '✓' : '○'}
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="habit-header">
        <div>
          <div class="habit-name">${habit.name}</div>
          <div class="habit-motivation">${habit.motivation}</div>
        </div>
        <div style="text-align: right;">
          <div>${progressPercent}%</div>
          <div>${t("streak")}: ${habit.streak}</div>
        </div>
      </div>
      <div class="habit-progress-bar">
        <div class="habit-progress-fill" style="width: ${progressPercent}%; background: var(--${habit.color});"></div>
      </div>
      <div class="habit-dates">
        ${datesHTML}
      </div>
    `;

    // Добавляем обработчик клика на привычку
    card.addEventListener("click", () => openStatsModal(habit));

    container.appendChild(card);
  });

  // Обработчики для чекбоксов
  document.querySelectorAll(".habit-check").forEach(el => {
    el.addEventListener("click", (e) => {
      const habitId = parseInt(e.target.dataset.habit);
      const date = e.target.dataset.date;
      const index = parseInt(e.target.dataset.index);
      const isCurrentlyChecked = e.target.classList.contains("checked");

      updateHabitProgress(habitId, date, index, !isCurrentlyChecked);
      renderHabits(); // Перерисовка для обновления прогресса
    });
  });
}

function openStatsModal(habit) {
  currentHabitForStats = habit;
  const modal = document.getElementById("modal-overlay");
  const body = document.getElementById("modal-body");
  const title = document.getElementById("modal-title");

  title.textContent = t("stats");
  body.innerHTML = `
    <div>Общий прогресс: 65%</div>
    <div>Месяц: +5% | Год: +12%</div>
    <div class="chart-placeholder">[График]</div>
    <div class="stats-tabs">
      <button class="tab-btn active">${t("from_start")}</button>
      <button class="tab-btn">${t("month")}</button>
      <button class="tab-btn">${t("year")}</button>
    </div>
    <div class="calendar-placeholder">
      ${renderHabitCalendar(habit.progress, new Date(), new Date(new Date().setMonth(new Date().getMonth() + 1)))}
    </div>
    <div class="stats-actions">
      <button id="edit-habit-btn">${t("edit")}</button>
      <button id="reset-progress-btn">${t("reset_progress")}</button>
      <button id="delete-habit-btn" style="background: var(--error);">${t("delete_habit")}</button>
    </div>
  `;

  document.getElementById("edit-habit-btn").addEventListener("click", () => {
    closeModal();
    openAddHabitModal(habit);
  });

  document.getElementById("reset-progress-btn").addEventListener("click", () => {
    resetHabitProgress(habit.id);
    closeModal();
    renderHabits();
  });

  document.getElementById("delete-habit-btn").addEventListener("click", () => {
    deleteHabit(habit.id);
    closeModal();
    renderHabits();
  });

  modal.classList.remove("hidden");
}