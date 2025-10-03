import { loadData } from "./utils.js";

const CALENDAR_CONTAINER_ID = "calendar-view"; // ID контейнера для календаря

export function renderCalendar() {
  const container = document.getElementById(CALENDAR_CONTAINER_ID);
  if (!container) {
    console.warn("Calendar container not found.");
    return;
  }

  // Получаем все сохранённые прогресс-дни
  const allProgress = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("progress-")) {
      const date = key.replace("progress-", "");
      allProgress[date] = loadData(key);
    }
  }

  // Получаем все привычки для подсчёта
  const habits = loadData("habits") || [];

  // Отображаем сетку за последние 30 дней
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 29); // 30 дней назад

  let calendarHTML = '<div class="calendar-grid">';

  // Заголовки дней недели (Пн-Вс)
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  weekdays.forEach(day => {
    calendarHTML += `<div class="calendar-day-header">${day}</div>`;
  });

  // Пропускаем дни до первого понедельника в периоде
  const startDayOfWeek = startDate.getDay() || 7; // Воскресенье = 0, смещаем в 7
  const offset = startDayOfWeek - 1; // Понедельник = 1
  for (let i = 0; i < offset; i++) {
    calendarHTML += '<div class="calendar-day empty"></div>';
  }

  // Генерируем дни
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayProgress = allProgress[dateStr] || {};
    const completedCount = Object.keys(dayProgress).length;
    const totalCount = habits.length;

    let bgColor = "#cbd5e1"; // серый: нет данных
    if (totalCount > 0) {
      const completionRate = completedCount / totalCount;
      if (completionRate === 1) bgColor = "#4ade80"; // зелёный: всё выполнено
      else if (completionRate >= 0.5) bgColor = "#fbbf24"; // жёлтый: частично
      else bgColor = "#f87171"; // красный: мало
    }

    const dayLabel = currentDate.getDate();
    // Добавляем всплывающую подсказку (title) с деталями
    calendarHTML += `<div class="calendar-day" style="background-color: ${bgColor};" title="${dateStr}: ${completedCount}/${totalCount}">
                      ${dayLabel}
                     </div>`;
  }

  calendarHTML += '</div>';
  container.innerHTML = calendarHTML;
}