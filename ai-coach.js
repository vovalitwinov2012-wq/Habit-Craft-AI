class AICoach {
    constructor() {
        this.dailyRequests = this.loadDailyRequests();
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Check if we have OpenRouter API key available
        this.apiKey = this.getOpenRouterApiKey();
        this.isInitialized = true;
    }

    loadDailyRequests() {
        const today = Utils.getTodayKey();
        const requests = Utils.loadData('ai-requests') || { date: today, count: 0 };
        
        // Reset counter if it's a new day
        if (requests.date !== today) {
            requests.date = today;
            requests.count = 0;
            Utils.saveData('ai-requests', requests);
        }
        
        return requests;
    }

    canMakeRequest() {
        return this.dailyRequests.count < CONFIG.AI_REQUESTS_PER_DAY;
    }

    getRemainingRequests() {
        return Math.max(0, CONFIG.AI_REQUESTS_PER_DAY - this.dailyRequests.count);
    }

    async getAICoachAdvice(content) {
        if (!this.canMakeRequest()) {
            throw new Error('daily_limit_reached');
        }

        // If no API key available, use mock response
        if (!this.apiKey) {
            return this.getMockAIResponse(content);
        }

        this.dailyRequests.count++;
        Utils.saveData('ai-requests', this.dailyRequests);

        try {
            const response = await this.makeOpenRouterRequest(content, 'advice');
            return response;
        } catch (error) {
            console.error('AI Coach error:', error);
            // Fallback to mock response on error
            return this.getMockAIResponse(content);
        }
    }

    async generateHabitFromDescription(description) {
        if (!this.canMakeRequest()) {
            throw new Error('daily_limit_reached');
        }

        // If no API key available, use mock response
        if (!this.apiKey) {
            return this.getMockHabitGeneration(description);
        }

        this.dailyRequests.count++;
        Utils.saveData('ai-requests', this.dailyRequests);

        try {
            const response = await this.makeOpenRouterRequest(description, 'habit_generation');
            return this.parseHabitGenerationResponse(response);
        } catch (error) {
            console.error('AI Habit generation error:', error);
            // Fallback to mock response on error
            return this.getMockHabitGeneration(description);
        }
    }

    async makeOpenRouterRequest(content, type) {
        const isHabitGeneration = type === 'habit_generation';
        
        const messages = isHabitGeneration ? 
            this.getHabitGenerationMessages(content) :
            this.getAdviceMessages(content);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': this.getSiteUrl(),
                'X-Title': this.getSiteName()
            },
            body: JSON.stringify({
                model: "qwen/qwen2.5-coder:32b-instruct",
                messages: messages,
                max_tokens: isHabitGeneration ? 300 : 150,
                temperature: 0.7,
                ...(isHabitGeneration && { response_format: { type: "json_object" } })
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from AI');
        }

        return data.choices[0].message.content;
    }

    getAdviceMessages(content) {
        return [
            {
                role: "system",
                content: `You are a helpful, supportive habit coach. Provide short, practical, and motivating advice (2-3 sentences maximum). 
                Focus on habit formation, productivity, and personal development. Be encouraging and specific.
                Respond in the same language as the user's message.`
            },
            {
                role: "user",
                content: content
            }
        ];
    }

    getHabitGenerationMessages(content) {
        return [
            {
                role: "system",
                content: `You are a habit creation expert. Generate a habit tracking object based on the user's description.
                Respond ONLY with a valid JSON object in this exact format:
                {
                    "name": "creative habit name",
                    "motivation": "inspirational motivation text",
                    "color": "#hexcolor"
                }
                
                Rules:
                - "name": Should be 2-4 words maximum, descriptive and catchy
                - "motivation": 1 short sentence explaining why this habit matters
                - "color": One of these exact hex codes: #4CAF50, #2196F3, #FF9800, #9C27B0, #F44336
                - Choose color based on habit type: green for health, blue for learning, orange for creativity, purple for mindfulness, red for important habits
                
                Make it personalized and relevant to the user's input.`
            },
            {
                role: "user",
                content: `Create a habit for: ${content}`
            }
        ];
    }

    parseHabitGenerationResponse(response) {
        try {
            // Clean the response in case there's extra text
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : response;
            
            const habitData = JSON.parse(jsonString);
            
            // Validate required fields
            if (!habitData.name || !habitData.motivation || !habitData.color) {
                throw new Error('Missing required habit fields');
            }

            // Validate color is from allowed list
            const allowedColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
            if (!allowedColors.includes(habitData.color)) {
                habitData.color = allowedColors[0]; // Default to green
            }

            return habitData;
        } catch (error) {
            console.error('Failed to parse AI habit response:', error);
            // Return a default habit if parsing fails
            return this.getMockHabitGeneration();
        }
    }

    getMockAIResponse(userMessage) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const responses = {
                    ru: {
                        motivation: "Помни: последовательность — ключ к успеху. Даже 5 минут ежедневно создают мощные привычки со временем!",
                        productivity: "Попробуй 'правило 2 минут' - если привычка занимает меньше 2 минут, делай её сразу.",
                        health: "Небольшие ежедневные улучшения ведут к remarkable результатам. Твой будущий я скажет спасибо!",
                        learning: "Знания, приобретаемые по 15 минут в день, за год превращаются в экспертизу. Продолжай в том же духе!",
                        default: "Сосредоточься на прогрессе, а не на совершенстве. Каждый маленький шаг ведет к большим целям."
                    },
                    en: {
                        motivation: "Remember: consistency is key. Even 5 minutes daily builds powerful habits over time!",
                        productivity: "Try the '2-minute rule' - if a habit takes less than 2 minutes, do it immediately.",
                        health: "Small daily improvements lead to remarkable results. Your future self will thank you!",
                        learning: "15 minutes of learning daily compounds into expertise over a year. Keep going!",
                        default: "Focus on progress, not perfection. Every small step counts toward your bigger goals."
                    }
                };

                const language = Utils.loadData('language') || 'ru';
                const langResponses = responses[language] || responses.ru;
                
                const lowerMessage = userMessage.toLowerCase();
                let response = langResponses.default;

                if (lowerMessage.includes('мотив') || lowerMessage.includes('motiv')) response = langResponses.motivation;
                if (lowerMessage.includes('прод') || lowerMessage.includes('product') || lowerMessage.includes('focus')) response = langResponses.productivity;
                if (lowerMessage.includes('здор') || lowerMessage.includes('health') || lowerMessage.includes('exercise')) response = langResponses.health;
                if (lowerMessage.includes('уч') || lowerMessage.includes('learn') || lowerMessage.includes('study')) response = langResponses.learning;

                resolve(response);
            }, 1000); // Simulate API delay
        });
    }

    getMockHabitGeneration(description = "") {
        return new Promise((resolve) => {
            setTimeout(() => {
                const habitTemplates = {
                    ru: [
                        {
                            name: "Утренняя медитация",
                            motivation: "Начать день с ясностью ума и спокойствием",
                            color: "#2196F3"
                        },
                        {
                            name: "Вечерний дневник",
                            motivation: "Подвести итоги дня и подготовиться к завтрашнему",
                            color: "#FF9800"
                        },
                        {
                            name: "Ежедневное чтение",
                            motivation: "Расширять знания и отдыхать от экранов",
                            color: "#9C27B0"
                        },
                        {
                            name: "Пить воду",
                            motivation: "Поддерживать водный баланс для энергии и здоровья",
                            color: "#2196F3"
                        },
                        {
                            name: "Утренняя зарядка",
                            motivation: "Зарядить тело энергией на весь день",
                            color: "#4CAF50"
                        }
                    ],
                    en: [
                        {
                            name: "Morning Meditation",
                            motivation: "Start the day with clarity and peace",
                            color: "#2196F3"
                        },
                        {
                            name: "Evening Journaling", 
                            motivation: "Reflect on the day and plan for tomorrow",
                            color: "#FF9800"
                        },
                        {
                            name: "Daily Reading",
                            motivation: "Expand knowledge and relax the mind",
                            color: "#9C27B0"
                        },
                        {
                            name: "Water Tracking",
                            motivation: "Stay hydrated for better health and energy",
                            color: "#2196F3"
                        },
                        {
                            name: "Morning Exercise",
                            motivation: "Energize your body for the day ahead",
                            color: "#4CAF50"
                        }
                    ]
                };

                const language = Utils.loadData('language') || 'ru';
                const templates = habitTemplates[language] || habitTemplates.ru;
                
                // If description contains keywords, try to match
                const lowerDesc = description.toLowerCase();
                let matchedHabit = null;

                if (lowerDesc.includes('медит') || lowerDesc.includes('meditat')) {
                    matchedHabit = templates.find(h => h.name.includes('Медита') || h.name.includes('Meditation'));
                } else if (lowerDesc.includes('чтен') || lowerDesc.includes('read')) {
                    matchedHabit = templates.find(h => h.name.includes('Чтен') || h.name.includes('Reading'));
                } else if (lowerDesc.includes('спорт') || lowerDesc.includes('exerc')) {
                    matchedHabit = templates.find(h => h.name.includes('Зарядк') || h.name.includes('Exercise'));
                } else if (lowerDesc.includes('вод') || lowerDesc.includes('water')) {
                    matchedHabit = templates.find(h => h.name.includes('Пить') || h.name.includes('Water'));
                } else if (lowerDesc.includes('дневник') || lowerDesc.includes('journal')) {
                    matchedHabit = templates.find(h => h.name.includes('Дневник') || h.name.includes('Journal'));
                }

                const randomHabit = matchedHabit || templates[Math.floor(Math.random() * templates.length)];
                resolve(randomHabit);
            }, 1500); // Simulate API delay
        });
    }

    getOpenRouterApiKey() {
        // Try to get API key from environment (Vercel will replace process.env during build)
        if (typeof process !== 'undefined' && process.env?.OPENROUTER_API_KEY) {
            return process.env.OPENROUTER_API_KEY;
        }
        
        // Try to get from window environment (fallback)
        if (typeof window !== 'undefined' && window.OPENROUTER_API_KEY) {
            return window.OPENROUTER_API_KEY;
        }
        
        // No API key available
        console.warn('OpenRouter API key not found. Using mock AI responses.');
        return null;
    }

    getSiteUrl() {
        if (typeof process !== 'undefined' && process.env?.SITE_URL) {
            return process.env.SITE_URL;
        }
        return window.location.origin;
    }

    getSiteName() {
        if (typeof process !== 'undefined' && process.env?.SITE_NAME) {
            return process.env.SITE_NAME;
        }
        return 'HabitCraft';
    }

    // Method to manually set API key (for testing)
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.isInitialized = true;
    }

    // Reset daily counter (for testing or admin purposes)
    resetDailyCounter() {
        this.dailyRequests.count = 0;
        Utils.saveData('ai-requests', this.dailyRequests);
    }

    // Get usage statistics
    getUsageStats() {
        return {
            used: this.dailyRequests.count,
            remaining: this.getRemainingRequests(),
            limit: CONFIG.AI_REQUESTS_PER_DAY,
            hasApiKey: !!this.apiKey
        };
    }
}

// Initialize global instance
window.AICoach = AICoach;