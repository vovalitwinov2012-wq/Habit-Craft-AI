import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ru: {
    // App name
    appName: 'HabitCraft AI',
    appSubtitle: 'Создавайте привычки, достигайте целей',
    
    // Navigation
    home: 'Главная',
    statistics: 'Статистика',
    settings: 'Настройки',
    
    // Main page
    todayLabel: 'Сегодня:',
    completed: 'выполнено',
    searchPlaceholder: 'Поиск привычек...',
    allCategories: 'Все категории',
    sortByDate: 'По дате создания',
    sortByAlphabet: 'По алфавиту',
    sortBySuccess: 'По успешности',
    noHabits: 'Нет привычек',
    noHabitsDesc: 'Начните создавать отличные привычки!',
    notFound: 'Ничего не найдено',
    notFoundDesc: 'Попробуйте другой поисковый запрос',
    days: 'days',
    
    // Add Habit Dialog
    addHabit: 'Добавить привычку',
    habitName: 'Название привычки',
    habitNamePlaceholder: 'например, Утренняя пробежка',
    motivationalQuote: 'Мотивационная цитата (необязательно)',
    quotePlaceholder: 'Добавьте мотивационную цитату...',
    selectColor: 'Выберите цвет',
    category: 'Категория',
    selectCategory: 'Выберите категорию',
    goalDays: 'Цель (дней)',
    reminder: 'Напоминание',
    addHabitButton: 'Добавить привычку',
    habitAdded: 'Привычка добавлена!',
    habitDeleted: 'Привычка удалена',
    deleteConfirm: 'Удалить эту привычку?',
    
    // Categories
    health: 'Здоровье',
    sport: 'Спорт',
    learning: 'Обучение',
    work: 'Работа',
    hobby: 'Хобби',
    finance: 'Финансы',
    relationships: 'Отношения',
    other: 'Другое',
    
    // Statistics
    statisticsTitle: 'Статистика',
    statisticsSubtitle: 'Ваш прогресс в цифрах',
    totalCompletions: 'Всего выполнений',
    averageSuccess: 'Средняя успешность',
    completedToday: 'Выполнено сегодня',
    activeHabits: 'Активных привычек',
    bestHabit: 'Лучшая привычка',
    successRate: 'успешности',
    allHabits: 'Все привычки',
    noActiveHabits: 'Нет активных привычек',
    
    // Settings
    settingsTitle: 'Настройки',
    settingsSubtitle: 'Управление приложением',
    appearance: 'Внешний вид',
    darkTheme: 'Темная тема',
    darkThemeDesc: 'Переключение между светлой и темной темой',
    data: 'Данные',
    exportData: 'Экспортировать данные',
    importData: 'Импортировать данные',
    deleteAllData: 'Удалить все данные',
    dataExported: 'Данные экспортированы',
    dataImported: 'Данные импортированы',
    importError: 'Ошибка импорта данных',
    deleteAllConfirm: 'Вы уверены? Все данные будут удалены безвозвратно.',
    allDataDeleted: 'Все данные удалены',
    aboutApp: 'О приложении',
    version: 'Версия: 1.0.0',
    appDescription: 'HabitCraft AI - трекер привычек для достижения целей',
    dataStorageNote: 'Все данные хранятся локально в вашем браузере',
    
    // AI Assistant
    aiAssistant: 'AI Ассистент по привычкам',
    aiGreeting: 'Привет! Я ваш AI-помощник по привычкам. Могу помочь вам:\n\n• Предложить новые привычки\n• Дать советы по достижению целей\n• Помочь с мотивацией\n• Проанализировать ваш прогресс\n\nЧем могу помочь?',
    aiPlaceholder: 'Спросите о привычках...',
    quickActions: 'Быстрые действия:',
    suggestHealth: 'Предложи привычки для здоровья',
    howNotToQuit: 'Как не бросить привычку?',
    helpMotivation: 'Помоги с мотивацией',
    howToTrack: 'Как отслеживать прогресс?',
    addHabitsConfirm: 'Хотите добавить эти привычки в трекер?',
    habitsAddedCount: 'Добавлено {count} новых привычек!',
    aiError: 'Произошла ошибка. Попробуйте позже.',
    rateLimitError: 'Превышен лимит запросов. Пожалуйста, подождите немного.',
    paymentError: 'Необходимо пополнить баланс AI сервиса.',
    
    // Habit Detail
    editHabit: 'Редактировать',
    saveChanges: 'Сохранить изменения',
    cancelEdit: 'Отмена',
    deleteHabit: 'Удалить привычку',
    currentStreak: 'Текущая серия',
    bestStreak: 'Лучшая серия',
    progress: 'Прогресс',
    calendar: 'Календарь',
    goal: 'Цель',
    changesSaved: 'Изменения сохранены',
  },
  en: {
    // App name
    appName: 'HabitCraft AI',
    appSubtitle: 'Build habits, achieve goals',
    
    // Navigation
    home: 'Home',
    statistics: 'Statistics',
    settings: 'Settings',
    
    // Main page
    todayLabel: 'Today:',
    completed: 'completed',
    searchPlaceholder: 'Search habits...',
    allCategories: 'All categories',
    sortByDate: 'By creation date',
    sortByAlphabet: 'Alphabetically',
    sortBySuccess: 'By success rate',
    noHabits: 'No habits',
    noHabitsDesc: 'Start building great habits!',
    notFound: 'Nothing found',
    notFoundDesc: 'Try a different search query',
    days: 'days',
    
    // Add Habit Dialog
    addHabit: 'Add Habit',
    habitName: 'Habit Name',
    habitNamePlaceholder: 'e.g., Morning Run',
    motivationalQuote: 'Motivational Quote (optional)',
    quotePlaceholder: 'Add a motivational quote...',
    selectColor: 'Select Color',
    category: 'Category',
    selectCategory: 'Select Category',
    goalDays: 'Goal (days)',
    reminder: 'Reminder',
    addHabitButton: 'Add Habit',
    habitAdded: 'Habit added!',
    habitDeleted: 'Habit deleted',
    deleteConfirm: 'Delete this habit?',
    
    // Categories
    health: 'Health',
    sport: 'Sport',
    learning: 'Learning',
    work: 'Work',
    hobby: 'Hobby',
    finance: 'Finance',
    relationships: 'Relationships',
    other: 'Other',
    
    // Statistics
    statisticsTitle: 'Statistics',
    statisticsSubtitle: 'Your progress in numbers',
    totalCompletions: 'Total Completions',
    averageSuccess: 'Average Success',
    completedToday: 'Completed Today',
    activeHabits: 'Active Habits',
    bestHabit: 'Best Habit',
    successRate: 'success rate',
    allHabits: 'All Habits',
    noActiveHabits: 'No active habits',
    
    // Settings
    settingsTitle: 'Settings',
    settingsSubtitle: 'App management',
    appearance: 'Appearance',
    darkTheme: 'Dark Theme',
    darkThemeDesc: 'Toggle between light and dark theme',
    data: 'Data',
    exportData: 'Export Data',
    importData: 'Import Data',
    deleteAllData: 'Delete All Data',
    dataExported: 'Data exported',
    dataImported: 'Data imported',
    importError: 'Data import error',
    deleteAllConfirm: 'Are you sure? All data will be permanently deleted.',
    allDataDeleted: 'All data deleted',
    aboutApp: 'About App',
    version: 'Version: 1.0.0',
    appDescription: 'HabitCraft AI - Habit tracker to achieve your goals',
    dataStorageNote: 'All data is stored locally in your browser',
    
    // AI Assistant
    aiAssistant: 'AI Habit Assistant',
    aiGreeting: 'Hi! I\'m your AI habit assistant. I can help you:\n\n• Suggest new habits\n• Give advice on achieving goals\n• Help with motivation\n• Analyze your progress\n\nHow can I help?',
    aiPlaceholder: 'Ask about habits...',
    quickActions: 'Quick actions:',
    suggestHealth: 'Suggest health habits',
    howNotToQuit: 'How not to quit a habit?',
    helpMotivation: 'Help with motivation',
    howToTrack: 'How to track progress?',
    addHabitsConfirm: 'Would you like to add these habits to the tracker?',
    habitsAddedCount: 'Added {count} new habits!',
    aiError: 'An error occurred. Please try again later.',
    rateLimitError: 'Rate limit exceeded. Please wait a moment.',
    paymentError: 'AI service balance needs to be topped up.',
    
    // Habit Detail
    editHabit: 'Edit',
    saveChanges: 'Save Changes',
    cancelEdit: 'Cancel',
    deleteHabit: 'Delete Habit',
    currentStreak: 'Current Streak',
    bestStreak: 'Best Streak',
    progress: 'Progress',
    calendar: 'Calendar',
    goal: 'Goal',
    changesSaved: 'Changes saved',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    const stored = localStorage.getItem('habitcraft-language');
    if (stored === 'ru' || stored === 'en') {
      setLanguage(stored);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('habitcraft-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ru']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
