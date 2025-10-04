// AI Coach with DeepSeek Integration
class AICoach {
    constructor() {
        this.storage = new StorageManager();
        this.dailyRequests = this.loadDailyRequests();
        this.apiKey = this.getApiKey();
        this.isAvailable = !!this.apiKey;
        this.baseURL = "https://openrouter.ai/api/v1";
        this.model = "deepseek/deepseek-chat-v3.1:free";
    }

    loadDailyRequests() {
        const today = this.getTodayKey();
        const requests = this.storage.getItem(CONFIG.STORAGE_KEYS.AI_REQUESTS) || { 
            date: today, 
            count: 0,
            totalUsed: 0
        };
        
        if (requests.date !== today) {
            requests.date = today;
            requests.count = 0;
            this.storage.setItem(CONFIG.STORAGE_KEYS.AI_REQUESTS, requests);
        }
        
        return requests;
    }

    canMakeRequest() {
        return this.dailyRequests.count < CONFIG.AI_REQUESTS_PER_DAY;
    }

    getRemainingRequests() {
        return Math.max(0, CONFIG.AI_REQUESTS_PER_DAY - this.dailyRequests.count);
    }

    async getAdvice(userMessage, context = {}) {
        if (!this.canMakeRequest()) {
            throw new Error('DAILY_LIMIT_REACHED');
        }

        if (!this.isAvailable) {
            return this.getMockAdvice(userMessage, context);
        }

        this.dailyRequests.count++;
        this.dailyRequests.totalUsed++;
        this.storage.setItem(CONFIG.STORAGE_KEYS.AI_REQUESTS, this.dailyRequests);

        try {
            const response = await this.makeAIRequest(userMessage, 'advice', context);
            return response;
        } catch (error) {
            console.error('AI Advice error:', error);
            return this.getMockAdvice(userMessage, context);
        }
    }

    async generateHabit(description, preferences = {}) {
        if (!this.canMakeRequest()) {
            throw new Error('DAILY_LIMIT_REACHED');
        }

        if (!this.isAvailable) {
            return this.generateMockHabit(description, preferences);
        }

        this.dailyRequests.count++;
        this.dailyRequests.totalUsed++;
        this.storage.setItem(CONFIG.STORAGE_KEYS.AI_REQUESTS, this.dailyRequests);

        try {
            const response = await this.makeAIRequest(description, 'habit_generation', preferences);
            return this.parseHabitResponse(response);
        } catch (error) {
            console.error('AI Habit generation error:', error);
            return this.generateMockHabit(description, preferences);
        }
    }

    async makeAIRequest(userMessage, type, context = {}) {
        const messages = this.buildMessages(userMessage, type, context);
        
        const requestBody = {
            model: this.model,
            messages: messages,
            max_tokens: type === 'habit_generation' ? 500 : 300,
            temperature: 0.7,
        };

        if (type === 'habit_generation') {
            requestBody.response_format = { type: "json_object" };
        }

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': this.getSiteURL(),
                'X-Title': this.getSiteName()
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from AI');
        }

