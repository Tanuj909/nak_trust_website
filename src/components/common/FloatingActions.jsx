import { ArrowUp, HeartHandshake, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { triggerDonateFlow } from './DonateChoiceModal'

export default function FloatingActions() {
  const { isHindi } = useLanguage()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openWhatsApp = () => {
    window.open(`https://wa.me/919452081234?text=${encodeURIComponent('नमस्ते NSCT / NAK Trust, मुझे सदस्यता एवं सहयोग संबंधी जानकारी चाहिए।')}`, '_blank')
  }

  return (
    <div className="floating-actions no-print">
      <button
        className="floating-btn floating-donate-btn"
        onClick={() => triggerDonateFlow(navigate, isAuthenticated)}
        title={isHindi ? 'तुरंत सहयोग करें' : 'Donate Now'}
        aria-label="Donate"
      >
        <HeartHandshake size={24} />
      </button>

      <button
        className="floating-btn floating-whatsapp-btn"
        onClick={openWhatsApp}
        title={isHindi ? 'WhatsApp हेल्पलाइन' : 'WhatsApp Helpline'}
        aria-label="WhatsApp"
      >
        <MessageCircle size={24} />
      </button>

      <button
        className="floating-btn floating-top-btn"
        onClick={scrollToTop}
        title={isHindi ? 'ऊपर जाएं' : 'Scroll to top'}
        aria-label="Scroll to top"
      >
        <ArrowUp size={22} />
      </button>
    </div>
  )
}
