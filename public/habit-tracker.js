import { loadData, saveData, getTodayKey } from "./utils.js";
import { t } from "./i18n.js";

let habits = loadData("habits") || [];

export function addHabit(habitData) {
  const newHabit = {
    id: Date.now(),
    name: habitData.name,
    motivation: habitData.motivation,
    repeat: habitData.repeat,
    customFrequency: habitData.customFrequency,
    color: habitData.color,
    reminder: habitData.reminder,
    reminderTime: habitData.reminderTime,
    progress: {}, // { date: [0,1,1,0,1] }
    streak: 0,
    total: 0,
    lastCompleted: null,
  };
  habits.push(newHabit);
  saveData("habits", habits);
}

export function updateHabitProgress(habitId, date, dayIndex, completed) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  if (!habit.progress[date]) {
    habit.progress[date] = [0, 0, 0, 0, 0]; // 5 дней
  }
  habit.progress[date][dayIndex] = completed ? 1 : 0;

  saveData("habits", habits);
}

export function getHabits() {
  return habits;
}

export function deleteHabit(id) {
  habits = habits.filter(h => h.id !== id);
  saveData("habits", habits);
}

export function resetHabitProgress(id) {
  const habit = habits.find(h => h.id === id);
  if (habit) {
    habit.progress = {};
    habit.streak = 0;
    habit.total = 0;
    saveData("habits", habits);
  }
}