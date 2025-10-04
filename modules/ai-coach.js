// modules/ai-coach.js
// Обёртка над AI. Если нет API-ключа — работает в mock-режиме.

import { CONFIG } from '../config.js';

export class AICoach {
  constructor(storage) {
    this.storage = storage;
    this.requestsKey = CONFIG.STORAGE_KEYS.AI_REQUESTS || 'ai_requests';
    this.apiKey = window.APP_CONFIG?.OPENROUTER_API_KEY || null;
    this.available = !!this.apiKey;
    this._loadRequests();
  }

  _loadRequests() {
    const todayKey = this._todayKey();
    const data = this.storage.getItem(this.requestsKey) || { date: todayKey, count: 0, total: 0 };
    if (data.date !== todayKey) {
      data.date = todayKey;
      data.count = 0;
    }
    this.usage = data;
  }

  _todayKey() {
    return new Date().toISOString().slice(0,10);
  }

  _inc() {
    this.usage.count = (this.usage.count || 0) + 1;
    this.usage.total = (this.usage.total || 0) + 1;
    this.storage.setItem(this.requestsKey, this.usage);
  }

  getUsageStats() {
    return {
      remainingToday: Math.max(0, (CONFIG.AI_REQUESTS_PER_DAY || 5) - (this.usage.count || 0)),
      usedToday: this.usage.count || 0
    };
  }

  async getAdvice(message, context = {}) {
    if ((this.usage.count || 0) >= (CONFIG.AI_REQUESTS_PER_DAY || 5)) {
      throw new Error('DAILY_LIMIT_REACHED');
    }
    if (!message) return 'Введите вопрос для AI.';
    if (!this.available) {
      return this._mockAdvice(message);
    }
    this._inc();
    try {
      const body = {
        model: CONFIG.AI_MODEL,
        messages: [
          { role: 'system', content: 'Ты AI-коуч по привычкам. Коротко и поддерживающе.' },
          { role: 'user', content: message }
        ],
        max_tokens: 250,
        temperature: 0.7
      };
      const resp = await fetch(CONFIG.AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
        body: JSON.stringify(body)
      });
      if (!resp.ok) throw new Error('AI API error ' + resp.status);
      const json = await resp.json();
      // Ожидаем стандартный openai-like ответ
      const content = json.choices?.[0]?.message?.content || json.choices?.[0]?.text || '';
      return content;
    } catch (e) {
      console.warn('AI request failed, using mock', e);
      return this._mockAdvice(message);
    }
  }

  async generateHabit(description) {
    if ((this.usage.count || 0) >= (CONFIG.AI_REQUESTS_PER_DAY || 5)) {
      throw new Error('DAILY_LIMIT_REACHED');
    }
    if (!description) throw new Error('Empty description');

    if (!this.available) {
      return this._mockHabit(description);
    }

    this._inc();

    // Попросим модель вернуть JSON-объект с привычкой
    const systemPrompt = `
Ты эксперт по формированию привычек. Верни ТОЛЬКО JSON объект следующего формата:
{"name":"...", "description":"...", "color":"#4CAF50", "frequency":"daily", "motivationTips":["..."] }
Чётко и кратко. Частоты: daily, weekdays, weekly. Цвета: #4CAF50,#2196F3,#FF9800,#9C27B0,#F44336.
`;
    try {
      const body = {
        model: CONFIG.AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Создай привычку: ${description}` }
        ],
        max_tokens: 400,
        temperature: 0.7
      };
      const resp = await fetch(CONFIG.AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
        body: JSON.stringify(body)
      });
      if (!resp.ok) throw new Error('AI API error ' + resp.status);
      const json = await resp.json();
      const raw = json.choices?.[0]?.message?.content || json.choices?.[0]?.text || '';
      // Попытка извлечь JSON из ответа
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : JSON.parse(raw);
      // валидация
      parsed.name = parsed.name || 'Новая привычка';
      parsed.description = parsed.description || '';
      parsed.color = ['#4CAF50','#2196F3','#FF9800','#9C27B0','#F44336'].includes(parsed.color) ? parsed.color : '#4CAF50';
      parsed.frequency = ['daily','weekdays','weekly'].includes(parsed.frequency) ? parsed.frequency : 'daily';
      parsed.motivationTips = Array.isArray(parsed.motivationTips) ? parsed.motivationTips : [];
      return parsed;
    } catch (e) {
      console.warn('AI generate failed, mock used', e);
      return this._mockHabit(description);
    }
  }

  _mockAdvice(message) {
    const pool = [
      "Последовательность важнее идеальности — делайте шаги регулярно.",
      "Начните с малого: даже 3–5 минут в день дадут эффект.",
      "Свяжите новую привычку с уже существующим ритуалом, это увеличит вероятность успеха."
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  _mockHabit(description) {
    const sample = {
      name: 'Утренняя зарядка',
      description: 'Короткая зарядка для энергии в начале дня.',
      color: '#4CAF50',
      frequency: 'daily',
      motivationTips: ['Начинайте с 3 минут', 'Поставьте напоминание', 'Сделайте это частью утреннего ритуала']
    };
    return sample;
  }
}