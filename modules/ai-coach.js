// modules/ai-coach.js — AI Коуч с реальной интеграцией

import { CONFIG } from '../config.js';
import StorageManager from './storage.js';

export default class AICoach {
    constructor() {
        this.storage = new StorageManager();
        this.apiKey = window.__ENV__?.OPENROUTER_API_KEY || null;
        this.baseURL = CONFIG.AI_API_URL;
        this.model = CONFIG.AI_MODEL;
        this.dailyRequests = this._loadDailyRequests();

        console.log('🤖 AI Coach доступен:', !!this.apiKey);
    }

    _today() {
        return new Date().toISOString().split('T')[0];
    }

    _loadDailyRequests() {
        const today = this._today();
        const saved = this.storage.getItem(CONFIG.STORAGE_KEYS.AI_REQUESTS) || {};
        if (saved.date !== today) {
            saved.date = today;
            saved.count = 0;
        }
        return saved;
    }

    _saveDailyRequests() {
        this.storage.setItem(CONFIG.STORAGE_KEYS.AI_REQUESTS, this.dailyRequests);
    }

    canRequest() {
        return this.dailyRequests.count < CONFIG.AI_REQUESTS_PER_DAY;
    }

    async getAdvice(prompt) {
        if (!this.canRequest()) throw new Error('DAILY_LIMIT_REACHED');
        if (!this.apiKey) return this._mockAdvice();

        try {
            this.dailyRequests.count++;
            this._saveDailyRequests();

            const body = {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Ты коуч по привычкам. Отвечай на русском, коротко и поддерживающе.'
                    },
                    { role: 'user', content: prompt }
                ]
            };

            const res = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error(`AI API error: ${res.status}`);
            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content || 'Не удалось получить ответ.';
            return text;
        } catch (err) {
            console.error('AI запрос не удался:', err);
            return this._mockAdvice();
        }
    }

    _mockAdvice() {
        const advices = [
            'Регулярность важнее идеала. Делай немного, но каждый день.',
            'Начни с малого — 3 минуты привычки лучше, чем ничего.',
            'Отмечай маленькие победы, они двигают тебя вперёд.'
        ];
        return advices[Math.floor(Math.random() * advices.length)];
    }
}