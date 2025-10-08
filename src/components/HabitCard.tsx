import React from 'react';
import { format, addDays } from 'date-fns';

const HabitCard = ({ habit, onToggleDay, isPremium }: any) => {
  const completedSet = new Set((habit.completedDates || []).map((d:string)=>d.slice(0,10)));
  const today = new Date();
  const week = Array.from({length:7}).map((_,i)=> addDays(today, i));
  const completedCount = (habit.completedDates||[]).length;
  const total = habit.totalDays || Math.max(1, habit.goal || 7);
  const percent = Math.min(100, Math.round((completedCount / total) * 100));

  return (
    <div className="p-4 rounded-2xl shadow bg-white">
      <div className="flex items-center justify-between mb-3">
        <div><div className="text-lg font-semibold">{habit.title}</div>{habit.quote && <div className="text-xs text-gray-500 mt-1">{habit.quote}</div>}</div>
        <div className="text-sm font-medium">{percent}%</div>
      </div>
      <div className="mb-3">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden"><div style={{width: percent+'%', background: isPremium? 'linear-gradient(90deg,#111827,#6366F1)' : 'linear-gradient(90deg,#9CA3AF,#D1D5DB)', height:'100%', transition:'width 0.7s'}}/></div>
      </div>
      <div className="flex gap-2 mt-2">
        {week.map((d, idx)=>{ const iso = d.toISOString().slice(0,10); const checked = completedSet.has(iso); return (<button key={idx} onClick={()=>onToggleDay(iso)} className={'flex-1 p-2 text-center rounded-lg '+(checked?(isPremium?'bg-gradient-to-r from-indigo-700 to-pink-500 text-white':'bg-black text-white'):'bg-white border') }><div className="text-xs">{format(d,'EE')}</div><div className="text-sm mt-1">{format(d,'d')}</div></button>) })}
      </div>
    </div>
  )
}

export default HabitCard
