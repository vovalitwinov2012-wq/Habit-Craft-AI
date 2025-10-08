import React, { useState } from 'react';
import { createSyncCode, linkBySyncCode, logAnalytics } from '@/services/supabaseService';
import { getClientId } from '@/lib/clientId';
import { useLanguage } from '@/i18n/i18n';

export default function Settings(){
  const { t } = useLanguage();
  const [syncCode, setSyncCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [consent, setConsent] = useState(false);

  const gen = async ()=>{
    const code = await createSyncCode();
    setSyncCode(code);
    alert('Sync code: '+code);
  }

  const link = async ()=>{
    try{
      const owner = await linkBySyncCode(inputCode.trim());
      alert('Linked to '+owner);
    }catch(e){ alert('Not found') }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">{t('settings')}</h2>
      <div className="mb-3"><label className="flex items-center gap-2"><input type="checkbox" checked={consent} onChange={(e:any)=>{ setConsent(e.target.checked); logAnalytics('consent_changed',{consent:e.target.checked}, getClientId()) }} /> {t('consentAnalytics')}</label></div>
      <div className="mb-3"><button className="px-3 py-2 bg-black text-white rounded" onClick={gen}>{t('generateSyncCode')}</button>{syncCode && <span className="ml-2">{syncCode}</span>}</div>
      <div className="mb-3"><input value={inputCode} onChange={(e:any)=>setInputCode(e.target.value)} placeholder={t('enterSyncCode')} className="border p-2 rounded mr-2" /><button onClick={link} className="px-3 py-2 bg-black text-white rounded">Link</button></div>
    </div>
  )
}
