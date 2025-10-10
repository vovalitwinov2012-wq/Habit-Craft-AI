import React from 'react'
import { addDays, format } from 'date-fns'

export default function HabitCard({habit,onToggleDay,isPremium}:{habit:any,onToggleDay:any,isPremium:boolean}){
  const today = new Date();
  const week = Array.from({length:7}).map((_,i)=>addDays(today,i));
  const completed = new Set((habit.completedDates||[]).map((d:string)=>d.slice(0,10)));
  const completedCount = (habit.completedDates||[]).length;
  const total = Math.max(1, habit.goal||7);
  const percent = Math.round((completedCount/total)*100);
  return (
    <div className="p-4 rounded-2xl bg-white shadow">
      <div className="flex items-center justify-between mb-3">
        <div><div className="text-lg font-semibold">{habit.title}</div></div>
        <div className="text-sm font-medium">{percent}%</div>
      </div>
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full overflow-hidden"><div className="progress-bar" style={{width: percent+'%', background:isPremium?'linear-gradient(90deg,#111827,#6366F1)':'#cbd5e1'}}/></div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {week.map((d,idx)=>{ const iso=d.toISOString().slice(0,10); const checked=completed.has(iso); return (
          <button key={idx} onClick={()=>onToggleDay(iso)} className={`p-2 text-center rounded-lg ${checked?'bg-black text-white':'bg-white border'}`}>
            <div className="text-xs">{format(d,'EE')}</div>
            <div className="text-sm mt-1">{format(d,'d')}</div>
          </button>
        )})}
      </div>
    </div>
  )
}
