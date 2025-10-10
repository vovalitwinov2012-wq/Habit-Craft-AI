import React, { useState } from 'react'
import { createSyncCode, linkBySyncCode } from '@/services/supabaseService'
import { useLanguage } from '@/i18n/i18n'

export default function Settings(){
  const { t } = useLanguage()
  const [sync, setSync] = useState(''); const [code, setCode] = useState('')
  const gen = async ()=>{ const c = await createSyncCode(); setSync(c); alert('Sync code: '+c) }
  const link = async ()=>{ try{ const owner = await linkBySyncCode(code.trim()); alert('Linked: '+owner) }catch(e){ alert('Not found') } }
  return (<div className="p-6 max-w-xl mx-auto"><h2 className="text-xl font-semibold mb-4">{t('settings')}</h2><div className="mb-3"><button className="px-3 py-2 bg-black text-white rounded" onClick={gen}>{t('generateSyncCode')}</button>{sync && <span className="ml-2">{sync}</span>}</div><div className="mb-3"><input value={code} onChange={(e:any)=>setCode(e.target.value)} placeholder={t('enterSyncCode')} className="border p-2 rounded mr-2"/><button onClick={link} className="px-3 py-2 bg-black text-white rounded">Link</button></div></div>)
}
