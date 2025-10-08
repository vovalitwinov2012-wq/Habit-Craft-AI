import React from 'react';
import { useLanguage } from '@/i18n/i18n';

export default function LanguageSwitcher(){
  const { lang, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-2">
      <button onClick={()=>setLanguage('en')} className={'px-2 py-1 rounded '+(lang==='en'?'bg-gray-900 text-white':'bg-white border')}>EN</button>
      <button onClick={()=>setLanguage('ru')} className={'px-2 py-1 rounded '+(lang==='ru'?'bg-gray-900 text-white':'bg-white border')}>RU</button>
    </div>
  )
}
