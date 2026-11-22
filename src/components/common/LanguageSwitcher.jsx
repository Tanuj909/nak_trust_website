import { Globe } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '9999px',
        padding: '2px 6px',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        gap: '4px'
      }}
      aria-label="Choose Language"
    >
      <Globe size={13} style={{ color: '#fbbf24', marginLeft: 2 }} />
      <button
        type="button"
        onClick={() => setLanguage('en')}
        style={{
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: language === 'en' ? 800 : 600,
          background: language === 'en' ? '#f59e0b' : 'transparent',
          color: language === 'en' ? '#0c2340' : '#cbd5e1',
          cursor: 'pointer',
          border: 'none',
          transition: 'all 0.2s'
        }}
      >
        English
      </button>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>|</span>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        style={{
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '11.5px',
          fontWeight: language === 'hi' ? 800 : 600,
          background: language === 'hi' ? '#f59e0b' : 'transparent',
          color: language === 'hi' ? '#0c2340' : '#cbd5e1',
          cursor: 'pointer',
          border: 'none',
          transition: 'all 0.2s'
        }}
      >
        हिन्दी
      </button>
    </div>
  )
}
