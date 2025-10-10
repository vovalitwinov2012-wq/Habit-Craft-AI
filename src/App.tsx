import React from 'react'
import Index from '@/pages/Index'
import AdminPage from '@/pages/AdminPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from '@/i18n/i18n'

export default function App(){
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Index/>} />
          <Route path='/admin' element={<AdminPage/>} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
