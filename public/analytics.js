import { loadData } from "./utils.js";

// Ключ для хранения аналитики
const ANALYTICS_KEY = "user-analytics";

// Инициализация: создаём хранилище при первом запуске
function initAnalyticsStorage() {
  if (!loadData(ANALYTICS_KEY)) {
    saveAnalyticsData([]);
  }
}

// Сохранение данных аналитики
function saveAnalyticsData(data) {
  // Используем ту же логику синхронизации, что и в utils.js
  const userId = Telegram.WebApp.initDataUnsafe?.user?.id;
  const key = userId ? `user-${userId}-${ANALYTICS_KEY}` : ANALYTICS_KEY;
  localStorage.setItem(key, JSON.stringify(data));
}

// Загрузка данных аналитики
function loadAnalyticsData() {
  return loadData(ANALYTICS_KEY) || [];
}

// --- API для логирования действий ---

/**
 * Логирует событие пользователя
 * @param {string} action - тип действия (например, "view_habit", "create_habit", "ai_request")
 * @param {object} details - дополнительные данные (например, {habitId: 123} или {input: "пить воду"})
 */
export function logEvent(action, details = {}) {
  initAnalyticsStorage(); // Убедиться, что хранилище инициализировано

  const analytics = loadAnalyticsData();
  const userId = Telegram.WebApp.initDataUnsafe?.user?.id;
  const timestamp = new Date().toISOString();
  const platform = navigator.userAgent;

  const event = {
    userId,
    timestamp,
    action,
    details,
    platform
  };

  analytics.push(event);
  saveAnalyticsData(analytics);
}

// --- Отображение аналитики админу ---

/**
 * Отрисовывает таблицу событий в панели администратора
 * @param {HTMLElement} container - элемент, в который вставляется HTML
 */
export function renderAnalytics(container) {
  const analytics = loadAnalyticsData();

  if (analytics.length === 0) {
    container.innerHTML = "<p>Нет данных для отображения.</p>";
    return;
  }

  // Группировка по userId для удобства
  const groupedByUser = analytics.reduce((acc, event) => {
    if (!acc[event.userId]) {
      acc[event.userId] = [];
    }
    acc[event.userId].push(event);
    return acc;
  }, {});

  let html = "<h3>Аналитика по пользователям</h3>";

  for (const [userId, events] of Object.entries(groupedByUser)) {
    html += `<h4>Пользователь: ${userId}</h4>`;
    html += `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 0.5rem;">Время</th>
            <th style="border: 1px solid #cbd5e1; padding: 0.5rem;">Действие</th>
            <th style="border: 1px solid #cbd5e1; padding: 0.5rem;">Детали</th>
          </tr>
        </thead>
        <tbody>
    `;

    events.forEach(event => {
      html += `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 0.5rem;">${new Date(event.timestamp).toLocaleString()}</td>
          <td style="border: 1px solid #cbd5e1; padding: 0.5rem;">${event.action}</td>
          <td style="border: 1px solid #cbd5e1; padding: 0.5rem;"><pre>${JSON.stringify(event.details, null, 2)}</pre></td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;
  }

  container.innerHTML = html;
}

// --- Инициализация ---
initAnalyticsStorage();