import React, { useState } from 'react';
import HabitList from './components/HabitList';
import AIAdvisor from './components/AIAdvisor';
import { useTranslation } from 'react-i18next';
import './i18n';
import './styles.css';

export default function App() {
  const { t, i18n } = useTranslation();
  const [habits, setHabits] = useState([]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en');
  };

  return (
    <div className="app-container">
      <button onClick={toggleLanguage}>{t('change_language')}</button>
      <h1>{t('habit_craft_ai')}</h1>
      <AIAdvisor />
      <HabitList habits={habits} setHabits={setHabits} />
    </div>
  );
}
