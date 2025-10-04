// Storage Manager
class StorageManager {
    constructor() {
        this.userId = this.getUserId();
    }

    getUserId() {
        if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initDataUnsafe?.user?.id) {
            return 'tg-' + Telegram.WebApp.initDataUnsafe.user.id.toString();
        }
        return 'local-user';
    }

    getStorageKey(key) {
        return `habitcraft-${this.userId}-${key}`;
    }

    setItem(key, value) {
        try {
            const storageKey = this.getStorageKey(key);
            localStorage.setItem(storageKey, JSON.stringify(value));
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
            return data ? JSON.parse(data) : null;
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