import { Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import { routes } from '../../config/routes'
import { useLanguage } from '../../i18n/LanguageContext'

export default function TickerBar() {
  const { isHindi } = useLanguage()

  return (
    <div className="ticker-bar no-print">
      <div className="container ticker-wrapper">
        <span className="ticker-badge">
          <span className="pulse-dot" />
          <Flame size={13} /> {isHindi ? 'सक्रिय सहयोग अपील' : 'Active Appeal'}
        </span>
        <div className="ticker-content">
          <span>
            {isHindi 
              ? '★ आपातकालीन दिवंगत सहायता: स्वर्गीय सदस्य राम प्रताप वर्मा (गोरखपुर) के नॉमिनी के खाते में सीधा सहयोग भेजें।'
              : '★ Urgent Demise Relief: Support family of late member Ram Pratap Verma (Gorakhpur) directly in nominee\'s SBI account.'}
            <Link to={routes.cooperation}>{isHindi ? 'अपील विवरण देखें →' : 'View Appeal Details →'}</Link>
          </span>
          <span style={{ marginLeft: '40px' }}>
            {isHindi
              ? '★ संवर्ग A, B, C एवं D हेतु ऑनलाइन सदस्यता पंजीकरण चालू है • पंजीकरण के तुरंत बाद डिजिटल स्मार्ट आईडी कार्ड प्राप्त करें।'
              : '★ Online Member Registration is Live for Category A, B, C & D • Download Digital Smart ID Card immediately after registration.'}
            <Link to={routes.registration}>{isHindi ? 'अभी पंजीकरण करें →' : 'Register Now →'}</Link>
          </span>
        </div>
      </div>
    </div>
  )
}

