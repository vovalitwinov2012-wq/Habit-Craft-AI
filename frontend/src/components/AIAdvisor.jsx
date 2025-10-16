import React,{useState} from 'react';
import axios from 'axios';
export default function AIAdvisor() {
  const [prompt,setPrompt]=useState(''); const [response,setResponse]=useState('');
  const handleAsk=async()=>{ const res=await axios.post('/api/ai',{prompt}); setResponse(res.data); };
  return (<div className="ai-advisor">
    <input type="text" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Ask AI..." />
    <button onClick={handleAsk}>Ask AI</button><p>{response}</p>
  </div>);
}
