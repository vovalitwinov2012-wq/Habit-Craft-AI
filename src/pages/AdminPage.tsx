import React, { useEffect, useState } from 'react';

const AdminPage: React.FC = () => {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [counters, setCounters] = useState<any[]>([]);

  const testAuth = async () => {
    try {
      const resp = await fetch('/api/admin-auth', { headers: { 'x-admin-secret': secret } });
      const j = await resp.json();
      if (j.ok) setAuthed(true);
      else alert('Unauthorized');
    } catch (e) { alert('Error'); }
  };

  const fetchAnalytics = async () => {
    try {
      const resp = await fetch('/api/admin-analytics', { headers: { 'x-admin-secret': secret } });
      const j = await resp.json();
      setEvents(j.events || []);
      setCounters(j.counters || []);
    } catch (e) { console.error(e); alert('Failed to fetch'); }
  };

  useEffect(()=>{ if (authed) fetchAnalytics(); }, [authed]);

  if (!authed) return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">Admin Panel (hidden)</h2>
      <div className="mb-3"><input value={secret} onChange={(e:any)=>setSecret(e.target.value)} placeholder="Enter admin secret" className="w-full border p-2 rounded" /></div>
      <button onClick={testAuth} className="px-4 py-2 bg-black text-white rounded">Enter</button>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
      <section className="mt-4">
        <h3 className="text-lg font-medium">Counters</h3>
        <ul>{counters.map((c:any)=><li key={c.id}>{c.key}: {c.value}</li>)}</ul>
      </section>
      <section className="mt-4">
        <h3 className="text-lg font-medium">Recent events</h3>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead><tr><th>time</th><th>event</th><th>owner</th><th>meta</th></tr></thead>
            <tbody>
              {events.map((ev:any)=> (
                <tr key={ev.id}><td>{new Date(ev.created_at).toLocaleString()}</td><td>{ev.event_type}</td><td>{ev.owner||'anon'}</td><td><pre className="text-xs">{JSON.stringify(ev.metadata)}</pre></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
