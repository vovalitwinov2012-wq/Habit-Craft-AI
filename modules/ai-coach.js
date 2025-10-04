// Advanced AI Coach with DeepSeek Integration
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
            // Fallback to mock response
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

        // Add response format for habit generation
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
            const errorText = await response.text();
            console.error('AI API response error:', response.status, errorText);
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

Требования к ответу:
- Верни ТОЛЬКО JSON объект
- Не добавляй никакого дополнительного текста
- Формат должен быть строго соблюден

Формат JSON:
{
    "name": "Креативное название привычки (2-4 слова)",
    "description": "Мотивирующее описание почему эта привычка важна (1-2 предложения)",
    "color": "#4CAF50",
    "frequency": "daily",
    "motivationTips": ["Совет 1", "Совет 2", "Совет 3"]
}

Доступные цвета (выбери один): 
#4CAF50 (зеленый - для здоровья и спорта),
#2196F3 (синий - для обучения и продуктивности), 
#FF9800 (оранжевый - для творчества и хобби),
#9C27B0 (фиолетовый - для духовных практик),
#F44336 (красный - для важных и срочных дел)

Доступные частоты:
- "daily" (ежедневно)
- "weekdays" (только по будням)
- "weekly" (только по выходным)

Сделай привычку персонализированной и мотивирующей на основе описания пользователя.`
                },
                {
                    role: "user",
                    content: `Создай привычку на основе этого описания: "${userMessage}"`
                }
            ];
        } else {
            return [
                {
                    role: "system",
                    content: `Ты персональный AI-коуч по формированию привычек. Твоя задача - давать короткие, практичные и мотивирующие советы.

Правила:
- Отвечай на русском языке
- Будь поддерживающим и конкретным
- Длина ответа: 2-3 предложения
- Фокус на практических действиях
- Учитывай контекст привычек пользователя

