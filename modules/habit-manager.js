// modules/habit-manager.js
// Операции с привычками: CRUD, отметки, статистика.

import { v4 as uuidv4 } from 'https://jspm.dev/uuid'; // ESM CDN для uuid (в статическом окружении)

export class HabitManager {
  constructor(storage, storageKey = 'habits') {
    this.storage = storage;
    this.storageKey = storageKey;
    this.habits = this._load();
  }

  _load() {
    const data = this.storage.getItem(this.storageKey) || [];
    // наполнение дефолтных свойств
    data.forEach(h => {
      if (!h.id) h.id = uuidv4();
      if (!Array.isArray(h.completedDates)) h.completedDates = [];
      if (!h.createdAt) h.createdAt = new Date().toISOString();
      if (typeof h.isActive === 'undefined') h.isActive = true;
      if (typeof h.color === 'undefined') h.color = '#4CAF50';
      if (typeof h.frequency === 'undefined') h.frequency = 'daily';
      if (typeof h.totalCompletions === 'undefined') h.totalCompletions = 0;
      if (typeof h.streak === 'undefined') h.streak = 0;
    });
    return data;
  }

  _save() {
    this.storage.setItem(this.storageKey, this.habits);
  }

  list() { return this.habits.slice(); }

  create({ name, description = '', color = '#4CAF50', frequency = 'daily' }) {
    const habit = {
      id: uuidv4(),
      name,
      description,
      color,
      frequency,
      createdAt: new Date().toISOString(),
      completedDates: [],
      totalCompletions: 0,
      streak: 0,
      isActive: true
    };
    this.habits.push(habit);
    this._save();
    return habit;
  }

  delete(id) {
    const prev = this.habits.length;
    this.habits = this.habits.filter(h => h.id !== id);
    this._save();
    return this.habits.length !== prev;
  }

  _dateKey(date = new Date()) {
    const d = new Date(date);
    return d.toISOString().slice(0,10); // YYYY-MM-DD
  }

  toggleCompletion(id, date = new Date()) {
    const h = this.habits.find(x => x.id === id);
    if (!h) return false;
    const key = this._dateKey(date);
    const idx = h.completedDates.indexOf(key);
    if (idx >= 0) {
      h.completedDates.splice(idx, 1);
      h.totalCompletions = Math.max(0, h.totalCompletions - 1);
    } else {
      h.completedDates.push(key);
      h.totalCompletions = (h.totalCompletions || 0) + 1;
    }
    // обновляем стрик
    h.streak = this._calcStreak(h);
    this._save();
    return idx === -1; // true если пометили как выполнено
  }

  _calcStreak(habit) {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = this._dateKey(d);
      if (habit.completedDates.includes(key)) streak++;
      else break;
    }
    return streak;
  }

  isCompletedToday(id) {
    const h = this.habits.find(x => x.id === id);
    if (!h) return false;
    return h.completedDates.includes(this._dateKey(new Date()));
  }

  getTodayHabits() {
    const day = new Date().getDay(); // 0..6
    return this.habits.filter(h => {
      if (!h.isActive) return false;
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'weekdays') return day >= 1 && day <= 5;
      if (h.frequency === 'weekly') return day === 0 || day === 6;
      return true;
    });
  }

  getHabitStats(id) {
    const h = this.habits.find(x => x.id === id);
    if (!h) return null;
    const totalDays = Math.max(1, Math.ceil((new Date() - new Date(h.createdAt)) / (1000*60*60*24)));
    const completionRate = Math.round((h.totalCompletions / totalDays) * 100);
    return {
      streak: h.streak || 0,
      totalCompletions: h.totalCompletions || 0,
      completionRate,
      createdAt: h.createdAt
    };
  }

  getOverallStats() {
    const totalHabits = this.habits.length;
    let totalCompletions = 0, totalDays = 0, longestStreak = 0;
    this.habits.forEach(h => {
      totalCompletions += h.totalCompletions || 0;
      totalDays += Math.max(1, Math.ceil((new Date() - new Date(h.createdAt)) / (1000*60*60*24)));
      longestStreak = Math.max(longestStreak, h.streak || 0);
    });
    const overallCompletionRate = totalDays ? Math.round((totalCompletions / totalDays) * 100) : 0;
    return { totalHabits, overallCompletionRate, longestStreak, totalCompletions };
  }
}