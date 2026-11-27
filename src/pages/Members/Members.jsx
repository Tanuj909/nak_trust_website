import { 
  Loader2, 
  Search, 
  User, 
  Users 
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { upDistricts } from '../../data/districts'
import { useLanguage } from '../../i18n/LanguageContext'
import { publicService, getMediaUrl } from '../../api'
import { getCategoryBadge } from '../../utils/category'

export default function Members() {
  const { isHindi } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedDistrict, setSelectedDistrict] = useState('ALL')
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      fetchMembers()
    }, 350)

    function fetchMembers() {
      setIsLoading(true)
      setError('')

      const params = {
        per_page: 50,
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      if (selectedCategory !== 'ALL') {
        params.category = selectedCategory
      }
      if (selectedDistrict !== 'ALL') {
        params.district = selectedDistrict
      }

      publicService.getPublicMembers(params)
        .then((res) => {
          if (!isMounted) return
          // Laravel paginator returns { data: [...] } or res.data
          const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : [])
          setMembers(list)
        })
        .catch(() => {
          if (!isMounted) return
          setError(
            isHindi 
              ? 'सदस्य सूची लोड करने में त्रुटि आई। कृपया पुनः प्रयास करें।' 
              : 'Failed to load member directory. Please try again.'
          )
        })
        .finally(() => {
          if (isMounted) setIsLoading(false)
        })
    }

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [searchTerm, selectedCategory, selectedDistrict, isHindi])

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '28px' }}>
          <span className="section-eyebrow">
            <Users size={16} /> {isHindi ? 'अधिकृत सदस्य निर्देशिका' : 'Official Member Directory'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'पंजीकृत सदस्य सूची (75 जनपद)' : 'Registered Member Roster (All 75 Districts)'}
          </h1>
          <p className="section-subtitle">
            {isHindi 
              ? 'उत्तर प्रदेश शासन में पंजीकृत लोक कल्याण ट्रस्ट के समस्त सत्यापित सदस्यों का विवरण।'
              : 'Official verified membership records of registered members across Uttar Pradesh.'}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="table-card" style={{ marginBottom: 24, padding: '18px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder={isHindi ? 'नाम, पदनाम या जनपद से खोजें...' : 'Search by Name, Designation or District...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 34, fontSize: '13px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            </div>

            <div>
              <select
                className="form-control form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">{isHindi ? 'समस्त संवर्ग (All Categories)' : 'All Categories'}</option>
                <option value="A">संवर्ग A (Government - सरकारी/संविदा)</option>
                <option value="B">संवर्ग B (Private - प्राइवेट शिक्षक/बैंक)</option>
                <option value="C">संवर्ग C (Professional - डॉक्टर/वकील/सीए)</option>
                <option value="D">संवर्ग D (Others - किसान/गृहिणी/नागरिक)</option>
              </select>
            </div>

            <div>
              <select
                className="form-control form-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="ALL">{isHindi ? 'समस्त 75 जनपद (All Districts)' : 'All 75 Districts'}</option>
                {upDistricts.map((d) => (
                  <option key={d.id} value={d.name}>{d.hindiName} ({d.name})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#0c2340' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px', color: '#b45309' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>
              {isHindi ? 'सत्यापित सदस्यों का विवरण लोड हो रहा है...' : 'Loading verified member directory...'}
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 18, textAlign: 'center', color: '#991b1b', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && members.length === 0 && (
          <div className="table-card" style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
            <Users size={44} style={{ color: '#cbd5e1', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              {isHindi ? 'कोई सदस्य नहीं मिला' : 'No Members Found'}
            </h3>
            <p style={{ fontSize: '13.5px', maxWidth: 420, margin: '0 auto' }}>
              {isHindi 
                ? 'आपके द्वारा दिए गए खोज मापदंड या जनपद में कोई सक्रिय सदस्य पंजीकृत नहीं है।'
                : 'No active registered members found matching your search term, category or district filter.'}
            </p>
          </div>
        )}

        {/* Members Grid - 3 cards per row */}
        {!isLoading && !error && members.length > 0 && (
          <div className="members-grid-3">
            {members.map((member) => (
              <div key={member.id} className="category-card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 62, height: 74, borderRadius: 8, overflow: 'hidden', border: '2px solid #b45309', background: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {member.image_url ? (
                      <img 
                        src={getMediaUrl(member.image_url)} 
                        alt={member.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                          e.target.style.display = 'none'
                          if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div style={{ display: member.image_url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#94a3b8' }}>
                      <User size={30} />
                    </div>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    {(() => {
                      const badge = getCategoryBadge(member.category, isHindi)
                      return (
                        <span
                          style={{
                            fontSize: '11px',
                            background: badge.bg,
                            color: badge.color,
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontWeight: 800,
                            display: 'inline-block',
                          }}
                        >
                          {badge.label}
                        </span>
                      )
                    })()}
                    <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0c2340', marginTop: 4, wordBreak: 'break-word' }}>
                      {member.name}
                    </h3>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: 7, marginTop: 'auto' }}>
                  {member.father_husband_name && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ color: '#64748b' }}>{isHindi ? 'पिता / पति:' : 'Father / Husband:'}</span>
                      <strong style={{ color: '#0f172a', textAlign: 'right' }}>{member.father_husband_name}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ color: '#64748b' }}>{isHindi ? 'पेशा / पदनाम:' : 'Occupation / Post:'}</span>
                    <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                      {member.occupation || member.designation || (isHindi ? 'सत्यापित सदस्य' : 'Verified Member')}
                    </strong>
                  </div>

                  {member.blood_group && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ color: '#64748b' }}>{isHindi ? 'रक्त समूह:' : 'Blood Group:'}</span>
                      <strong style={{ color: '#dc2626', fontWeight: 800 }}>{member.blood_group}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ color: '#64748b' }}>{isHindi ? 'जनपद व राज्य:' : 'District & State:'}</span>
                    <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                      {member.district || (isHindi ? 'उत्तर प्रदेश' : 'Uttar Pradesh')}{member.state ? `, ${member.state}` : ''}
                    </strong>
                  </div>

                  {member.joined_at && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ color: '#64748b' }}>{isHindi ? 'पंजीकरण तिथि:' : 'Joined Date:'}</span>
                      <strong style={{ color: '#0f172a' }}>{member.joined_at}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
