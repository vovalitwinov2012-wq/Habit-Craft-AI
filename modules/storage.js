// Storage Manager
class StorageManager {
    constructor() {
        this.userId = this.getUserId();
        console.log('📦 StorageManager initialized for user:', this.userId);
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
            console.log('💾 Saved:', key, value);
            return true;
        } catch (error) {
            console.error('❌ Storage set error:', error);
            return false;
        }
    }

    getItem(key) {
        try {
            const storageKey = this.getStorageKey(key);
            const data = localStorage.getItem(storageKey);
            const result = data ? JSON.parse(data) : null;
            console.log('📂 Loaded:', key, result);
            return result;
        } catch (error) {
            console.error('❌ Storage get error:', error);
            return null;
        }
    }

    removeItem(key) {
        try {
            const storageKey = this.getStorageKey(key);
            localStorage.removeItem(storageKey);
            console.log('🗑️ Removed:', key);
            return true;
        } catch (error) {
            console.error('❌ Storage remove error:', error);
            return false;
        }
    }
}

window.StorageManager = StorageManager;
console.log('✅ Storage module loaded');