import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import HabitCard from '@/components/HabitCard'
import AIAssistant from '@/components/AIAssistant'
import { loadHabits, saveHabits, syncHabits, createSyncCode, linkBySyncCode, logAnalytics } from '@/services/supabaseService'
import { getClientId, getSyncOwner } from '@/lib/clientId'
import { useLanguage } from '@/i18n/i18n'

export default function Index(){
  const { t } = useLanguage();
  const [habits, setHabits] = useState<any[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [isPremium, setIsPremium] = useState(false)

  useEffect(()=>{
    (async ()=>{
      const local = JSON.parse(localStorage.getItem('habitcraft_habits_local')||'[]')
      const remote = await loadHabits()
      if ((!remote || remote.length===0) && local && local.length>0) {
        await saveHabits(local)
        setHabits(local)
      } else {
        setHabits(remote || [])
      }
      logAnalytics('app_open', {}, getSyncOwner()||getClientId())
    })()
    const id = setInterval(async ()=>{
      const merged = await syncHabits(habits)
      if (merged) setHabits(merged)
    }, 10000)
    return ()=>clearInterval(id)
  }, [])

  const persist = async (newHabits:any[])=>{
    setHabits(newHabits)
    await saveHabits(newHabits)
    logAnalytics('habits_updated', { count: newHabits.length }, null)
  }

  const addHabit = ()=>{
    if(!newTitle.trim()) return;
    const h = { id: Date.now().toString(), title:newTitle.trim(), completedDates: [], completedDays:0, totalDays:7, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    const arr = [...habits, h]
    persist(arr)
    setNewTitle('')
  }

  const toggleDay = (habitId:string, dateISO:string)=>{
    const arr = habits.map(h=>{
      if (h.id!==habitId) return h
      const set = new Set(h.completedDates||[])
      if (set.has(dateISO)) set.delete(dateISO); else set.add(dateISO)
      const updated = { ...h, completedDates: Array.from(set), completedDays: Array.from(set).length, updatedAt: new Date().toISOString() }
      return updated
    })
    persist(arr)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-4 flex gap-2">
          <input value={newTitle} onChange={(e:any)=>setNewTitle(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder={t('placeholderHabit')} />
          <button onClick={addHabit} className="px-4 py-2 bg-black text-white rounded">{t('addHabit')}</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(h=>(<HabitCard key={h.id} habit={h} onToggleDay={(date)=>toggleDay(h.id,date)} isPremium={isPremium} />))}
        </div>
      </main>
      <AIAssistant onAddHabits={(list:any[])=>{ const mapped = list.map((s:any)=>({ id: Date.now().toString()+Math.random().toString(16).slice(2,6), title: s.title||s.name||'Habit', quote: s.quote||s.note||'', completedDates:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() })); persist([...habits, ...mapped]) }} />
    </div>
  )
}
