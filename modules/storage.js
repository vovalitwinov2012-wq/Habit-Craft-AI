// modules/storage.js — менеджер локального хранилища
// Данные хранятся с префиксом habitcraft:<userId>:<key>
// Если в Telegram — используем Telegram user id, иначе local-user

export default class StorageManager {
  constructor() {
    this.userId = this._deriveUserId();
  }

  _deriveUserId() {
    try {
      if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initDataUnsafe?.user?.id) {
        return `tg-${Telegram.WebApp.initDataUnsafe.user.id}`;
      }
    } catch (e) {
      // ignore
    }
    return 'local-user';
  }

  _key(key) {
    return `habitcraft:${this.userId}:${key}`;
  }

  setItem(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage setItem error', e);
      return false;
    }
  }

  getItem(key) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Storage getItem error', e);
      return null;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(this._key(key));
      return true;
    } catch (e) {
      console.error('Storage removeItem error', e);
      return false;
    }
  }
}