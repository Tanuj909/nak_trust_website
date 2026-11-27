import { Building, Globe, HeartHandshake, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { routes } from '../../config/routes'
import { siteConfig } from '../../config/site'

export default function Footer() {
  return (
    <footer className="site-footer no-print">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f59e0b', color: '#07172c', display: 'grid', placeItems: 'center' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, color: '#ffffff', fontWeight: 900, marginBottom: 2 }}>{siteConfig.name}</h3>
              <p style={{ fontSize: 11, color: '#fde68a', fontWeight: 700 }}>{siteConfig.hindiName}</p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>
            National Self Care Team (NAK Trust ORG) is an autonomous, non-political, 100% transparent mutual socio-economic welfare trust registered under the Indian Public Trust Act (Registration No. 130/2025). Our primary objective is to provide mutual financial and social security to citizens in times of crisis.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: 8, borderLeft: '3px solid #f59e0b', fontSize: 12, color: '#f1f5f9' }}>
            <strong>Motto:</strong> "Service is the Highest Duty • Of Everyone, For Everyone, By Everyone"
          </div>
        </div>

        <div className="footer-col">
          <h3>
            <Globe size={16} /> Quick Links
          </h3>
          <ul className="footer-links">
            <li><Link to={routes.home}>Home</Link></li>
            <li><Link to={routes.about}>About Organization</Link></li>
            <li><Link to={routes.schemes}>Welfare Schemes</Link></li>
            <li><Link to={routes.niyamawali}>Rules & Bylaws</Link></li>
            <li><Link to={routes.members}>Members Directory</Link></li>
            <li><Link to={routes.cooperation}>Sahyog Transparency List</Link></li>
            <li><Link to={routes.news}>News & Press Releases</Link></li>
            <li><Link to={routes.team}>Executive Committee</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>
            <HeartHandshake size={16} /> Online Portals & Forms
          </h3>
          <ul className="footer-links">
            <li><Link to={routes.registration}>New Member Registration</Link></li>
            <li><Link to={routes.login}>Member Portal Login</Link></li>
            <li><Link to={`${routes.applications}?scheme=death`}>Untimely Demise Aid Form</Link></li>
            <li><Link to={`${routes.applications}?scheme=kanyadaan`}>Kanyadaan Yojana Form</Link></li>
            <li><Link to={`${routes.applications}?scheme=medical`}>Medical Assistance Form</Link></li>
            <li><Link to={routes.terms}>Terms & Conditions</Link></li>
            <li><Link to={routes.privacy}>Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>
            <Building size={16} /> Central Headquarters
          </h3>
          <div className="footer-contact-item">
            <MapPin size={18} />
            <span>{siteConfig.officeAddress}</span>
          </div>
          <div className="footer-contact-item">
            <Phone size={18} />
            <div>
              <p>Helpline: <strong>{siteConfig.helpline}</strong></p>
              {/* <p>Toll Free: <strong>{siteConfig.tollFree}</strong> (9:00 AM - 6:00 PM)</p> */}
            </div>
          </div>
          <div className="footer-contact-item">
            <Mail size={18} />
            <span>Email: {siteConfig.email}</span>
          </div>
          <div style={{ marginTop: 14, background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, fontSize: 11.5, color: '#94a3b8' }}>
            <span style={{ color: '#10b981', fontWeight: 800 }}>● Portal Server Status:</span> Online & 256-bit SSL Secure
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved. Reg. No. 130/2025 (Govt. Registered Welfare Trust)
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to={routes.privacy} style={{ color: '#94a3b8' }}>Privacy Policy</Link>
            <Link to={routes.terms} style={{ color: '#94a3b8' }}>Terms of Use</Link>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>Total Visitors: 1,489,350+</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
