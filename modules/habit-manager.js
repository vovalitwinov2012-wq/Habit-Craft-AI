// Habit Management System
class HabitManager {
    constructor() {
        this.storage = new StorageManager();
        this.habits = this.loadHabits();
    }

    loadHabits() {
        const habits = this.storage.getItem(CONFIG.STORAGE_KEYS.HABITS) || [];
        // Initialize missing properties for existing habits
        habits.forEach(habit => {
            if (!habit.completedDates) habit.completedDates = [];
            if (!habit.streak) habit.streak = 0;
            if (!habit.totalCompletions) habit.totalCompletions = 0;
            if (!habit.isActive) habit.isActive = true;
        });
        return habits;
    }

    saveHabits() {
        return this.storage.setItem(CONFIG.STORAGE_KEYS.HABITS, this.habits);
    }

    canCreateHabit() {
        const currentCount = this.habits.length;
        return currentCount < CONFIG.MAX_FREE_HABITS;
    }

    createHabit(habitData) {
        if (!this.canCreateHabit()) {
            throw new Error(`Лимит привычек достигнут. Максимум ${CONFIG.MAX_FREE_HABITS} привычек в бесплатной версии.`);
        }

        const habit = {
            id: this.generateId(),
            name: habitData.name,
            description: habitData.description,
            color: habitData.color || '#4CAF50',
            frequency: habitData.frequency || 'daily',
            createdAt: new Date().toISOString(),
            completedDates: [],
            streak: 0,
            totalCompletions: 0,
            isActive: true
        };

        this.habits.push(habit);
        this.saveHabits();
        return habit;
    }

    deleteHabit(habitId) {
        this.habits = this.habits.filter(h => h.id !== habitId);
        this.saveHabits();
        return true;
    }

    toggleHabitCompletion(habitId, date = new Date()) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return false;

        const dateKey = this.getDateKey(date);
        const completedIndex = habit.completedDates.indexOf(dateKey);

        if (completedIndex > -1) {
            // Remove completion
            habit.completedDates.splice(completedIndex, 1);
            habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
        } else {
            // Add completion
            habit.completedDates.push(dateKey);
            habit.totalCompletions++;
        }

        // Update streak
        this.updateStreak(habit);
        this.saveHabits();

        return completedIndex === -1;
    }

    updateStreak(habit) {
        const today = new Date();
        let currentStreak = 0;
        
        // Check backwards from today
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateKey = this.getDateKey(checkDate);
            
            if (habit.completedDates.includes(dateKey)) {
                currentStreak++;
            } else {
                break;
            }
        }
        
        habit.streak = currentStreak;
    }

    isHabitCompletedToday(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return false;

        const todayKey = this.getDateKey(new Date());
        return habit.completedDates.includes(todayKey);
    }

    getTodayHabits() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        return this.habits.filter(habit => {
            if (!habit.isActive) return false;
            
            switch (habit.frequency) {
                case 'daily':
                    return true;
                case 'weekdays':
                    return dayOfWeek >= 1 && dayOfWeek <= 5;
                case 'weekly':
                    return dayOfWeek === 0 || dayOfWeek === 6;
                default:
                    return true;
            }
        });
    }

    getHabitStats(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return null;

        const totalDays = Math.ceil((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24));
        const completionRate = totalDays > 0 ? Math.round((habit.totalCompletions / totalDays) * 100) : 0;

        return {
            streak: habit.streak,
            totalCompletions: habit.totalCompletions,
            completionRate,
            totalDays,
            lastCompletion: habit.completedDates[habit.completedDates.length - 1] || null
        };
    }

    getOverallStats() {
        const totalHabits = this.habits.length;
        const activeHabits = this.habits.filter(h => h.isActive).length;
        
        let totalCompletions = 0;
        let totalPossibleCompletions = 0;
        let longestStreak = 0;

        this.habits.forEach(habit => {
            totalCompletions += habit.totalCompletions;
            const habitDays = Math.ceil((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24));
            totalPossibleCompletions += habitDays;
            longestStreak = Math.max(longestStreak, habit.streak);
        });

        const overallCompletionRate = totalPossibleCompletions > 0 
            ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
            : 0;

        return {
            totalHabits,
            activeHabits,
            overallCompletionRate,
            longestStreak,
            totalCompletions
        };
    }

    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

window.HabitManager = HabitManager;