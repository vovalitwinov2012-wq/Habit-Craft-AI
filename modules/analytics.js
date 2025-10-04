// Analytics and Tracking System
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
            language: navigator.language,
            platform: navigator.platform
        };

        this.events.push(event);
        
        // Keep only last 1000 events to prevent storage overflow
        if (this.events.length > 1000) {
            this.events = this.events.slice(-1000);
        }
        
        this.saveEvents();
        
        // Log to console in development
        if (window.location.hostname === 'localhost') {
            console.log('Analytics Event:', event);
        }
    }

    getStats(timeframe = '30d') {
        const now = new Date();
        let startDate;

        switch (timeframe) {
            case '7d':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case '30d':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case '90d':
                startDate = new Date(now.setDate(now.getDate() - 90));
                break;
            default:
                startDate = new Date(0); // All time
        }

        const filteredEvents = this.events.filter(event => 
            new Date(event.timestamp) >= startDate
        );

        const eventCounts = {};
        filteredEvents.forEach(event => {
            eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
        });

        return {
            totalEvents: filteredEvents.length,
            eventCounts,
            timeframe
        };
    }

    // Common event tracking methods
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

    trackError(error, context = {}) {
        this.track('error_occurred', { error: error.message, ...context });
    }

    // Export analytics data
    exportData() {
        return {
            events: this.events,
            exportDate: new Date().toISOString(),
            totalEvents: this.events.length
        };
    }

    // Clear analytics data
    clearData() {
        this.events = [];
        this.saveEvents();
        return true;
    }
}

window.Analytics = Analytics;