import { Check, Globe, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'

export default function LanguagePromptModal() {
  const { language, setLanguage } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if the user has already seen this prompt
    const hasSeen = localStorage.getItem('nsct_lang_prompt_seen')
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000) // Appears after exactly 3 seconds

      return () => clearTimeout(timer)
    }
  }, [])

  const handleSelectLanguage = (lang) => {
    setLanguage(lang)
    dismiss()
  }

  const dismiss = () => {
    setIsVisible(false)
    localStorage.setItem('nsct_lang_prompt_seen', 'true')
  }

  if (!isVisible) return null

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        background: 'linear-gradient(145deg, #0c2340 0%, #153860 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(245, 158, 11, 0.35)',
        animation: 'slideUpPrompt 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close language prompt"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#cbd5e1',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          border: 'none'
        }}
      >
        <X size={15} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
            color: '#0c2340',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}
        >
          <Globe size={22} />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', lineHeight: 1.25, margin: 0 }}>
            Choose Language / भाषा का चयन
          </h4>
          <p style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.5, margin: '4px 0 0' }}>
            You can browse this portal in English or Hindi. / आप इस पोर्टल को अंग्रेजी अथवा हिन्दी भाषा में पढ़ सकते हैं।
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <button
          type="button"
          onClick={() => handleSelectLanguage('hi')}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '12.5px',
            background: language === 'hi' ? '#f59e0b' : '#ffffff',
            color: language === 'hi' ? '#0c2340' : '#0c2340',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>🇮🇳 हिन्दी (Hindi)</span>
          {language === 'hi' && <Check size={14} />}
        </button>

        <button
          type="button"
          onClick={() => handleSelectLanguage('en')}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '12.5px',
            background: language === 'en' ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>🇬🇧 English</span>
          {language === 'en' && <Check size={14} />}
        </button>
      </div>

      <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '10.5px', color: '#94a3b8' }}>
        (You can switch language anytime from the top bar)
      </div>
    </div>
  )
}
