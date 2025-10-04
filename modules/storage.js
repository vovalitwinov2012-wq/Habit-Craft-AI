// Enhanced Storage Manager with error handling and fallbacks
class StorageManager {
    constructor() {
        this.userId = this.getUserId();
        this.isTelegram = typeof Telegram !== 'undefined' && Telegram.WebApp;
    }

    getUserId() {
        if (this.isTelegram) {
            return Telegram.WebApp.initDataUnsafe?.user?.id?.toString() || 'telegram-user';
        }
        return 'local-user-' + Math.random().toString(36).substr(2, 9);
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
            
            // Check if data is from current version
            if (parsed.version !== CONFIG.VERSION) {
                this.migrateData(key, parsed);
                return null;
            }

            return parsed.value;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    }

    migrateData(key, oldData) {
        console.log(`Migrating data for key: ${key}`);
        // Implement data migration logic here if needed
        this.setItem(key, oldData.value);
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

    getStorageInfo() {
        let totalSize = 0;
        let userKeys = 0;

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                totalSize += key.length + (value ? value.length : 0);
                
                if (key.includes(this.userId)) {
                    userKeys++;
                }
            }
        } catch (error) {
            console.error('Storage info error:', error);
        }

        return {
            totalSize: (totalSize / 1024).toFixed(2) + ' KB',
            userKeys,
            quota: '5MB' // Standard localStorage quota
        };
    }
}

// Create global instance
window.StorageManager = StorageManager;