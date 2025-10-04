// modules/storage.js — безопасное локальное хранилище

import { CONFIG } from '../config.js';

export default class StorageManager {
    constructor() {
        this.userId = this._getUserId();
    }

    _getUserId() {
        try {
            if (typeof Telegram !== 'undefined' && Telegram.WebApp?.initDataUnsafe?.user?.id) {
                return `tg-${Telegram.WebApp.initDataUnsafe.user.id}`;
            }
        } catch (err) {}
        return 'local-user';
    }

    _key(key) {
        return `habitcraft:${this.userId}:${key}`;
    }

    setItem(key, value) {
        localStorage.setItem(this._key(key), JSON.stringify(value));
    }

    getItem(key) {
        const raw = localStorage.getItem(this._key(key));
        return raw ? JSON.parse(raw) : null;
    }
}