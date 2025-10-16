import React, { useState } from 'react';
import axios from 'axios';

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  async function ask() {
    if (!prompt.trim()) return alert('Введите запрос');
    setLoading(true);
    setResult('');
    try {
      const resp = await axios.post('/api/openrouter', { messages: [{ role: 'user', content: prompt }] });
      const text = resp.data?.choices?.[0]?.message?.content || JSON.stringify(resp.data);
      setResult(String(text));
    } catch (err) {
      setResult('Ошибка AI: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{padding:16, background:'white', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
      <h3>AI-coach</h3>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Например: помоги создать привычку 'читать 20 мин'..." style={{width:'100%', height:100, padding:8, borderRadius:8}}/>
      <div style={{display:'flex', gap:8, marginTop:8}}>
        <button onClick={ask} style={{flex:1, padding:8, borderRadius:8, background:'linear-gradient(90deg,#6366f1,#ec4899)', color:'white'}} disabled={loading}>{loading ? 'Думаю...' : 'Спросить AI'}</button>
      </div>
      {result && <pre style={{marginTop:12, whiteSpace:'pre-wrap'}}>{result}</pre>}
    </div>
  );
}
