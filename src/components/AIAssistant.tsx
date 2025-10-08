import React, { useState } from 'react';
import { useLanguage } from '@/i18n/i18n';

const AIAssistant = ({ onAddHabits, habitContext }: any) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const append = (m:any)=> setMessages(prev=>[...prev,m]);

  const handleSend = async ()=>{
    const text = input.trim(); if(!text) return;
    append({ role:'user', content:text }); setInput(''); setIsLoading(true);
    try {
      const resp = await fetch('/api/ai-chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages:[{role:'user', content:text}], habit: habitContext||null }) });
      if(!resp.ok){ append({role:'assistant', content:'AI error'}); setIsLoading(false); return; }
      const data = await resp.json();
      const assistantText = data.message || 'No response';
      append({ role:'assistant', content: assistantText });
      // try parse suggestions json
      try { const m = assistantText.match(/\{[\s\S]*\}/); if(m && onAddHabits){ const parsed = JSON.parse(m[0]); if(parsed?.suggestions) onAddHabits(parsed.suggestions.map((s:any)=>({ title: s.title||s.name||'Habit', quote: s.note||'', color: s.color||'#6366F1'}))); } } catch(e) {}
    } catch(e){ append({role:'assistant', content:'Connection error'}) } finally { setIsLoading(false) }
  }

  return (
    <div>
      <button onClick={()=>setOpen(true)} className="fixed bottom-6 right-6 bg-black text-white rounded-full px-4 py-3 shadow-lg">{t('aiCoach')}</button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-end">
          <div className="w-full md:w-1/3 h-full bg-white p-4 flex flex-col">
            <div className="flex-1 overflow-auto space-y-3">
              {messages.length===0 && <div className="text-sm text-gray-500">Ask to analyze a habit or get a 7-day plan.</div>}
              {messages.map((m,i)=>(<div key={i} className={'p-3 rounded '+(m.role==='assistant'?'bg-gray-100':'bg-black text-white')}>{m.content}</div>))}
              {isLoading && <div className="text-sm text-gray-500">AI is thinking…</div>}
            </div>
            <div className="flex gap-2 mt-3">
              <input value={input} onChange={(e:any)=>setInput(e.target.value)} className="flex-1 border p-2 rounded" placeholder="Например: Помоги внедрить привычку читать 20 минут" />
              <button onClick={handleSend} className="px-3 py-2 bg-black text-white rounded" disabled={isLoading}>{isLoading?'...':'Send'}</button>
              <button onClick={()=>setOpen(false)} className="px-3 py-2 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAssistant
