const translations = {
  ru: {
    title: "HabitCraft",
    add_habit: "Создать привычку",
    habit_name: "Название",
    habit_motivation: "Мотивируйте себя",
    ai_generate: "Сгенерировать AI",
    repeat: "Повторять",
    daily: "Каждый день",
    weekly: "Раз в неделю",
    custom: "Произвольно",
    times: "раз",
    days: "Дней",
    choose_color: "Выберите цвет",
    yellow: "Жёлтый",
    purple: "Фиолетовый",
    cyan: "Голубой",
    remind_me: "Напоминать мне",
    save: "Сохранить",
    progress: "Прогресс",
    streak: "Дней подряд",
    ai_placeholder: "Спросите AI-коуча или опишите привычку...",
    ai_button: "AI",
    premium_color_locked: "Доступно в Премиум",
    edit: "Править",
    reset_progress: "Сбросить прогресс",
    delete_habit: "Удалить привычку",
    stats: "Статистика",
    from_start: "С начала",
    month: "Месяц",
    year: "Год",
    admin_panel: "Админ-панель",
  },
  en: {
    title: "HabitCraft",
    add_habit: "Create Habit",
    habit_name: "Name",
    habit_motivation: "Motivate yourself",
    ai_generate: "AI Generate",
    repeat: "Repeat",
    daily: "Daily",
    weekly: "Weekly",
    custom: "Custom",
    times: "times",
    days: "Days",
    choose_color: "Choose color",
    yellow: "Yellow",
    purple: "Purple",
    cyan: "Cyan",
    remind_me: "Remind me",
    save: "Save",
    progress: "Progress",
    streak: "Streak",
    ai_placeholder: "Ask AI coach or describe a habit...",
    ai_button: "AI",
    premium_color_locked: "Available in Premium",
    edit: "Edit",
    reset_progress: "Reset Progress",
    delete_habit: "Delete Habit",
    stats: "Stats",
    from_start: "From Start",
    month: "Month",
    year: "Year",
    admin_panel: "Admin Panel",
  },
};

let currentLang = localStorage.getItem("lang") || "ru";

export function t(key) {
  return translations[currentLang][key] || key;
}

export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  document.getElementById("lang-switch").textContent = lang.toUpperCase();
  document.getElementById("app-title").textContent = t("title");
}