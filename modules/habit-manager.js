// modules/habit-manager.js — управление привычками
import { CONFIG } from '../config.js';
import StorageManager from './storage.js';

export default class HabitManager {
    constructor() {
        this.storage = new StorageManager();
        this.habits = this.storage.getItem(CONFIG.STORAGE_KEYS.HABITS) || [];
    }

    save() {
        this.storage.setItem(CONFIG.STORAGE_KEYS.HABITS, this.habits);
    }

    getAll() {
        return this.habits;
    }

    addHabit(habit) {
        habit.id = 'h_' + Date.now();
        habit.completedDates = [];
        this.habits.push(habit);
        this.save();
    }

    toggleCompletion(id) {
        const today = new Date().toISOString().split('T')[0];
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        const index = habit.completedDates.indexOf(today);
        if (index === -1) habit.completedDates.push(today);
        else habit.completedDates.splice(index, 1);

        this.save();
    }

    getTodayHabits() {
        return this.habits;
    }
}