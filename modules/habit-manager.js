// modules/habit-manager.js — управление привычками
// Экспортируем класс HabitManager

import StorageManager from './storage.js';
import { CONFIG } from '../config.js';

export class HabitManager {
    constructor() {
        this.storage = new StorageManager();
        this.habits = this._loadHabits();
    }

    // Загружаем привычки, гарантируем структуру
    _loadHabits() {
        const raw = this.storage.getItem(CONFIG.STORAGE_KEYS.HABITS) || [];
        // Защита: если пришёл объект — приводим к массиву
        const arr = Array.isArray(raw) ? raw : [];
        arr.forEach(h => {
            if (!Array.isArray(h.completedDates)) h.completedDates = [];
            if (typeof h.streak !== 'number') h.streak = 0;
            if (typeof h.totalCompletions !== 'number') h.totalCompletions = 0;
            if (typeof h.isActive !== 'boolean') h.isActive = true;
        });
        return arr;
    }

    _saveHabits() {
        return this.storage.setItem(CONFIG.STORAGE_KEYS.HABITS, this.habits);
    }

    // Проверка лимита создания привычки (free/premium логика простая)
    canCreateHabit() {
        const max = CONFIG.ENABLE_PREMIUM ? CONFIG.MAX_FREE_HABITS : CONFIG.MAX_FREE_HABITS;
        return this.habits.length < max;
    }

    createHabit({ name, description = '', color = '#4CAF50', frequency = 'daily' }) {
        if (!name || !name.trim()) {
            throw new Error('Введите название привычки');
        }

        if (!this.canCreateHabit()) {
            throw new Error(`Лимит привычек достигнут (${CONFIG.MAX_FREE_HABITS}). Обновите до премиум, чтобы добавить больше.`);
        }

        const newHabit = {
            id: this._generateId(),
            name: name.trim(),
            description: description.trim(),
            color,
            frequency,
            createdAt: new Date().toISOString(),
            completedDates: [],
            streak: 0,
            totalCompletions: 0,
            isActive: true
        };

        this.habits.push(newHabit);
        this._saveHabits();
        return newHabit;
    }

    deleteHabit(habitId) {
        const before = this.habits.length;
        this.habits = this.habits.filter(h => h.id !== habitId);
        const after = this.habits.length;
        this._saveHabits();
        return before !== after;
    }

    toggleHabitCompletion(habitId, date = new Date()) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return false;

        const key = this._dateKey(date);
        const idx = habit.completedDates.indexOf(key);
        let completedNow = false;

        if (idx > -1) {
            // снимаем отметку
            habit.completedDates.splice(idx, 1);
            habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
            completedNow = false;
        } else {
            habit.completedDates.push(key);
            habit.totalCompletions++;
            completedNow = true;
        }

        // Обновляем стрик для привычки
        this._updateStreak(habit);
        this._saveHabits();
        return completedNow;
    }

    _updateStreak(habit) {
        const today = new Date();
        let streak = 0;
        // проверяем назад по дням (макс 365)
        for (let i = 0; i < 365; i++) {
            const check = new Date(today);
            check.setDate(today.getDate() - i);
            const key = this._dateKey(check);
            if (habit.completedDates.includes(key)) {
                streak++;
            } else {
                // если день не выполнен и это не позавчера для разных частот — прерываем
                break;
            }
        }
        habit.streak = streak;
    }

    isHabitCompletedToday(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return false;
        return habit.completedDates.includes(this._dateKey(new Date()));
    }

    getTodayHabits() {
        const today = new Date();
        const day = today.getDay(); // 0 Sun - 6 Sat
        // Перевод: weekdays -> Mon-Fri, weekly -> Sat/Sun
        return this.habits.filter(h => {
            if (!h.isActive) return false;
            switch (h.frequency) {
                case 'daily': return true;
                case 'weekdays': return day >= 1 && day <= 5;
                case 'weekly': return day === 0 || day === 6;
                default: return true;
            }
        });
    }

    getHabitStats(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return null;
        const totalDays = Math.max(1, Math.ceil((Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
        const completionRate = Math.round((habit.totalCompletions / totalDays) * 100);
        return {
            streak: habit.streak || 0,
            totalCompletions: habit.totalCompletions || 0,
            completionRate: isFinite(completionRate) ? completionRate : 0,
            totalDays,
            lastCompletion: habit.completedDates.length ? habit.completedDates[habit.completedDates.length - 1] : null
        };
    }

    getOverallStats() {
        const totalHabits = this.habits.length;
        const activeHabits = this.habits.filter(h => h.isActive).length;
        let totalCompletions = 0;
        let totalPossible = 0;
        let longestStreak = 0;

        this.habits.forEach(h => {
            totalCompletions += h.totalCompletions || 0;
            const days = Math.max(1, Math.ceil((Date.now() - new Date(h.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
            totalPossible += days;
            longestStreak = Math.max(longestStreak, h.streak || 0);
        });

        const overallCompletionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

        return {
            totalHabits,
            activeHabits,
            overallCompletionRate,
            longestStreak,
            totalCompletions
        };
    }

    _dateKey(date) {
        return date.toISOString().split('T')[0];
    }

    _generateId() {
        // простой уникальный id на базе времени + рандома
        return 'h_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    }
}

export default HabitManager;