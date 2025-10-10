import React from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '@/i18n/i18n'

export default function Header(){
  const { t } = useLanguage();
  return (
    <header className="max-w-3xl mx-auto py-6 px-4 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
      </div>
    </header>
  )
}