Контекст пользователя: ${JSON.stringify(context)}`
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
            // Clean the response from any markdown code blocks
            const cleanResponse = response.replace(/```json|```/g, '').trim();
            
            // Try to find JSON in the response
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const habitData = JSON.parse(jsonMatch[0]);

            // Validate required fields and set defaults
            return {
                name: habitData.name || 'Новая привычка',
                description: habitData.description || 'Важная привычка для саморазвития',
                color: this.validateColor(habitData.color),
                frequency: this.validateFrequency(habitData.frequency),
                motivationTips: Array.isArray(habitData.motivationTips) ? habitData.motivationTips : [
                    "Начните с малого - даже 5 минут в день создают мощный импульс",
                    "Отслеживайте прогресс - это мотивирует продолжать",
                    "Не ругайте себя за пропуски, просто возвращайтесь к привычке"
                ]
            };
        } catch (error) {
            console.error('Failed to parse AI habit response:', error, 'Response:', response);
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

    // Mock responses for when AI is not available
    getMockAdvice(userMessage, context) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const advicePool = [
                    "Помните: последовательность важнее перфекционизма. Лучше делать привычку регулярно, даже если неидеально, чем стремиться к совершенству и пропускать дни.",
                    "Начните с малого - даже 5 минут в день создают мощный импульс для изменений. Главное - сделать первый шаг сегодня.",
                    "Отслеживание прогресса - уже половина успеха! Тот факт, что вы задумываетесь о своих привычках, показывает вашу commitment к изменениям.",
                    "Свяжите новую привычку с уже существующей рутиной. Например, 'после утреннего кофе я буду медитировать 5 минут'.",
                    "Не ругайте себя за пропущенные дни. Вместо этого сосредоточьтесь на том, чтобы вернуться к привычке на следующий день.",
                    "Создайте поддерживающее окружение для вашей привычки. Подготовьте все необходимое с вечера, чтобы утром не тратить время на поиски.",
                    "Празднуйте маленькие победы! Каждая неделя регулярного выполнения привычки - это достижение, которое заслуживает признания."
                ];
                
                // Try to match advice to user's message
                const lowerMessage = userMessage.toLowerCase();
                let matchedAdvice = advicePool[Math.floor(Math.random() * advicePool.length)];

                if (lowerMessage.includes('мотив') || lowerMessage.includes('лень')) {
                    matchedAdvice = "Мотивация приходит через действие. Начните с маленького шага - просто подготовьтесь к привычке. Часто сам процесс подготовки запускает желание продолжить.";
                } else if (lowerMessage.includes('врем') || lowerMessage.includes('занят')) {
                    matchedAdvice = "Используйте 'правило двух минут'. Если кажется, что нет времени, пообещайте себе делать привычку всего 2 минуты. Часто этого достаточно, чтобы продолжить дальше.";
                } else if (lowerMessage.includes('устал') || lowerMessage.includes('устан')) {
                    matchedAdvice = "В дни усталости уменьшайте планку. Лучше сделать привычку в упрощенном виде, чем пропустить completely. Перфекционизм - враг прогресса.";
                }

                resolve(matchedAdvice);
            }, 800); // Shorter delay for mock responses
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
                    },
                    {
                        name: "Ежедневная активность",
                        description: "Поддерживайте физическую форму и энергию в течение дня",
                        color: "#4CAF50",
                        frequency: "daily",
                        motivationTips: [
                            "Используйте лестницу вместо лифта",
                            "Делайте 5-минутные перерывы на разминку",
                            "Начните с коротких прогулок"
                        ]
                    },
                    {
                        name: "Осознанное питание",
                        description: "Питайтесь с вниманием к потребностям тела",
                        color: "#9C27B0", 
                        frequency: "daily",
                        motivationTips: [
                            "Ешьте без отвлечений на телефон",
                            "Тщательно пережевывайте пищу",
                            "Слушайте сигналы голода и насыщения"
                        ]
                    }
                ];

                let selectedHabit = habits[Math.floor(Math.random() * habits.length)];
                
                // Customize based on description keywords
                const lowerDesc = description.toLowerCase();
                
                if (lowerDesc.includes('бег') || lowerDesc.includes('пробеж') || lowerDesc.includes('спорт')) {
                    selectedHabit = {
                        name: "Регулярные тренировки",
                        description: "Укрепляйте тело и повышайте энергию через физическую активность",
                        color: "#4CAF50",
                        frequency: "weekdays",
                        motivationTips: [
                            "Начните с коротких 15-минутных сессий",
                            "Подготовьте спортивную форму с вечера",
                            "Фокусируйтесь на удовольствии от движения"
                        ]
                    };
                } else if (lowerDesc.includes('чтение') || lowerDesc.includes('книг') || lowerDesc.includes('учит')) {
                    selectedHabit = {
                        name: "Ежедневное чтение",
                        description: "Расширяйте кругозор и находите время для саморазвития",
                        color: "#2196F3",
                        frequency: "daily",
                        motivationTips: [
                            "Читайте хотя бы 10 страниц в день",
                            "Носите книгу с собой для чтения в очередях",
                            "Ведите список интересных цитат"
                        ]
                    };
                } else if (lowerDesc.includes('вод') || lowerDesc.includes('пить') || lowerDesc.includes('гидрат')) {
                    selectedHabit = {
                        name: "Регулярное питье воды",
                        description: "Поддерживайте водный баланс для здоровья и энергии",
                        color: "#2196F3",
                        frequency: "daily",
                        motivationTips: [
                            "Поставьте бутылку с водой на рабочем столе",
                            "Пейте по стакану воды перед каждым приемом пищи",
                            "Установите напоминания в телефоне"
                        ]
                    };
                } else if (lowerDesc.includes('сон') || lowerDesc.includes('спать') || lowerDesc.includes('отдых')) {
                    selectedHabit = {
                        name: "Здоровый сон",
                        description: "Обеспечивайте качественный отдых для тела и ума",
                        color: "#9C27B0",
                        frequency: "daily",
                        motivationTips: [
                            "Создайте ритуал перед сном",
                            "Отключайте гаджеты за час до сна",
                            "Поддерживайте регулярное время подъема"
                        ]
                    };
                }

                resolve(selectedHabit);
            }, 1000);
        });
    }

    getApiKey() {
        // In production, this would come from environment variables
        // For Vercel, we check for process.env
        if (typeof process !== 'undefined' && process.env?.OPENROUTER_API_KEY) {
            return process.env.OPENROUTER_API_KEY;
        }
        
        // For client-side, we might have a global variable
        if (typeof window !== 'undefined' && window.OPENROUTER_API_KEY) {
            return window.OPENROUTER_API_KEY;
        }
        
        // Check if there's an API key in the storage (for demo purposes)
        const storedKey = this.storage.getItem('openrouter_api_key');
        if (storedKey) {
            return storedKey;
        }
        
        console.warn('OpenRouter API key not found. Using mock AI responses.');
        return null;
    }

    getSiteURL() {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return 'https://habitcraft.ai';
    }

    getSiteName() {
        return CONFIG.APP_NAME || 'HabitCraft AI';
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

    // Method to manually set API key (for testing)
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.isAvailable = true;
        this.storage.setItem('openrouter_api_key', apiKey);
    }

    // Reset for testing
    resetDailyLimit() {
        this.dailyRequests.count = 0;
        this.storage.setItem(CONFIG.STORAGE_KEYS.AI_REQUESTS, this.dailyRequests);
    }

    // Test API connection
    async testConnection() {
        if (!this.isAvailable) {
            return { success: false, error: 'API key not available' };
        }

        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': this.getSiteURL(),
                    'X-Title': this.getSiteName()
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: "user", content: "Say 'Hello' in Russian" }],
                    max_tokens: 10
                })
            });

            if (response.ok) {
                return { success: true, message: 'API connection successful' };
            } else {
                return { success: false, error: `API returned status: ${response.status}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Update CONFIG to use DeepSeek model
if (typeof CONFIG !== 'undefined') {
    CONFIG.AI_MODEL = "deepseek/deepseek-chat-v3.1:free";
    CONFIG.AI_API_URL = "https://openrouter.ai/api/v1/chat/completions";
}

window.AICoach = AICoach;