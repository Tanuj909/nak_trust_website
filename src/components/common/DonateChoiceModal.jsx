import { ArrowRight, HeartHandshake, LogIn, User, UserPlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../config/routes'
import { useLanguage } from '../../i18n/LanguageContext'

export const DONATE_CHOICE_EVENT = 'nak-open-donate-choice'

export function triggerDonateFlow(navigate, isAuthenticated, campaign = null) {
  if (isAuthenticated) {
    navigate(routes.donate, { state: { campaign } })
  } else {
    window.dispatchEvent(new CustomEvent(DONATE_CHOICE_EVENT, { detail: { campaign } }))
  }
}

export default function DonateChoiceModal() {
  const { isHindi } = useLanguage()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [campaign, setCampaign] = useState(null)

  useEffect(() => {
    const handleOpen = (e) => {
      setCampaign(e.detail?.campaign || null)
      setIsOpen(true)
    }
    window.addEventListener(DONATE_CHOICE_EVENT, handleOpen)
    return () => window.removeEventListener(DONATE_CHOICE_EVENT, handleOpen)
  }, [])

  if (!isOpen) return null

  const closeModal = () => {
    setIsOpen(false)
    setCampaign(null)
  }

  return (
    <div className="modal-overlay" onClick={closeModal} style={{ zIndex: 9999 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '26px 24px' }}>
        <button className="modal-close-btn" onClick={closeModal} aria-label="Close">
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            <HeartHandshake size={28} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0c2340', marginBottom: '6px' }}>
            {isHindi ? 'सहयोग करने का माध्यम चुनें' : 'Choose How to Donate'}
          </h3>
          <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {isHindi
              ? 'सदस्य के रूप में लॉगिन या पंजीकरण करके सहयोग करने पर आपकी रसीद व योगदान इतिहास आपके खाते में सुरक्षित रहता है।'
              : 'Logging in or registering links your contribution receipt and donation history directly to your member profile.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Option 1: Register or Login (Then Donate) */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0c2340', marginBottom: '4px' }}>
              {isHindi ? 'पंजीकरण या लॉगिन करें (फिर सहयोग करें)' : 'Register or Login (Then Donate)'}
            </div>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '12px', lineHeight: 1.45 }}>
              {isHindi
                ? 'यदि आप पहले से सदस्य हैं तो लॉगिन करें, या नए सदस्य के रूप में जुड़कर सहयोग करें।'
                : 'Sign in to your existing member account or register as a new member before donating.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  closeModal()
                  navigate(routes.login)
                }}
                style={{ justifyContent: 'center', gap: '6px', padding: '10px 12px', fontSize: '13px' }}
              >
                <LogIn size={16} />
                <span>{isHindi ? 'लॉगिन करें' : 'Login'}</span>
              </button>
              <button
                type="button"
                className="button button-gold"
                onClick={() => {
                  closeModal()
                  navigate(routes.registration)
                }}
                style={{ justifyContent: 'center', gap: '6px', padding: '10px 12px', fontSize: '13px' }}
              >
                <UserPlus size={16} />
                <span>{isHindi ? 'पंजीकरण करें' : 'Register'}</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '11.5px', fontWeight: 700 }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span>{isHindi ? 'अथवा' : 'OR'}</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Option 2: Continue as Guest */}
          <button
            type="button"
            onClick={() => {
              const selectedCampaign = campaign
              closeModal()
              navigate(routes.donate, { state: { campaign: selectedCampaign } })
            }}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1.5px solid #b45309',
              background: '#fffbeb',
              color: '#92400e',
              fontWeight: 800,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} />
              <span>{isHindi ? 'अतिथि के रूप में जारी रखें (Continue as Guest)' : 'Continue as Guest'}</span>
            </span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}

