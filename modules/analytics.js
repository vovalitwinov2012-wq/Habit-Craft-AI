// Analytics System
class Analytics {
    constructor() {
        this.storage = new StorageManager();
        this.events = this.loadEvents();
    }

    loadEvents() {
        return this.storage.getItem('analytics_events') || [];
    }

    saveEvents() {
        return this.storage.setItem('analytics_events', this.events);
    }

    track(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties: properties,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language
        };

        this.events.push(event);
        
        if (this.events.length > 1000) {
            this.events = this.events.slice(-1000);
        }
        
        this.saveEvents();
    }

    trackAppLaunch() {
        this.track('app_launch');
    }

    trackHabitCreated(habitId, frequency) {
        this.track('habit_created', { habitId, frequency });
    }

    trackHabitCompleted(habitId, streak) {
        this.track('habit_completed', { habitId, streak });
    }

    trackHabitDeleted(habitId) {
        this.track('habit_deleted', { habitId });
    }

    trackAIRequest(type, success = true) {
        this.track('ai_request', { type, success });
    }

    trackThemeChange(theme) {
        this.track('theme_changed', { theme });
    }
}

window.Analytics = Analytics;