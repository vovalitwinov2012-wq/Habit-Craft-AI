import React, { useState } from 'react';
import HabitList from './components/HabitList';
import AIAdvisor from './components/AIAdvisor';
import './styles.css';

export default function App() {
  const [habits, setHabits] = useState([]);

  return (
    <div className="app-container">
      <h1>Habit-Craft-AI</h1>
      <AIAdvisor />
      <HabitList habits={habits} setHabits={setHabits} />
    </div>
  );
}
