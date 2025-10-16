import React, { useState } from 'react';
import axios from 'axios';

export default function AIAdvisor() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleAsk = async () => {
    const cleaned = prompt.trim();
    if (!cleaned) {
      setResponse('');
      return;
    }
    try {
      const res = await axios.post('/api/ai', { prompt: cleaned });
      const message = res?.data?.message ?? (typeof res?.data === 'string' ? res.data : '');
      setResponse(message);
    } catch (error) {
      setResponse('Unable to reach AI. Please try again later.');
    }
  };

  return (
    <div className="ai-advisor">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask AI..."
      />
      <button onClick={handleAsk}>Ask AI</button>
      <p>{response}</p>
    </div>
  );
}
