// Advanced Habit Management System
class HabitManager {
    constructor() {
        this.storage = new StorageManager();
        this.habits = this.loadHabits();
        this.analytics = new Analytics();
    }

    loadHabits() {
        return this.storage.getItem(CONFIG.STORAGE_KEYS.HABITS) || [];
    }

    saveHabits() {
        return this.storage.setItem(CONFIG.STORAGE_KEYS.HABITS, this.habits);
    }

    canCreateHabit() {
        const isPremium = this.isPremium();
        const currentCount = this.habits.length;
        
        if (isPremium) {
            return currentCount < CONFIG.MAX_PREMIUM_HABITS;
        } else {
            return currentCount < CONFIG.MAX_FREE_HABITS;
        }
    }

    createHabit(habitData) {
        if (!this.canCreateHabit()) {
            throw new Error('Habit limit reached. Upgrade to premium for more habits.');
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
        
        this.analytics.track('habit_created', {
            habitId: habit.id,
            frequency: habit.frequency
        });

        return habit;
    }

    updateHabit(habitId, updates) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return false;

        Object.assign(habit, updates);
        this.saveHabits();
        return true;
    }

    deleteHabit(habitId) {
        this.habits = this.habits.filter(h => h.id !== habitId);
        this.saveHabits();
        
        this.analytics.track('habit_deleted', { habitId });
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
        
        this.analytics.track('habit_toggled', {
            habitId,
            completed: completedIndex === -1,
            newStreak: habit.streak
        });

        return completedIndex === -1; // Returns true if completed, false if uncompleted
    }

    updateStreak(habit) {
        const today = new Date();
        let currentStreak = 0;
        
        // Check backwards from today
        for (let i = 0; i < 365; i++) { // Check up to a year
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
        return this.habits.filter(habit => {
            if (!habit.isActive) return false;
            
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
            
            switch (habit.frequency) {
                case 'daily':
                    return true;
                case 'weekdays':
                    return dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
                case 'weekly':
                    return dayOfWeek === 0 || dayOfWeek === 6; // Sat-Sun
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
            totalPossibleCompletions += Math.ceil((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24));
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
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    isPremium() {
        // TODO: Integrate with payment system
        return false;
    }

    // Advanced analytics methods
    getHabitCompletionCalendar(habitId, days = 30) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return [];

        const calendar = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = this.getDateKey(date);

            calendar.push({
                date: dateKey,
                completed: habit.completedDates.includes(dateKey),
                isToday: i === 0
            });
        }

        return calendar;
    }

    // Export data for backup
    exportData() {
        return {
            habits: this.habits,
            exportDate: new Date().toISOString(),
            version: CONFIG.VERSION
        };
    }

    // Import data from backup
    importData(data) {
        if (data.version !== CONFIG.VERSION) {
            console.warn('Importing data from different version');
        }

        this.habits = data.habits || [];
        this.saveHabits();
        return true;
    }
}

window.HabitManager = HabitManager;