// modules/ai-coach.js — AI-коуч (реальный или mock)
// Возвращает краткие советы и может сгенерировать готовую привычку
// Экспортируется класс AICoach

import StorageManager from './storage.js';
import { CONFIG } from '../config.js';

export class AICoach {
    constructor() {
        this.storage = new StorageManager();
        this.requests = this._loadRequests();
        this.apiKey = this._getApiKey();
        this.isAvailable = !!this.apiKey && CONFIG.ENABLE_AI;
        this.model = CONFIG.AI_MODEL;
        this.baseURL = CONFIG.AI_API_URL;
    }

    _getApiKey() {
        // берем ключ из глобального места (безопаснее хранить вне репозитория)
        try {
            return window.APP_CONFIG?.OPENROUTER_API_KEY || null;
        } catch (e) {
            return null;
        }
    }

    _loadRequests() {
        const today = this._todayKey();
        const stored = this.storage.getItem(CONFIG.STORAGE_KEYS.AI_REQUESTS) || null;
        if (stored && stored.date === today) return stored;
        const obj = { date: today, count: 0, totalUsed: stored?.totalUsed || 0 };
        this.storage.setItem(CONFIG.STORAGE_KEYS.AI_REQUESTS, obj);
        return obj;
    }

    _incrementRequest() {
        this.requests.count++;
        this.requests.totalUsed++;
        this.storage.setItem(CONFIG.STORAGE_KEYS.AI_REQUESTS, this.requests);
    }

    canMakeRequest() {
        return this.requests.count < CONFIG.AI_REQUESTS_PER_DAY;
    }

    getUsageStats() {
        return {
            remainingToday: Math.max(0, CONFIG.AI_REQUESTS_PER_DAY - this.requests.count),
            usedToday: this.requests.count,
            totalUsed: this.requests.totalUsed
        };
    }

    async getAdvice(userMessage, context = {}) {
        if (!userMessage || !userMessage.trim()) return 'Пожалуйста, напишите вопрос.';
        if (!this.canMakeRequest()) throw new Error('DAILY_LIMIT_REACHED');

        if (!this.isAvailable) {
            // mock response
            this._incrementRequest();
            return this._mockAdvice(userMessage, context);
        }

        // реальный запрос
        this._incrementRequest();
        try {
            const result = await this._makeAIRequest(userMessage, 'advice', context);
            // ожидается, что API вернёт строку
            return result;
        } catch (err) {
            console.error('AI advice error', err);
            return this._mockAdvice(userMessage, context);
        }
    }

    async generateHabit(description, preferences = {}) {
        if (!description || !description.trim()) throw new Error('Введите описание для генерации привычки');
        if (!this.canMakeRequest()) throw new Error('DAILY_LIMIT_REACHED');

        if (!this.isAvailable) {
            this._incrementRequest();
            return this._mockGenerateHabit(description);
        }

        this._incrementRequest();
        try {
            const response = await this._makeAIRequest(description, 'habit_generation', preferences);
            // Парсим строку — если пришёл JSON, пытаемся распарсить, иначе возвращаем mock
            try {
                return this._parseHabitResponse(response);
            } catch (err) {
                console.warn('Failed to parse AI habit, fallback to mock', err);
                return this._mockGenerateHabit(description);
            }
        } catch (err) {
            console.error('AI habit generation error', err);
            return this._mockGenerateHabit(description);
        }
    }

    // Универсальная функция для внешнего вызова сетевого запроса
    async _makeAIRequest(userMessage, type, context = {}) {
        // Строим список сообщений для модели
        const messages = this._buildMessages(userMessage, type, context);
        const body = {
            model: this.model,
            messages,
            max_tokens: (type === 'habit_generation') ? 500 : 200,
            temperature: 0.7
        };

        // Для некоторых моделей может потребоваться другой формат, но используем openrouter-compatible endpoint
        const res = await fetch(`${this.baseURL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`AI API error ${res.status}: ${text}`);
        }

        const data = await res.json();
        // пытаемся извлечь содержимое (поддерживаем несколько форматов)
        // Шаблон: data.choices[0].message.content или data.data[0].text и т.п.
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }
        if (typeof data === 'string') return data;
        // fallback stringify
        return JSON.stringify(data);
    }

    _buildMessages(userMessage, type, context = {}) {
        if (type === 'habit_generation') {
            return [
                {
                    role: 'system',
                    content: `Ты эксперт по формированию привычек. Ответь только JSON-объектом в формате:
{
  "name": "Название привычки (2-4 слова)",
  "description": "Короткое мотивирующее описание",
  "color": "#4CAF50",
  "frequency": "daily",
  "motivationTips": ["Совет 1","Совет 2"]
}
Используй цвета: #4CAF50,#2196F3,#FF9800,#9C27B0,#F44336 и частоты: daily,weekdays,weekly.`
                },
                {
                    role: 'user',
                    content: `Создай привычку: "${userMessage}"`
                }
            ];
        } else {
            return [
                {
                    role: 'system',
                    content: 'Ты AI-коуч по привычкам. Дай короткий поддерживающий совет (2-3 предложения). Отвечай на русском.'
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ];
        }
    }

    // Парсер ответа для привычки — пытается найти JSON в тексте
    _parseHabitResponse(responseText) {
        if (!responseText) throw new Error('Empty AI response');
        // удаляем тройные бэктики и пытаемся взять JSON
        const cleaned = responseText.replace(/```json|```/g, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('No JSON found in AI response');
        const parsed = JSON.parse(match[0]);

        // валидация и нормализация
        const allowedColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
        const allowedFreq = ['daily', 'weekdays', 'weekly'];

        return {
            name: parsed.name || 'Новая привычка',
            description: parsed.description || '',
            color: allowedColors.includes(parsed.color) ? parsed.color : '#4CAF50',
            frequency: allowedFreq.includes(parsed.frequency) ? parsed.frequency : 'daily',
            motivationTips: Array.isArray(parsed.motivationTips) ? parsed.motivationTips : []
        };
    }

    // Mock совет
    _mockAdvice(userMessage) {
        const pool = [
            'Последовательность важнее идеала — делайте немного, но регулярно.',
            'Начните с 2–5 минут в день, чтобы привыкнуть к новой сущности.',
            'Свяжите привычку с существующим ритуалом — это повышает шанс выполнения.',
            'Отмечайте маленькие победы — это подпитывает мотивацию.',
            'Не наказывайте себя за пропуски, возвращайтесь к привычке на следующий день.'
        ];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // Mock генерация привычки
    _mockGenerateHabit(description = '') {
        const samples = [
            {
                name: 'Утренняя медитация',
                description: 'Начинайте день спокойным умом — 5 минут медитации после пробуждения.',
                color: '#2196F3',
                frequency: 'daily',
                motivationTips: ['Начните с 3 минут','Используйте дыхание','Прикрепите к утреннему ритуалу']
            },
            {
                name: 'Дневная прогулка',
                description: '15 минут прогулки в середине дня для перезагрузки и энергии.',
                color: '#4CAF50',
                frequency: 'weekdays',
                motivationTips: ['Пойдите в обед','Возьмите наушники с подкастом','Планируйте маршрут']
            }
        ];
        return samples[Math.floor(Math.random() * samples.length)];
    }

    _todayKey() {
        return new Date().toISOString().split('T')[0];
    }
}

export default AICoach;