import { Award, Camera, Heart, Image as ImageIcon, Loader2, MapPin, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { publicService, getMediaUrl } from '../../api'

export default function Gallery() {
  const { isHindi } = useLanguage()
  const [filter, setFilter] = useState('ALL')
  const [galleryItems, setGalleryItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewItem, setPreviewItem] = useState(null)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError('')

    const params = {
      per_page: 36,
    }
    if (filter !== 'ALL') {
      params.category = filter
    }

    publicService.getGallery(params)
      .then((res) => {
        if (!isMounted) return
        const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : [])
        setGalleryItems(list)
      })
      .catch(() => {
        if (!isMounted) return
        setError(
          isHindi 
            ? 'चित्र दीर्घा लोड करने में समस्या आई। कृपया पुनः प्रयास करें।' 
            : 'Failed to load photo gallery. Please try again.'
        )
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [filter, isHindi])

  const formatDate = (isoString) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="section-eyebrow">
            <Camera size={16} /> {isHindi ? 'चित्र दीर्घा एवं गतिविधियां' : 'Photo Gallery & Field Events'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'सेवा गतिविधियों एवं सम्मान समारोहों की झलकियां' : 'Field Relief Operations & Ceremony Highlights'}
          </h1>
          <p className="section-subtitle">
            {isHindi 
              ? 'उत्तर प्रदेश के 75 जनपदों में आयोजित सहायता वितरण, कन्यादान आशीर्वाद एवं जनसेवा गतिविधियों के छायाचित्र।'
              : 'Photographic documentation of relief disbursements, marriage blessings, and community events across Uttar Pradesh.'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: isHindi ? 'समस्त छायाचित्र' : 'All Photos' },
            { id: 'General', label: isHindi ? 'सामान्य झलकियां' : 'General' },
            { id: 'Relief', label: isHindi ? 'सहायता वितरण' : 'Relief Handover' },
            { id: 'Kanyadaan', label: isHindi ? 'कन्यादान समारोह' : 'Kanyadaan Ceremonies' },
            { id: 'Meeting', label: isHindi ? 'संगठनात्मक बैठक' : 'Leadership Meetings' },
            { id: 'Blood', label: isHindi ? 'रक्तदान शिविर' : 'Blood Donation Camps' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              className={`button button-small ${filter === cat.id ? 'button-gold' : 'button-outline'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#0c2340' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px', color: '#b45309' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>
              {isHindi ? 'छायाचित्र दीर्घा लोड हो रही है...' : 'Loading photo gallery...'}
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
        {!isLoading && !error && galleryItems.length === 0 && (
          <div className="table-card" style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
            <Camera size={44} style={{ color: '#cbd5e1', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              {isHindi ? 'कोई छायाचित्र उपलब्ध नहीं है' : 'No Photos in This Category'}
            </h3>
            <p style={{ fontSize: '13.5px', maxWidth: 420, margin: '0 auto' }}>
              {isHindi 
                ? 'वर्तमान में इस श्रेणी में कोई छायाचित्र अपलोड नहीं किया गया है।'
                : 'No photos have been uploaded in this category yet. Please check back later.'}
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && !error && galleryItems.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {galleryItems.map((item) => {
              const imgUrl = item.image_url ? getMediaUrl(item.image_url) : ''
              const displayDate = formatDate(item.created_at)

              return (
                <div 
                  key={item.id} 
                  className="category-card" 
                  style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                  onClick={() => setPreviewItem(item)}
                >
                  <div style={{ height: 230, width: '100%', overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.title || 'Trust Activity Photo'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div style={{ display: imgUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#94a3b8' }}>
                      <ImageIcon size={44} />
                    </div>
                    {item.category && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          background: 'rgba(12, 35, 64, 0.85)',
                          color: '#fbbf24',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 9px',
                          borderRadius: 4,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{item.category || 'General'}</span>
                      {displayDate && <span>{displayDate}</span>}
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0c2340', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                      {item.title || (isHindi ? 'ट्रस्ट जनसेवा कार्यक्रम' : 'Trust Community Event')}
                    </h4>
                    {item.caption && (
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewItem && (
        <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', padding: 16 }}>
            <button className="modal-close-btn" onClick={() => setPreviewItem(null)} aria-label="Close">
              <X size={18} />
            </button>
            <div style={{ maxHeight: '70vh', overflow: 'hidden', borderRadius: 8, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <img 
                src={getMediaUrl(previewItem.image_url)} 
                alt={previewItem.title || 'Photo'} 
                style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain' }} 
              />
            </div>
            <div style={{ padding: '0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: 4 }}>
                  {previewItem.category || 'General'}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {formatDate(previewItem.created_at)}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0c2340', margin: '0 0 6px 0' }}>
                {previewItem.title || (isHindi ? 'ट्रस्ट छायाचित्र' : 'Trust Photograph')}
              </h3>
              {previewItem.caption && (
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                  {previewItem.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
