import { Award, CheckCircle, Download, Printer, QrCode, Shield, X } from 'lucide-react'
import { siteConfig } from '../../config/site'
import { useLanguage } from '../../i18n/LanguageContext'

const categoryMap = {
  A: 'संवर्ग A (Government)',
  B: 'संवर्ग B (Private)',
  C: 'संवर्ग C (Professional)',
  D: 'संवर्ग D (Others)',
}

export default function DigitalIdCard({ member, onClose, isInline = false }) {
  const { isHindi } = useLanguage()
  if (!member) return null

  const handlePrint = () => {
    window.print()
  }

  const cardContent = (
    <div className="printable-area">
      <div className="digital-id-card">
        <div className="id-card-top-strip" />
        <div className="id-card-header">
          <div className="id-card-emblem">
            <Shield size={20} />
          </div>
          <div className="id-card-header-titles">
            <h4>{isHindi ? siteConfig.hindiName : siteConfig.name}</h4>
            <small style={{ color: '#fde68a', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.4px' }}>
              {isHindi 
                ? `सदस्य आईडी: ${member.id} • डिजिटल पहचान पत्र`
                : `Member ID: ${member.id} • Digital Smart ID Card`}
            </small>
          </div>
        </div>

        <div className="id-card-body">
          <div className="id-card-photo-box">
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} />
            ) : (
              <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#94a3b8' }}>
                <Shield size={36} />
              </div>
            )}
          </div>

          <div className="id-card-details">
            <div className="id-card-detail-row">
              <span>{isHindi ? 'सदस्य का नाम:' : 'Member Name:'}</span>
              <strong>{member.name}</strong>
            </div>
            <div className="id-card-detail-row">
              <span>{isHindi ? 'पिता/पति का नाम:' : 'Father/Husband:'}</span>
              <strong>{member.fatherHusband || (isHindi ? 'उपलब्ध नहीं' : 'N/A')}</strong>
            </div>
            <div className="id-card-detail-row">
              <span>{isHindi ? 'सदस्यता आईडी:' : 'Member ID:'}</span>
              <strong style={{ color: '#b45309', fontFamily: 'monospace' }}>{member.id}</strong>
            </div>
            <div className="id-card-detail-row">
              <span>{isHindi ? 'सदस्यता संवर्ग:' : 'Category:'}</span>
              <strong style={{ color: '#1e40af' }}>
                {member.categoryName || categoryMap[String(member.category).toUpperCase()] || `संवर्ग ${member.category}`}
              </strong>
            </div>
            <div className="id-card-detail-row">
              <span>{isHindi ? 'जनपद / ब्लॉक:' : 'District / Block:'}</span>
              <strong>{member.district} ({member.block || (isHindi ? 'सदर' : 'Sadar')})</strong>
            </div>
            <div className="id-card-detail-row">
              <span>{isHindi ? 'रक्त समूह:' : 'Blood Group:'}</span>
              <strong style={{ color: '#dc2626' }}>{member.bloodGroup || 'O+'}</strong>
            </div>
            <div className="id-card-detail-row">
              <span>{isHindi ? 'नामांकित नॉमिनी:' : 'Nominee:'}</span>
              <strong>{member.nomineeName} ({member.nomineeRelation || (isHindi ? 'पत्नी' : 'Wife')})</strong>
            </div>
            <div className="id-card-detail-row" style={{ border: 'none' }}>
              <span>{isHindi ? 'स्थिति:' : 'Status:'}</span>
              <span style={{ color: '#059669', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={13} /> {member.status || (isHindi ? 'सत्यापित सदस्य' : 'Verified Member')}
              </span>
            </div>
          </div>
        </div>

        <div className="id-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrCode size={24} style={{ color: '#0f172a' }} />
            <div>
              <span style={{ display: 'block', fontWeight: 700 }}>
                {isHindi ? 'डिजिटल सत्यापित' : 'Digitally Verified'}
              </span>
              <small style={{ color: '#64748b' }}>nsctup.com/verify</small>
            </div>
          </div>
          <div className="id-card-hologram">
            <Award size={15} />
          </div>
        </div>
      </div>
      {/* <div className="no-print" style={{ textAlign: 'center', marginTop: 8, fontSize: '11px', color: '#64748b' }}>
        {isHindi 
          ? 'मानक आधार / PVC कार्ड आकार: 85.60 mm × 53.98 mm (CR80 / ISO ID-1)' 
          : 'Standard Aadhaar / PVC Card Size: 85.60 mm × 53.98 mm (CR80 / ISO ID-1)'}
      </div> */}
    </div>
  )

  if (isInline) {
    return (
      <div style={{ maxWidth: '460px', margin: '0 auto' }}>
        {cardContent}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '20px 24px' }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0c2340', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={16} style={{ color: '#b45309' }} />
            {isHindi ? 'डिजिटल पहचान पत्र (Smart E-Card)' : 'Digital Smart Member ID Card'}
          </span>
          <button 
            type="button"
            className="no-print" 
            onClick={onClose} 
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#fee2e2'
              e.currentTarget.style.color = '#dc2626'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.color = '#0f172a'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {cardContent}

        <div className="no-print" style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'center' }}>
          <button className="button button-gold button-small" onClick={handlePrint}>
            <Printer size={16} /> {isHindi ? 'पहचान पत्र प्रिंट करें (Print ID)' : 'Print Smart ID Card'}
          </button>
          <button className="button button-outline button-small" onClick={onClose}>
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