        return data.choices[0].message.content;
    }

    buildMessages(userMessage, type, context) {
        if (type === 'habit_generation') {
            return [
                {
                    role: "system",
                    content: `Ты эксперт по формированию привычек. Создай структурированную привычку на основе описания пользователя.

Требования:
- Верни ТОЛЬКО JSON объект
- Формат строго соблюдай

JSON формат:
{
    "name": "Название привычки (2-4 слова)",
    "description": "Мотивирующее описание (1-2 предложения)",
    "color": "#4CAF50",
    "frequency": "daily",
    "motivationTips": ["Совет 1", "Совет 2", "Совет 3"]
}

Цвета: #4CAF50 (зеленый), #2196F3 (синий), #FF9800 (оранжевый), #9C27B0 (фиолетовый), #F44336 (красный)
Частоты: daily, weekdays, weekly`
                },
                {
                    role: "user",
                    content: `Создай привычку: "${userMessage}"`
                }
            ];
        } else {
            return [
                {
                    role: "system",
                    content: `Ты AI-коуч по привычкам. Дай короткий, практичный совет (2-3 предложения). Отвечай на русском. Будь поддерживающим.`
                },
                {
                    role: "user", 
                    content: userMessage
                }
            ];
        }
    }

    parseHabitResponse(response) {
        try {
            const cleanResponse = response.replace(/```json|```/g, '').trim();
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                throw new Error('No JSON found');
            }

            const habitData = JSON.parse(jsonMatch[0]);

            return {
                name: habitData.name || 'Новая привычка',
                description: habitData.description || 'Важная привычка для саморазвития',
                color: this.validateColor(habitData.color),
                frequency: this.validateFrequency(habitData.frequency),
                motivationTips: Array.isArray(habitData.motivationTips) ? habitData.motivationTips : []
            };
        } catch (error) {
            console.error('Failed to parse AI habit response:', error);
            return this.generateMockHabit();
        }
    }

    validateColor(color) {
        const allowedColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
        return allowedColors.includes(color) ? color : '#4CAF50';
    }

    validateFrequency(frequency) {
        const allowedFrequencies = ['daily', 'weekdays', 'weekly'];
        return allowedFrequencies.includes(frequency) ? frequency : 'daily';
    }

    getMockAdvice(userMessage, context) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const advicePool = [
                    "Помните: последовательность важнее перфекционизма. Лучше делать привычку регулярно, даже если неидеально, чем стремиться к совершенству и пропускать дни.",
                    "Начните с малого - даже 5 минут в день создают мощный импульс для изменений. Главное - сделать первый шаг сегодня.",
                    "Отслеживание прогресса - уже половина успеха! Тот факт, что вы задумываетесь о своих привычках, показывает вашу commitment к изменениям.",
                    "Свяжите новую привычку с уже существующей рутиной. Например, 'после утреннего кофе я буду медитировать 5 минут'.",
                    "Не ругайте себя за пропущенные дни. Вместо этого сосредоточьтесь на том, чтобы вернуться к привычке на следующий день."
                ];
                
                const randomAdvice = advicePool[Math.floor(Math.random() * advicePool.length)];
                resolve(randomAdvice);
            }, 800);
        });
    }

    generateMockHabit(description = "") {
        return new Promise((resolve) => {
            setTimeout(() => {
                const habits = [
                    {
                        name: "Утренняя медитация",
                        description: "Начните день с ясностью ума и внутренним спокойствием",
                        color: "#2196F3",
                        frequency: "daily",
                        motivationTips: [
                            "Начните с 3 минут и постепенно увеличивайте",
                            "Используйте дыхание как якорь внимания",
                            "Не судите себя за блуждающие мысли"
                        ]
                    },
                    {
                        name: "Вечерний дневник",
                        description: "Подведите итоги дня и подготовьтесь к завтрашнему",
                        color: "#FF9800",
                        frequency: "daily",
                        motivationTips: [
                            "Записывайте 3 благодарности за день",
                            "Отмечайте маленькие победы",
                            "Планируйте 3 главные задачи на завтра"
                        ]
                    }
                ];

                const selectedHabit = habits[Math.floor(Math.random() * habits.length)];
                resolve(selectedHabit);
            }, 1000);
        });
    }

    getApiKey() {
        return window.APP_CONFIG.OPENROUTER_API_KEY;
    }

    getSiteURL() {
        return window.location.origin;
    }

    getSiteName() {
        return CONFIG.APP_NAME;
    }

    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    getUsageStats() {
        return {
            usedToday: this.dailyRequests.count,
            remainingToday: this.getRemainingRequests(),
            totalUsed: this.dailyRequests.totalUsed,
            isAvailable: this.isAvailable,
            model: this.model
        };
    }
}

window.AICoach = AICoach;