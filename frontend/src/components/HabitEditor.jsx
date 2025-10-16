import React, { useState } from 'react';

export default function HabitEditor({ onCreate }) {
  const [title, setTitle] = useState('');
  const [days, setDays] = useState(1);

  function create() {
    if (!title.trim()) return alert('Введите название привычки');
    const h = { id: Date.now().toString(), title: title.trim(), days: Number(days), createdAt: new Date().toISOString() };
    onCreate(h);
    setTitle('');
    setDays(1);
  }

  return (
    <div style={{padding:16, background:'white', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Название привычки" style={{width:'100%', padding:8, borderRadius:8, border:'1px solid #e5e7eb'}}/>
      <div style={{display:'flex', gap:8, marginTop:12}}>
        <input type="number" value={days} onChange={e=>setDays(e.target.value)} min={1} style={{width:80, padding:8, borderRadius:8}}/>
        <button onClick={create} style={{background:'linear-gradient(90deg,#6366f1,#ec4899)', color:'white', padding:'8px 12px', borderRadius:999}}>Создать</button>
      </div>
    </div>
  );
}
