import React, { useEffect, useState } from 'react';
import HabitEditor from './components/HabitEditor';
import AIAssistant from './components/AIAssistant';

export default function App() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('habits_v1');
    if (stored) setHabits(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('habits_v1', JSON.stringify(habits));
  }, [habits]);

  function addHabit(h) {
    setHabits(prev => [h, ...prev]);
  }

  return (
    <div style={{fontFamily:'Inter, system-ui, sans-serif', padding:20, background:'linear-gradient(135deg,#f0f8ff,#fff0f6)', minHeight:'100vh'}}>
      <header style={{maxWidth:900, margin:'0 auto 20px'}}>
        <h1 style={{fontSize:28, margin:0}}>Habit-Craft-AI</h1>
        <p style={{color:'#475569'}}>AI coach to help create and keep habits (demo).</p>
      </header>
      <main style={{maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 320px', gap:20}}>
        <section>
          <HabitEditor onCreate={addHabit} />
          <div style={{marginTop:16}}>
            {habits.map(h => (
              <div key={h.id} style={{padding:12, background:'white', marginBottom:8, borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
                <strong>{h.title}</strong>
                <div style={{fontSize:12, color:'#6b7280'}}>every {h.days} day(s)</div>
              </div>
            ))}
          </div>
        </section>
        <aside>
          <AIAssistant />
        </aside>
      </main>
    </div>
  );
}
