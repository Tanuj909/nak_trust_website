import { Award, Building, Mail, MapPin, Phone, ShieldCheck, UserCheck, Users } from 'lucide-react'
import { patronLeadership, districtPresidents } from '../../data/teamData'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Team() {
  const { isHindi } = useLanguage()

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="section-eyebrow">
            <Users size={16} /> {isHindi ? 'संगठनात्मक संरचना' : 'Organizational Hierarchy'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'संरक्षक मंडल एवं जिला कार्यकारिणी' : 'Patron Board & District Leadership'}
          </h1>
          <p className="section-subtitle">
            {isHindi 
              ? 'उत्तर प्रदेश के समस्त 75 जनपदों एवं राष्ट्रीय स्तर पर संस्था का संचालन कर रहे निष्ठावान पदाधिकारी एवं विधिक सलाहकार।'
              : 'Dedicated executive leaders, legal advisors, and district presidents steering operations across 75 districts.'}
          </p>
        </div>

        {/* National Leadership */}
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0c2340', marginBottom: 20 }}>
          {isHindi ? 'राष्ट्रीय संरक्षक एवं केंद्रीय कोर कमेटी' : 'National Patrons & Central Core Committee'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>
          {patronLeadership.map((leader) => (
            <div key={leader.id} className="category-card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '3px solid #b45309' }}>
                <img src={leader.image} alt={leader.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0c2340', marginBottom: 2 }}>{leader.name}</h3>
              <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                {leader.title}
              </span>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: 10 }}>{leader.qualification}</p>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{leader.bio}</p>
            </div>
          ))}
        </div>

        {/* District Presidents Directory */}
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0c2340', marginBottom: 20 }}>
          {isHindi ? 'जनपदीय अध्यक्ष एवं समन्वयक डायरेक्ट्री (उत्तर प्रदेश)' : 'District Presidents & Coordinators Directory (Uttar Pradesh)'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {districtPresidents.map((dp, idx) => (
            <div key={idx} className="category-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0c2340' }}>{dp.district}</h4>
                  <small style={{ color: '#047857', fontWeight: 700 }}>
                    {isHindi ? 'अधिकृत जिला इकाई' : 'Authorized District Unit'}
                  </small>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, fontSize: '12.5px', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>
                  <span style={{ color: '#64748b' }}>{isHindi ? 'जिला अध्यक्ष: ' : 'District President: '}</span>
                  <strong>{dp.president}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>{isHindi ? 'कार्यालय सम्पर्क: ' : 'Contact: '}</span>
                  <a href={`tel:${dp.phone}`} style={{ color: '#b45309', fontWeight: 700 }}>{dp.phone}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
