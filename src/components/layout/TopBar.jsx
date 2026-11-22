import { Calendar, PhoneCall, ShieldCheck, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { routes } from '../../config/routes'
import { siteConfig } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import LanguageSwitcher from '../common/LanguageSwitcher'

export default function TopBar() {
  const { isAuthenticated } = useAuth()
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className="topbar no-print">
      <div className="container topbar-inner">
        <div className="topbar-info">
          <span className="topbar-item highlight">
            <ShieldCheck size={14} /> Reg. No. {siteConfig.regNo.split(' ')[0] || '130/2025'}
          </span>
          <span className="topbar-item">
            <PhoneCall size={13} /> Helpline: <strong>{siteConfig.helpline}</strong> (Toll Free: {siteConfig.tollFree})
          </span>
          <span className="topbar-item" style={{ display: 'none', lg: 'inline-flex' }}>
            <Calendar size={13} /> {today}
          </span>
        </div>

        <div className="topbar-right">
          <div className="topbar-actions">
            {isAuthenticated ? (
              <Link to={routes.dashboard} style={{ color: '#ffffff', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                <UserCheck size={13} /> Member Dashboard
              </Link>
            ) : (
              <Link to={routes.login} style={{ color: '#ffffff', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                <UserCheck size={13} /> Member Login
              </Link>
            )}
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
