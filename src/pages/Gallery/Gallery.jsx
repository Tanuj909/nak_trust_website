import { Camera, Image as ImageIcon, X } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { getMediaUrl } from '../../api'

const defaultGalleryImages = [
  { id: 1, image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80' },
  { id: 2, image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80' },
  { id: 3, image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80' },
  { id: 4, image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80' },
  { id: 5, image_url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=80' },
  { id: 6, image_url: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80' },
  { id: 7, image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80' },
  { id: 8, image_url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?w=800&auto=format&fit=crop&q=80' },
  { id: 9, image_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&auto=format&fit=crop&q=80' },
  { id: 10, image_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80' },
  { id: 11, image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80' },
  { id: 12, image_url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80' },
]

export default function Gallery() {
  const { isHindi } = useLanguage()
  const [galleryItems] = useState(defaultGalleryImages)
  const [previewItem, setPreviewItem] = useState(null)

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '36px' }}>
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

        {/* Gallery Grid - Pure Photos, No Text */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {galleryItems.map((item) => {
            const imgUrl = item.image_url ? getMediaUrl(item.image_url) : ''

            return (
              <div 
                key={item.id} 
                style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  height: '250px',
                  background: '#0f172a'
                }}
                onClick={() => setPreviewItem(item)}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt="Trust Activity"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#94a3b8' }}>
                    <ImageIcon size={44} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* LIGHTBOX PREVIEW MODAL (IMAGE ONLY) */}
      {previewItem && (
        <div className="modal-overlay" onClick={() => setPreviewItem(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', padding: 0, overflow: 'hidden', borderRadius: '12px', background: '#000000', border: 'none' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={getMediaUrl(previewItem.image_url)} 
                alt="Preview" 
                style={{ width: '100%', maxHeight: '82vh', objectFit: 'contain', display: 'block' }} 
              />
              <button 
                className="modal-close-btn" 
                onClick={() => setPreviewItem(null)} 
                aria-label="Close"
                style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
