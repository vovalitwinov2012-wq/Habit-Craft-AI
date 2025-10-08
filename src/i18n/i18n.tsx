import React, { createContext, useContext, useState } from 'react';

const translations: any = {
  en: {
    title: 'HabitCraft — minimal premium',
    addHabit: 'Add habit',
    placeholderHabit: 'New habit title',
    aiCoach: 'AI Coach',
    settings: 'Settings',
    consentAnalytics: 'Allow analytics (help improve product)',
    generateSyncCode: 'Generate Sync Code',
    enterSyncCode: 'Enter Sync Code',
    premium: 'Premium',
    upgrade: 'Upgrade',
    language: 'Language',
  },
  ru: {
    title: 'HabitCraft — минимализм + премиум',
    addHabit: 'Добавить привычку',
    placeholderHabit: 'Название привычки',
    aiCoach: 'AI Коуч',
    settings: 'Настройки',
    consentAnalytics: 'Разрешить аналитику (помочь улучшить продукт)',
    generateSyncCode: 'Сгенерировать код синхронизации',
    enterSyncCode: 'Ввести код синхронизации',
    premium: 'Премиум',
    upgrade: 'Обновить',
    language: 'Язык',
  }
};

const LanguageContext = createContext<any>(null);

export const LanguageProvider: React.FC<any> = ({ children }) => {
  const [lang, setLang] = useState<string>(localStorage.getItem('habitcraft_lang') || 'en');
  const t = (key: string) => translations[lang][key] ?? key;
  const setLanguage = (l: string) => { setLang(l); try { localStorage.setItem('habitcraft_lang', l); } catch {} };
  return <LanguageContext.Provider value={{ lang, setLanguage, t }}>{children}</LanguageContext.Provider>
};

export const useLanguage = () => useContext(LanguageContext);
