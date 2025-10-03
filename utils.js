class Utils {
    static getTelegramUserId() {
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
        }
        return 'local-user';
    }

    static saveData(key, value) {
        const userId = this.getTelegramUserId();
        const storageKey = `user-${userId}-${key}`;
        try {
            localStorage.setItem(storageKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Save error:', error);
            return false;
        }
    }

    static loadData(key) {
        const userId = this.getTelegramUserId();
        const storageKey = `user-${userId}-${key}`;
        try {
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Load error:', error);
            return null;
        }
    }

    static getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    static getDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    static getWeekDates() {
        const dates = [];
        const today = new Date();
        for (let i = -2; i <= 2; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    }

    static formatDate(date) {
        return date.toLocaleDateString(CONFIG.LANGUAGE === 'ru' ? 'ru-RU' : 'en-US', {
            day: 'numeric',
            month: 'short'
        });
    }

    static showNotification(message, type = 'info') {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 1001;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}