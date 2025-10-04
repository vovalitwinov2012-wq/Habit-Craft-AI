import { CONFIG } from "../config.js";

export default class StorageManager {
  constructor() {
    this.userId = this.getUserId();
  }

  getUserId() {
    try {
      if (typeof Telegram !== "undefined" && Telegram.WebApp?.initDataUnsafe?.user?.id) {
        return `tg-${Telegram.WebApp.initDataUnsafe.user.id}`;
      }
    } catch {}
    return "local-user";
  }

  key(key) {
    return `habitcraft:${this.userId}:${key}`;
  }

  setItem(key, value) {
    localStorage.setItem(this.key(key), JSON.stringify(value));
  }

  getItem(key) {
    const data = localStorage.getItem(this.key(key));
    return data ? JSON.parse(data) : null;
  }
}