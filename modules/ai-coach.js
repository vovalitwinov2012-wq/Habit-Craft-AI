// modules/ai-coach.js — AI-коуч
// Делает запросы к локальному serverless-прокси (API на /api/ai).
// Если серверная прокси недоступна или лимит, используется mock.

import StorageManager from './storage.js';
import { CONFIG } from '../config.js';

export default class AICoach {
  constructor() {
    this.storage = new StorageManager();
    this.dailyRequests = this._loadDailyRequests();
    this.proxyUrl = CONFIG.AI_API_URL; // '/api/ai'
  }

  _loadDailyRequests() {
    const today = this._today();
    const saved = this.storage.getItem(CONFIG.STORAGE_KEYS.AI_REQUESTS) || { date: today, count: 0, totalUsed: 0 };
    if (saved.date !== today) {
      saved.date = today;
      saved.count = 0;
    }
    this.storage.setItem(CONFIG.STORAGE_KEYS.AI_REQUESTS, saved);
    return saved;
  }

  _saveDailyRequests() {
    this.storage.setItem(CONFIG.STORAGE_KEYS.AI_REQUESTS, this.dailyRequests);
  }

  _today() {
    return new Date().toISOString().split('T')[0];
  }

  canMakeRequest() {
    return this.dailyRequests.count < CONFIG.AI_REQUESTS_PER_DAY;
  }

  getUsageStats() {
    return { remainingToday: Math.max(0, CONFIG.AI_REQUESTS_PER_DAY - this.dailyRequests.count), usedToday: this.dailyRequests.count, totalUsed: this.dailyRequests.totalUsed || 0 };
  }

  async getAdvice(message, context = {}) {
    if (!message || !message.trim()) return 'Введите запрос для AI-коуча.';
    if (!this.canMakeRequest()) throw new Error('DAILY_LIMIT_REACHED');

    try {
      // увеличиваем счётчик (в любом случае — попытка)
      this.dailyRequests.count++;
      this.dailyRequests.totalUsed = (this.dailyRequests.totalUsed || 0) + 1;
      this._saveDailyRequests();

      // запросим через serverless-прокси
      const resp = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'advice', message, context })
      });

      if (!resp.ok) throw new Error('AI proxy error ' + resp.status);
      const data = await resp.json();
      // ожидаем { success: true, answer: '...' }
      if (data && data.answer) return data.answer;
      // fallback: если вернулся raw text
      if (typeof data === 'string') return data;
      return this._mockAdvice();
    } catch (err) {
      console.warn('AI getAdvice failed, using mock', err);
      return this._mockAdvice();
    }
  }

  async generateHabit(description, preferences = {}) {
    if (!description || !description.trim()) throw new Error('Введите описание для генерации привычки');
    if (!this.canMakeRequest()) throw new Error('DAILY_LIMIT_REACHED');

    try {
      this.dailyRequests.count++;
      this.dailyRequests.totalUsed = (this.dailyRequests.totalUsed || 0) + 1;
      this._saveDailyRequests();

      const resp = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'habit_generation', message: description, preferences })
      });

      if (!resp.ok) throw new Error('AI proxy error ' + resp.status);
      const data = await resp.json();
      if (data && data.habit) return data.habit;
      return this._generateMockHabit(description);
    } catch (err) {
      console.warn('AI generateHabit failed, fallback to mock', err);
      return this._generateMockHabit(description);
    }
  }

  _mockAdvice() {
    const arr = [
      'Последовательность важнее идеала — делайте немного, но регулярно.',
      'Начните с 5 минут в день — это даст устойчивый эффект.',
      'Свяжите новую привычку с уже существующим ритуалом.'
    ];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  _generateMockHabit(description='') {
    const candidates = [
      { name: 'Утренняя медитация', description: '5 минут медитации по утрам для спокойствия', color: '#2196F3', frequency: 'daily', motivationTips: ['Начните с 3 минут','Дышите глубоко'] },
      { name: 'Вечерний дневник', description: 'Записывайте 3 вещи, за которые благодарны', color: '#FF9800', frequency: 'daily', motivationTips: ['Пишите перед сном','Будьте кратки'] }
    ];
    return candidates[Math.floor(Math.random()*candidates.length)];
  }
}