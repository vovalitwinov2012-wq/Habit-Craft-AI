import React, { useState } from 'react'
import { useLanguage } from '@/i18n/i18n'

export default function AIAssistant({onAddHabits, context}:{onAddHabits:any, context:any}){
  const { t } = useLanguage();
  const [open,setOpen]=useState(false);
  const [input,setInput]=useState('');
  const [messages,setMessages]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const send = async ()=>{
    if(!input.trim()) return;
    setMessages(prev=>[...prev,{role:'user',content:input}]);
    setLoading(true); setInput('');
    try{
      const res = await fetch('/api/ai-chat', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages:[{role:'user', content:input}], context })});
      const j = await res.json();
      const txt = j.message || 'No response';
      setMessages(prev=>[...prev,{role:'assistant', content: txt}]);
      try{ const m = txt.match(/\{[\s\S]*\}/); if(m){ const parsed = JSON.parse(m[0]); if(parsed.suggestions) onAddHabits(parsed.suggestions.map((s:any)=>({title:s.title, quote:s.note||'', completedDates:[]}))); } }catch(e){}
    }catch(e){ setMessages(prev=>[...prev,{role:'assistant', content:'Error connecting to AI'}]) }
    setLoading(false)
  }
  return (<div>
    <button onClick={()=>setOpen(true)} className="fixed bottom-6 right-6 bg-black text-white rounded-full px-4 py-3 shadow-lg">{t('aiCoach')}</button>
    {open && (<div className="fixed inset-0 bg-black/40 flex items-center justify-end">
      <div className="w-full md:w-1/3 h-full bg-white p-4 flex flex-col">
        <div className="flex-1 overflow-auto space-y-3">
          {messages.length===0 && <div className="text-sm text-gray-500">Ask me to create a 7-day plan for a habit.</div>}
          {messages.map((m,i)=>(<div key={i} className={'p-3 rounded '+(m.role==='assistant'?'bg-gray-100':'bg-black text-white')}>{m.content}</div>))}
        </div>
        <div className="flex gap-2 mt-3">
          <input value={input} onChange={(e:any)=>setInput(e.target.value)} className="flex-1 border p-2 rounded" placeholder="Например: Помоги внедрить привычку читать 20 минут" />
          <button onClick={send} className="px-3 py-2 bg-black text-white rounded" disabled={loading}>{loading?'...':'Send'}</button>
          <button onClick={()=>setOpen(false)} className="px-3 py-2 border rounded">Close</button>
        </div>
      </div>
    </div>)}
  </div>)
}
