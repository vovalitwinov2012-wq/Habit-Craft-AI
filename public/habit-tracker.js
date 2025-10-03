import { loadData, saveData, getTodayKey } from "./utils.js";
import { t } from "./i18n.js";

let habits = loadData("habits") || [];
const todayKey = getTodayKey();
let todayProgress = loadData(`progress-${todayKey}`) || {};

export function addHabit(name) {
  const newHabit = {
    id: Date.now(),
    name,
    streak: 0,
    completed: 0,
    total: 0,
    lastCompleted: null,
  };
  habits.push(newHabit);
  saveData("habits", habits);
  renderTodayHabits();
}

export function toggleHabit(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  const todayKey = getTodayKey();
  todayProgress = loadData(`progress-${todayKey}`) || {};

  if (todayProgress[id]) {
    delete todayProgress[id];
    habit.completed = Math.max(0, habit.completed - 1);
  } else {
    todayProgress[id] = true;
    habit.completed = habit.completed + 1;
    habit.total = habit.total + 1;

    if (habit.lastCompleted === todayKey) {
      // уже сегодня отмечено
    } else {
      habit.lastCompleted = todayKey;
      habit.streak = habit.streak + 1;
    }
  }

  saveData(`progress-${todayKey}`, todayProgress);
  saveData("habits", habits);
  renderTodayHabits();
}

export function renderTodayHabits() {
  const container = document.getElementById("today-habits");
  container.innerHTML = "";

  habits.forEach(habit => {
    const isCompleted = !!todayProgress[habit.id];
    const streak = habit.streak;
    const progress = habit.total > 0 ? Math.round((habit.completed / habit.total) * 100) : 0;

    const card = document.createElement("div");
    card.className = "habit-card";
    card.innerHTML = `
      <div>
        <h3>${habit.name}</h3>
        <p>${t("streak")}${streak} | ${t("progress")}${progress}%</p>
      </div>
      <button class="btn-check" onclick="window.habit.toggleHabit(${habit.id})">
        ${isCompleted ? "✓" : "○"}
      </button>
    `;
    container.appendChild(card);
  });
}