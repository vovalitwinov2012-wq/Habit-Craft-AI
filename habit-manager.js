class HabitManager {
    constructor() {
        this.habits = this.loadHabits();
        this.currentStreaks = this.loadStreaks();
    }

    loadHabits() {
        return Utils.loadData('habits') || [];
    }

    loadStreaks() {
        return Utils.loadData('streaks') || {};
    }

    saveHabits() {
        return Utils.saveData('habits', this.habits);
    }

    saveStreaks() {
        return Utils.saveData('streaks', this.currentStreaks);
    }

    addHabit(habitData) {
        if (this.habits.length >= CONFIG.MAX_FREE_HABITS && !this.isPremium()) {
            return { success: false, error: 'free_limit_reached' };
        }

        const habit = {
            id: Date.now().toString(),
            name: habitData.name,
            motivation: habitData.motivation,
            color: habitData.color || '#4CAF50',
            createdAt: new Date().toISOString(),
            progress: {},
            completed: false
        };

        this.habits.push(habit);
        const success = this.saveHabits();
        
        return { success, habit };
    }

    updateHabitProgress(habitId, dateKey, completed) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return false;

        if (!habit.progress) habit.progress = {};
        habit.progress[dateKey] = completed;
        
        this.updateStreak(habitId, dateKey, completed);
        return this.saveHabits();
    }

    updateStreak(habitId, dateKey, completed) {
        if (!this.currentStreaks[habitId]) {
            this.currentStreaks[habitId] = { current: 0, lastDate: null };
        }

        const streak = this.currentStreaks[habitId];
        const today = Utils.getTodayKey();

        if (completed && dateKey === today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = Utils.getDateKey(yesterday);

            if (streak.lastDate === yesterdayKey) {
                streak.current++;
            } else if (streak.lastDate !== today) {
                streak.current = 1;
            }
            streak.lastDate = today;
        } else if (!completed && dateKey === today && streak.lastDate === today) {
            streak.current = Math.max(0, streak.current - 1);
            if (streak.current === 0) {
                streak.lastDate = null;
            }
        }

        this.saveStreaks();
    }

    getHabitStreak(habitId) {
        return this.currentStreaks[habitId]?.current || 0;
    }

    getCompletionRate(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit || !habit.progress) return 0;

        const progressEntries = Object.values(habit.progress);
        if (progressEntries.length === 0) return 0;

        const completedCount = progressEntries.filter(Boolean).length;
        return Math.round((completedCount / progressEntries.length) * 100);
    }

    deleteHabit(habitId) {
        this.habits = this.habits.filter(h => h.id !== habitId);
        delete this.currentStreaks[habitId];
        return this.saveHabits() && this.saveStreaks();
    }

    getHabits() {
        return this.habits;
    }

    isPremium() {
        // For now, always return false - premium features not implemented
        return false;
    }

    getHabitProgressForDates(habitId, dates) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit || !habit.progress) return {};
        
        const progress = {};
        dates.forEach(date => {
            const dateKey = Utils.getDateKey(date);
            progress[dateKey] = !!habit.progress[dateKey];
        });
        
        return progress;
    }

    getOverallProgress() {
        const totalPossible = this.habits.length * 7; // Last 7 days
        if (totalPossible === 0) return 0;

        let totalCompleted = 0;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        this.habits.forEach(habit => {
            if (habit.progress) {
                Object.entries(habit.progress).forEach(([dateKey, completed]) => {
                    const progressDate = new Date(dateKey);
                    if (progressDate >= weekAgo && completed) {
                        totalCompleted++;
                    }
                });
            }
        });

        return Math.round((totalCompleted / totalPossible) * 100);
    }
}