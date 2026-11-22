import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  Loader2, 
  MapPin,
  Newspaper, 
  Search, 
  User, 
  X 
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { publicService, getMediaUrl } from '../../api'

export default function News() {
  const { isHindi } = useLanguage()
  const [articles, setArticles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [error, setError] = useState('')

  const perPage = 9

  // Prevent background scrolling when story modal or photo preview is active
  useEffect(() => {
    if (selectedArticle || previewImage) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [selectedArticle, previewImage])

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      fetchNews()
    }, 350)

    function fetchNews() {
      setIsLoading(true)
      setError('')

      const params = {
        page: currentPage,
        per_page: perPage,
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }

      publicService.getPosts(params)
        .then((res) => {
          if (!isMounted) return
          const paginator = res?.data
          const list = paginator?.data || (Array.isArray(paginator) ? paginator : [])
          setArticles(list)
          setTotalPages(paginator?.last_page || 1)
          setTotalCount(paginator?.total || list.length)
        })
        .catch(() => {
          if (!isMounted) return
          setError(
            isHindi 
              ? 'समाचार सूची लोड करने में समस्या आई। कृपया पुनः प्रयास करें।' 
              : 'Failed to load news. Please try again.'
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
  }, [currentPage, searchTerm, isHindi])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return
    setCurrentPage(newPage)
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }

  const handleReadFullStory = async (article) => {
    setSelectedArticle(article)
    setIsLoadingDetail(true)

    try {
      const slugOrId = article.slug || article.id
      const res = await publicService.getPostBySlugOrId(slugOrId)
      const postDetail = res?.data?.post || res?.data || res
      if (postDetail && postDetail.title) {
        setSelectedArticle(postDetail)
      }
    } catch (e) {
      // Fall back to article already set
    } finally {
      setIsLoadingDetail(false)
    }
  }

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
        <div className="section-header" style={{ marginBottom: '28px' }}>
          <span className="section-eyebrow">
            <Newspaper size={16} /> {isHindi ? 'समाचार एवं आधिकारिक प्रेस विज्ञप्ति' : 'News & Press Releases'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'संगठन समाचार एवं जनसेवा बुलेटिन' : 'Organization News & Public Service'}
          </h1>
          <p className="section-subtitle">
            {isHindi 
              ? 'उत्तर प्रदेश के 75 जनपदों में संचालित सहायता वितरण, कन्यादान समारोह एवं संगठनात्मक गतिविधियों के अद्यतन समाचार।'
              : 'Latest news, field handover ceremonies, and district committee activities across all 75 districts of Uttar Pradesh.'}
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: 28, maxWidth: 450 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-control"
              placeholder={isHindi ? 'शीर्षक या विवरण द्वारा खोजें...' : 'Search news by title or content...'}
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ paddingLeft: 36, fontSize: '13px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#0c2340' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px', color: '#b45309' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>
              {isHindi ? 'समाचार लोड हो रहे हैं...' : 'Loading news...'}
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
        {!isLoading && !error && articles.length === 0 && (
          <div className="table-card" style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
            <Newspaper size={44} style={{ color: '#cbd5e1', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              {isHindi ? 'कोई समाचार उपलब्ध नहीं है' : 'No News Available'}
            </h3>
            <p style={{ fontSize: '13.5px', maxWidth: 420, margin: '0 auto' }}>
              {isHindi 
                ? 'वर्तमान में कोई समाचार या प्रेस विज्ञप्ति प्रकाशित नहीं है।'
                : 'No published news articles or press releases found matching your search criteria.'}
            </p>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && !error && articles.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 26 }}>
            {articles.map((article) => {
              const coverUrl = article.cover_image_url ? getMediaUrl(article.cover_image_url) : ''
              const displayDate = formatDate(article.published_at || article.created_at)

              return (
                <div key={article.id} className="category-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 210, width: '100%', overflow: 'hidden', position: 'relative', background: '#e2e8f0' }}>
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={article.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div style={{ display: coverUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#94a3b8' }}>
                      <ImageIcon size={40} />
                    </div>
                  </div>

                  <div style={{ padding: 22, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <User size={13} style={{ color: '#b45309' }} /> {article.author_name || (isHindi ? 'संस्था प्रवक्ता' : 'Trust Spokesperson')}
                        </span>
                        {article.location && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#047857', fontWeight: 600 }}>
                            <MapPin size={12} /> {article.location}
                          </span>
                        )}
                      </div>
                      {displayDate && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={13} /> {displayDate}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0c2340', marginBottom: 10, lineHeight: 1.4 }}>
                      {article.title}
                    </h3>

                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                      {article.excerpt || (article.content ? article.content.substring(0, 140) + '...' : '')}
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                        <strong>{article.author_name || 'Admin'}</strong>
                      </div>
                      <button
                        type="button"
                        className="button button-gold button-small"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleReadFullStory(article)}
                      >
                        {isHindi ? 'विस्तृत पढ़ें' : 'Read Full Story'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && !error && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 36, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="button button-outline button-small"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ 
                opacity: currentPage <= 1 ? 0.5 : 1, 
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 4,
                padding: '7px 14px'
              }}
            >
              <ChevronLeft size={16} /> {isHindi ? 'पिछला' : 'Previous'}
            </button>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push('...')
                  }
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`dots-${idx}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: '13px' }}>
                        ...
                      </span>
                    )
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`button button-small ${currentPage === p ? 'button-gold' : 'button-outline'}`}
                      style={{ minWidth: 36, padding: '6px 12px', textAlign: 'center', fontWeight: 700 }}
                      onClick={() => handlePageChange(p)}
                      disabled={isLoading}
                    >
                      {p}
                    </button>
                  )
                })}
            </div>

            <button
              type="button"
              className="button button-outline button-small"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{ 
                opacity: currentPage >= totalPages ? 0.5 : 1, 
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 4,
                padding: '7px 14px'
              }}
            >
              {isHindi ? 'अगला' : 'Next'} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* READ FULL ARTICLE MODAL */}
      {selectedArticle && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedArticle(null)}
          style={{ padding: '16px', overflow: 'hidden' }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '760px', 
              width: '100%',
              maxHeight: '90vh', 
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              borderRadius: '16px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              background: '#ffffff'
            }}
          >
            {/* Sticky Header Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 22px',
              borderBottom: '1px solid #e2e8f0',
              background: '#ffffff',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 800, 
                  background: '#dbeafe', 
                  color: '#1e40af', 
                  padding: '3px 9px', 
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  {selectedArticle.category || 'News'}
                </span>
                {selectedArticle.location && (
                  <span style={{ fontSize: '12px', color: '#047857', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} /> {selectedArticle.location}
                  </span>
                )}
              </div>

              <button 
                type="button"
                onClick={() => setSelectedArticle(null)} 
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Smooth Scrollable Body */}
            {(() => {
              const coverMediaUrl = selectedArticle.cover_image_url ? getMediaUrl(selectedArticle.cover_image_url) : null
              const allImages = Array.isArray(selectedArticle.images) ? selectedArticle.images : []
              // If there's only 1 image or image matches the cover, do not repeat it in the bottom gallery
              const galleryImages = allImages.filter((img) => {
                if (!coverMediaUrl) return true
                const currentUrl = getMediaUrl(img.url)
                return currentUrl !== coverMediaUrl && !img.is_cover
              })

              return (
                <div style={{
                  padding: '24px 26px',
                  overflowY: 'auto',
                  flexGrow: 1,
                  WebkitOverflowScrolling: 'touch',
                }}>
                  {selectedArticle.cover_image_url && (
                    <div 
                      style={{ 
                        maxHeight: '340px', 
                        width: '100%', 
                        borderRadius: 12, 
                        overflow: 'hidden', 
                        marginBottom: 18, 
                        background: '#f1f5f9',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setPreviewImage(getMediaUrl(selectedArticle.cover_image_url))}
                      title={isHindi ? 'बड़ा देखने के लिए क्लिक करें' : 'Click to view full photo'}
                    >
                      <img 
                        src={getMediaUrl(selectedArticle.cover_image_url)} 
                        alt={selectedArticle.title} 
                        style={{ width: '100%', height: '100%', maxHeight: '340px', objectFit: 'cover', display: 'block' }} 
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 16, fontSize: '12px', color: '#64748b', marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={13} style={{ color: '#b45309' }} /> 
                      {formatDate(selectedArticle.published_at || selectedArticle.created_at)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <User size={13} style={{ color: '#b45309' }} />
                      {selectedArticle.author_name || (isHindi ? 'संस्था प्रवक्ता' : 'Trust Spokesperson')}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0c2340', marginBottom: 16, lineHeight: 1.4 }}>
                    {selectedArticle.title}
                  </h2>

                  {isLoadingDetail && (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#b45309' }}>
                      <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 6px' }} />
                      <span style={{ fontSize: '12px' }}>{isHindi ? 'विस्तृत विवरण लोड हो रहा है...' : 'Loading full story details...'}</span>
                    </div>
                  )}

                  <div style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.85, whiteSpace: 'pre-line', marginBottom: 24 }}>
                    {selectedArticle.content || selectedArticle.excerpt}
                  </div>

                  {/* Photo Highlights Section - Only shown when additional photos exist */}
                  {galleryImages.length > 0 && (
                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0c2340', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ImageIcon size={17} style={{ color: '#b45309' }} /> 
                          {isHindi ? 'कार्यक्रम एवं गतिविधि की प्रमुख झलकियां' : 'Event Photo Highlights'}
                        </h4>
                        <span style={{ fontSize: '11.5px', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 9px', borderRadius: 12, fontWeight: 700 }}>
                          {galleryImages.length} {isHindi ? 'अतिरिक्त छायाचित्र' : 'More Photos'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                        {galleryImages.map((img) => (
                          <div 
                            key={img.id} 
                            style={{ 
                              height: 110, 
                              borderRadius: 8, 
                              overflow: 'hidden', 
                              border: '1px solid #e2e8f0', 
                              background: '#f8fafc',
                              cursor: 'pointer',
                              transition: 'all 0.25s ease'
                            }}
                            onClick={() => setPreviewImage(getMediaUrl(img.url))}
                            title={isHindi ? 'बड़ा देखने के लिए क्लिक करें' : 'Click to expand'}
                          >
                            <img 
                              src={getMediaUrl(img.url)} 
                              alt={img.caption || selectedArticle.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }} 
                              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span>
                      <strong>{isHindi ? 'प्रकाशक:' : 'Published by:'}</strong> {selectedArticle.author_name || (isHindi ? 'राष्ट्रीय समाज कल्याण ट्रस्ट' : 'Trust Administration')}
                    </span>
                    {selectedArticle.location && (
                      <span>
                        <strong>{isHindi ? 'स्थान:' : 'Location:'}</strong> {selectedArticle.location}
                      </span>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* FULL PHOTO LIGHTBOX PREVIEW */}
      {previewImage && (
        <div 
          className="modal-overlay" 
          onClick={() => setPreviewImage(null)}
          style={{ zIndex: 110, background: 'rgba(0, 0, 0, 0.88)', padding: 20 }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <button 
              type="button"
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#ffffff',
                border: 'none',
                color: '#0f172a',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 5
              }}
            >
              <X size={18} />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
