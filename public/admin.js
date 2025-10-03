import { renderAnalytics } from "./analytics.js"; // Импортируем функцию отрисовки аналитики

export function showAdminPanel() {
  const panel = document.getElementById("admin-panel");
  const analyticsContainer = document.getElementById("analytics-content");

  // Показываем админ-панель
  panel.classList.remove("hidden");

  // Вызываем функцию из analytics.js для отрисовки данных
  renderAnalytics(analyticsContainer);
}