// Упрощённая версия для отображения в статистике привычки
export function renderHabitCalendar(habitProgress, startDate, endDate) {
  // В реальной версии будет сложный календарь с swipe-навигацией
  // Пока возвращаем HTML-фрагмент для отображения в модалке
  let html = '<div class="mini-calendar">';

  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const isCompleted = habitProgress[dateStr] && habitProgress[dateStr].some(d => d === 1);
    const dayClass = isCompleted ? "completed" : "missed";
    html += `<div class="cal-day ${dayClass}">${current.getDate()}</div>`;
    current.setDate(current.getDate() + 1);
  }

  html += '</div>';
  return html;
}