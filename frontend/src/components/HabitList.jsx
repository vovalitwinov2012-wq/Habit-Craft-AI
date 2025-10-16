import React from 'react';
import HabitCard from './HabitCard';

export default function HabitList({ habits, setHabits }) {
  return (
    <div className="habit-list">
      {habits.map((habit, i) => (
        <HabitCard key={i} habit={habit} />
      ))}
    </div>
  );
}
