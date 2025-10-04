// modules/storage.js
// Простой менеджер localStorage. Комментарии на русском.

export class StorageManager {
  constructor(prefix = 'habitcraft') {
    this.prefix = prefix;
    this.userId = this._determineUserId();
    console.log('📦 StorageManager for', this.userId);
  }

  _determineUserId() {
    try {
      if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initDataUnsafe?.user?.id) {
        return 'tg-' + Telegram.WebApp.initDataUnsafe.user.id;
      }
    } catch (e) { /* ignore */ }
    return 'local';
  }

  _key(key) {
    return `${this.prefix}-${this.userId}-${key}`;
  }

  setItem(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error', e);
      return false;
    }
  }

  getItem(key) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Storage get error', e);
      return null;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(this._key(key));
      return true;
    } catch (e) {
      console.error('Storage remove error', e);
      return false;
    }
  }
}