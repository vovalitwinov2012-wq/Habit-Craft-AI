import React, { createContext, useContext, useState } from 'react';
const translations:any = {
  en: { title: 'HabitCraft — minimal premium', addHabit:'Add habit', placeholderHabit:'New habit title', aiCoach:'AI Coach', settings:'Settings', premium:'Premium', language:'Language' },
  ru: { title: 'HabitCraft — минимализм + премиум', addHabit:'Добавить привычку', placeholderHabit:'Название привычки', aiCoach:'AI Коуч', settings:'Настройки', premium:'Премиум', language:'Язык' }
}
const LanguageContext = createContext<any>(null);
export const LanguageProvider:React.FC<any> = ({children})=>{
  const [lang, setLang] = useState<string>(localStorage.getItem('habit_lang')||'ru');
  const t = (k:string)=> translations[lang][k] ?? k;
  const setLanguage = (l:string)=> { setLang(l); try{ localStorage.setItem('habit_lang', l);}catch{} }
  return <LanguageContext.Provider value={{lang, setLanguage, t}}>{children}</LanguageContext.Provider>
}
export const useLanguage = ()=> useContext(LanguageContext);
