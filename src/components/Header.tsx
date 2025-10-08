import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/i18n/i18n';

export default function Header(){ const { t } = useLanguage(); return (
  <header className="max-w-4xl mx-auto py-6 px-4 flex items-center justify-between">
    <h1 className="text-2xl font-semibold">{t('title')}</h1>
    <div className="flex items-center gap-3">
      <LanguageSwitcher />
    </div>
  </header>
) }
