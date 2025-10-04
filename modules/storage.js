// modules/storage.js — менеджер локального хранилища
// Экспортируется класс StorageManager

export class StorageManager {
    constructor() {
        // Получаем идентификатор пользователя (если в Telegram WebApp — используем id телеграм-пользователя)
        this.userId = this._deriveUserId();
    }

    // Получение userId: prefer Telegram WebApp initDataUnsafe, fallback to local-user
    _deriveUserId() {
        try {
            if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initDataUnsafe?.user?.id) {
                return `tg-${Telegram.WebApp.initDataUnsafe.user.id}`;
            }
        } catch (e) {
            // игнорируем
        }
        // fallback
        return 'local-user';
    }

    // Формируем ключ для локального хранилища
    _key(key) {
        return `habitcraft:${this.userId}:${key}`;
    }

    // Запись — всегда возвращает true/false
    setItem(key, value) {
        try {
            const payload = JSON.stringify(value);
            localStorage.setItem(this._key(key), payload);
            return true;
        } catch (err) {
            console.error('Storage setItem error', err);
            return false;
        }
    }

    // Чтение — возвращает распарсенный объект или null
    getItem(key) {
        try {
            const raw = localStorage.getItem(this._key(key));
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.error('Storage getItem error', err);
            return null;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(this._key(key));
            return true;
        } catch (err) {
            console.error('Storage removeItem error', err);
            return false;
        }
    }

    // Утилита: очищает всё приложение-специфичное хранилище (для dev)
    clearAll() {
        try {
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith(`habitcraft:${this.userId}:`)) {
                    localStorage.removeItem(k);
                }
            });
            return true;
        } catch (err) {
            console.error('Storage clearAll error', err);
            return false;
        }
    }
}

export default StorageManager;