// Enhanced Storage Manager
class StorageManager {
    constructor() {
        this.userId = this.getUserId();
        this.isTelegram = typeof Telegram !== 'undefined' && Telegram.WebApp;
    }

    getUserId() {
        if (this.isTelegram && Telegram.WebApp.initDataUnsafe?.user?.id) {
            return 'tg-' + Telegram.WebApp.initDataUnsafe.user.id.toString();
        }
        return 'local-' + Math.random().toString(36).substr(2, 9);
    }

    getStorageKey(key) {
        return `habitcraft-${this.userId}-${key}`;
    }

    setItem(key, value) {
        try {
            const storageKey = this.getStorageKey(key);
            const data = JSON.stringify({
                value,
                timestamp: Date.now(),
                version: CONFIG.VERSION
            });
            localStorage.setItem(storageKey, data);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    getItem(key) {
        try {
            const storageKey = this.getStorageKey(key);
            const data = localStorage.getItem(storageKey);
            
            if (!data) return null;

            const parsed = JSON.parse(data);
            return parsed.value;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    }

    removeItem(key) {
        try {
            const storageKey = this.getStorageKey(key);
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    clearUserData() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes(this.userId)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
}

window.StorageManager = StorageManager;