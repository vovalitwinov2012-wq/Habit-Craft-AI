class AICoach {
    constructor() {
        this.dailyRequests = this.loadDailyRequests();
    }

    loadDailyRequests() {
        const today = Utils.getTodayKey();
        const requests = Utils.loadData('ai-requests') || { date: today, count: 0 };
        
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

    async getAICoachAdvice(content) {
        if (!this.canMakeRequest()) {
            throw new Error('daily_limit_reached');
        }

        this.dailyRequests.count++;
        Utils.saveData('ai-requests', this.dailyRequests);

        // Mock AI response for demo purposes
        // In production, this would call OpenRouter API
        return this.mockAIResponse(content);
    }

    async generateHabitFromDescription(description) {
        if (!this.canMakeRequest()) {
            throw new Error('daily_limit_reached');
        }

        this.dailyRequests.count++;
        Utils.saveData('ai-requests', this.dailyRequests);

        // Mock AI response for demo purposes
        return this.mockHabitGeneration(description);
    }

    mockAIResponse(userMessage) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const responses = {
                    motivation: "Remember: consistency is key. Even 5 minutes daily builds powerful habits over time!",
                    productivity: "Try the '2-minute rule' - if a habit takes less than 2 minutes, do it immediately.",
                    health: "Small daily improvements lead to remarkable results. Your future self will thank you!",
                    default: "Focus on progress, not perfection. Every small step counts toward your bigger goals."
                };

                const lowerMessage = userMessage.toLowerCase();
                let response = responses.default;

                if (lowerMessage.includes('motivat')) response = responses.motivation;
                if (lowerMessage.includes('product') || lowerMessage.includes('focus')) response = responses.productivity;
                if (lowerMessage.includes('health') || lowerMessage.includes('exercise')) response = responses.health;

                resolve(response);
            }, 1500);
        });
    }

    mockHabitGeneration(description) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const habitTemplates = [
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
                    }
                ];

                const randomHabit = habitTemplates[Math.floor(Math.random() * habitTemplates.length)];
                resolve(randomHabit);
            }, 2000);
        });
    }

    getRemainingRequests() {
        return Math.max(0, CONFIG.AI_REQUESTS_PER_DAY - this.dailyRequests.count);
    }
}