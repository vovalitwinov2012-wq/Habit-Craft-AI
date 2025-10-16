import React from 'react';
import HabitCard from './HabitCard';
export default function HabitList({habits}) { return (<div className="habit-list">{habits.map((h,i)=><HabitCard key={i} habit={h} />)}</div>); }
