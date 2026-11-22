import { BookOpen, CheckCircle, Download, FileText, Printer, Shield, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { siteConfig } from '../../config/site'
import { niyamawaliData } from '../../data/rulesData'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Niyamawali() {
  const { isHindi } = useLanguage()
  const [activeTab, setActiveTab] = useState(niyamawaliData[0].id)

  const activeArticle = niyamawaliData.find((a) => a.id === activeTab) || niyamawaliData[0]

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <div className="section-header" style={{ marginBottom: '28px' }}>
          <span className="section-eyebrow">
            <BookOpen size={16} /> {isHindi ? 'वैधानिक नियमावली एवं उपनियम' : 'Constitution & Statutory By-Laws'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'संस्था संविधान एवं संचालन नियमावली' : 'Trust Constitution & Operational By-Laws'}
          </h1>
          <p className="section-subtitle">
            {isHindi
              ? `${siteConfig.hindiName} (पंजीकरण सं. 130/2025) की आधिकारिक नियमावली, पात्रता मानदंड एवं आचार संहिता।`
              : `Official Constitution, Eligibility Criteria and Code of Conduct of ${siteConfig.name} (Reg. No. 130/2025).`}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button
            type="button"
            className="button button-gold button-small"
            onClick={() => window.print()}
          >
            <Printer size={15} /> {isHindi ? 'नियमावली प्रिंट / PDF डाउनलोड करें' : 'Print By-Laws / Save PDF'}
          </button>
        </div>

        <div className="form-card" style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 }}>
            {/* Sidebar list of articles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderRight: '1px solid #e2e8f0', paddingRight: 20 }}>
              {niyamawaliData.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: activeTab === item.id ? 800 : 600,
                    background: activeTab === item.id ? '#fef3c7' : 'transparent',
                    color: activeTab === item.id ? '#92400e' : '#334155',
                    border: activeTab === item.id ? '1px solid #fde68a' : '1px solid transparent'
                  }}
                >
                  {isHindi ? item.hindiTitle : item.englishTitle}
                </button>
              ))}
            </div>

            {/* Content area */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '2px solid #b45309', paddingBottom: 12, marginBottom: 20 }}>
                <ShieldCheck size={24} style={{ color: '#b45309' }} />
                <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#0c2340', margin: 0 }}>
                  {isHindi ? activeArticle.title : activeArticle.englishTitle}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(isHindi ? activeArticle.content : activeArticle.englishContent || activeArticle.content).map((paragraph, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ color: '#059669', marginTop: 3, flexShrink: 0 }}>
                      <CheckCircle size={16} />
                    </span>
                    <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.8, margin: 0 }}>
                      {paragraph}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28, padding: '14px 18px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', fontSize: '12px', color: '#64748b' }}>
                <strong>{isHindi ? 'विधिक सूचना: ' : 'Legal Notice: '}</strong>
                {isHindi
                  ? 'यह नियमावली संस्था की आम सभा एवं प्रबंधकारिणी समिति द्वारा विधिवत अनुमोदित है। प्रत्येक सदस्य का यह नैतिक दायित्व है कि वह इन नियमों का अक्षरशः पालन करे।'
                  : 'These By-Laws are duly ratified by the General Assembly and Governing Board of the Trust. All members are bound by statutory compliance.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
