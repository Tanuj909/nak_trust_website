import { CreditCard, HeartHandshake, LogIn, LogOut, Menu, Shield, UserCheck, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { navigation } from '../../config/navigation'
import { routes } from '../../config/routes'
import { siteConfig } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { getMediaUrl, memberService } from '../../api'
import LanguageSwitcher from '../common/LanguageSwitcher'
import DonateModal from '../common/DonateModal'
import DigitalIdCard from '../common/DigitalIdCard'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showIdCardModal, setShowIdCardModal] = useState(false)
  const [cardData, setCardData] = useState(null)
  const [loadingCard, setLoadingCard] = useState(false)

  const { user, isAuthenticated, logout } = useAuth()
  const { isHindi } = useLanguage()
  const navigate = useNavigate()

  const closeMenu = () => setMobileMenuOpen(false)

  const handleLogoutClick = () => {
    closeMenu()
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    setShowLogoutConfirm(false)
    await logout()
    navigate('/')
  }

  // Handle instant opening of E-Card modal
  const handleOpenECard = async () => {
    closeMenu()
    setShowIdCardModal(true)
    if (!cardData && isAuthenticated) {
      setLoadingCard(true)
      try {
        const res = await memberService.getECard()
        const card = res?.data?.card || res?.data || {}
        setCardData(card)
      } catch (err) {
        // Fall back gracefully to user object from auth
      } finally {
        setLoadingCard(false)
      }
    }
  }

  const memberForCard = {
    id: cardData?.member_code || user?.membership?.member_code || user?.member_code || (user?.id ? `NSCT-${user.id}` : 'NSCT-MEMBER'),
    name: cardData?.name || user?.name || (isHindi ? 'सत्यापित सदस्य' : 'Verified Member'),
    fatherHusband: cardData?.father_husband_name || user?.profile?.father_husband_name || '',
    category: cardData?.category || user?.profile?.category || 'A',
    categoryName: `संवर्ग ${cardData?.category || user?.profile?.category || 'A'}`,
    district: cardData?.district || user?.profile?.district || (isHindi ? 'उत्तर प्रदेश' : 'Uttar Pradesh'),
    block: cardData?.block || user?.profile?.block || '',
    bloodGroup: cardData?.blood_group || user?.profile?.blood_group || 'O+',
    nomineeName: cardData?.nominee_name || user?.profile?.nominee_name || '',
    nomineeRelation: cardData?.nominee_relation || user?.profile?.nominee_relation || '',
    status: isHindi ? 'सत्यापित सक्रिय सदस्य (Active)' : 'Verified Active Member',
    joinDate: cardData?.joined_at || user?.membership?.joined_at || '',
    avatar: getMediaUrl(cardData?.photo_url || user?.image_url),
  }

  return (
    <>
      <header className="site-header no-print">
        <div className="container header-main">
          <Link to="/" className="brand" onClick={closeMenu}>
            <div className="brand-emblem">
              <Shield size={32} />
              <div className="emblem-seal" />
            </div>
            <div className="brand-text">
              <span className="brand-title-hindi">{siteConfig.hindiName}</span>
              <span className="brand-title-en">{siteConfig.name}</span>
              <div className="brand-meta">
                <span className="brand-reg-pill">{siteConfig.regNo.split(' ')[0] || 'Reg 130/2025'}</span>
                <span>• Govt. Registered Public Welfare Trust</span>
              </div>
            </div>
          </Link>

          <div className="header-quick-ctas">
            <button
              type="button"
              className="button button-gold button-small"
              onClick={() => setShowDonateModal(true)}
            >
              <HeartHandshake size={16} /> Donate Now
            </button>

            {isAuthenticated ? (
              <>
                <Link to={routes.dashboard} className="button button-primary button-small">
                  <UserCheck size={16} /> Dashboard
                </Link>
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={handleOpenECard}
                  style={{ borderColor: '#b45309', color: '#b45309', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <CreditCard size={15} /> E-Card
                </button>
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={handleLogoutClick}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to={routes.registration} className="button button-primary button-small">
                  <UserPlus size={16} /> Register
                </Link>
                <Link to={routes.login} className="button button-outline button-small">
                  <LogIn size={16} /> Login
                </Link>
              </>
            )}
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav className={`main-nav ${mobileMenuOpen ? 'is-open' : ''}`}>
          <div className="container nav-container">
            <ul className="nav-links">
              {navigation.map((item) => (
                <li key={item.key} className="nav-item">
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    onClick={closeMenu}
                  >
                    {item.title}
                    {item.key === 'cooperation' && <span className="nav-pill-badge">Live</span>}
                    {item.key === 'news' && <span className="nav-pill-badge" style={{ background: '#059669' }}>New</span>}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div style={{ padding: '12px 0', display: mobileMenuOpen ? 'flex' : 'none', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: '4px 0', marginBottom: 4 }}>
                <LanguageSwitcher />
              </div>
              <button
                type="button"
                className="button button-gold button-small"
                onClick={() => {
                  closeMenu()
                  setShowDonateModal(true)
                }}
              >
                <HeartHandshake size={16} /> Donate Now
              </button>

              {isAuthenticated ? (
                <>
                  <Link to={routes.dashboard} className="button button-primary button-small" onClick={closeMenu}>
                    <UserCheck size={16} /> Member Dashboard
                  </Link>
                  <button
                    type="button"
                    className="button button-outline button-small"
                    onClick={handleOpenECard}
                    style={{ borderColor: '#b45309', color: '#b45309', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <CreditCard size={15} /> Digital E-Card
                  </button>
                  <button
                    type="button"
                    className="button button-outline button-small"
                    onClick={handleLogoutClick}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to={routes.registration} className="button button-primary button-small" onClick={closeMenu}>
                    <UserPlus size={16} /> New Registration
                  </Link>
                  <Link to={routes.login} className="button button-outline button-small" onClick={closeMenu}>
                    <LogIn size={16} /> Member Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* FULL DIGITAL E-CARD MODAL (CLICKED FROM HEADER) */}
      {showIdCardModal && (
        <DigitalIdCard
          member={memberForCard}
          onClose={() => setShowIdCardModal(false)}
        />
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <LogOut size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0c2340', marginBottom: 8 }}>
              {isHindi ? 'लॉगआउट की पुष्टि' : 'Confirm Logout'}
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: 22, lineHeight: 1.5 }}>
              {isHindi ? 'क्या आप वाकई अपने सदस्य खाते से लॉगआउट करना चाहते हैं?' : 'Are you sure you want to logout from your member account?'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setShowLogoutConfirm(false)}
                style={{ minWidth: 100 }}
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                className="button button-gold"
                onClick={confirmLogout}
                style={{ minWidth: 100, background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
              >
                {isHindi ? 'हाँ, लॉगआउट करें' : 'Yes, Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DonateModal isOpen={showDonateModal} onClose={() => setShowDonateModal(false)} />
    </>
  )
}
