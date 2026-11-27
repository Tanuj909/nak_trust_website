import { Globe } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className="language-switcher"
      aria-label="Choose Language"
    >
      <Globe size={13} className="lang-globe" style={{ color: '#fbbf24', marginLeft: 2, flexShrink: 0 }} />
      <button
        type="button"
        className={language === 'en' ? 'active' : ''}
        onClick={() => setLanguage('en')}
      >
        English
      </button>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>|</span>
      <button
        type="button"
        className={language === 'hi' ? 'active' : ''}
        onClick={() => setLanguage('hi')}
      >
        हिन्दी
      </button>
    </div>
  )
}
