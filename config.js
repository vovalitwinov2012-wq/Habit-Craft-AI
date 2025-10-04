export const config = {
  appName: 'Habit Craft',
  version: '1.0.0',
  maxHabits: 10,
  defaultSettings: {
    notifications: true,
    theme: 'light',
    language: 'en',
    reminderTime: '09:00',
    weeklyReview: true
  },
  aiSettings: {
    model: 'openai/gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.7
  }
};

export default config;