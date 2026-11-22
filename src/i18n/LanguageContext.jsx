import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import hi from './translations/hi.json'
import en from './translations/en.json'

const dictionaries = { hi, en }
const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('nsct_user_lang') || 'hi'
  })

  const setLanguage = (lang) => {
    setLanguageState(lang)
    localStorage.setItem('nsct_user_lang', lang)
  }

  const value = useMemo(() => ({
    language,
    isHindi: language === 'hi',
    setLanguage,
    t: (key, fallback = '') => {
      return dictionaries[language]?.[key] ?? dictionaries.hi?.[key] ?? fallback ?? key
    },
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
