import { 
  AlertCircle,
  CheckCircle2, 
  Clock, 
  FileText, 
  HeartHandshake, 
  Loader2, 
  Search, 
  UserCheck 
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { publicService, memberService } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { routes } from '../../config/routes'
import DonateModal from '../../components/common/DonateModal'
import PaymentReceiptModal from '../../components/common/PaymentReceiptModal'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Cooperation() {
  const { isHindi } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [donateModalOpen, setDonateModalOpen] = useState(false)

  // Live Approved Donors State (Public Wall)
  const [approvedDonors, setApprovedDonors] = useState([])
  const [loadingDonors, setLoadingDonors] = useState(true)
  const [donorsError, setDonorsError] = useState('')

  // Member Personal Donation History State
  const [showMyHistory, setShowMyHistory] = useState(false)
  const [myDonations, setMyDonations] = useState([])
  const [loadingMyDonations, setLoadingMyDonations] = useState(false)
  const [myDonationsError, setMyDonationsError] = useState('')

  // Fetch live approved donations from public API
  const fetchApprovedDonors = useCallback(async () => {
    setLoadingDonors(true)
    setDonorsError('')
    try {
      const res = await publicService.getApprovedDonors({ per_page: 50 })
      const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : [])
      setApprovedDonors(list)
    } catch (err) {
      setDonorsError(
        err.message ||
          (isHindi
            ? 'स्वीकृत सहयोग सूची प्राप्त करने में त्रुटि।'
            : 'Failed to load approved contributions list.')
      )
    } finally {
      setLoadingDonors(false)
    }
  }, [isHindi])

  // Fetch logged-in member's personal donations
  const fetchMyDonations = useCallback(async () => {
    if (!isAuthenticated) return
    setLoadingMyDonations(true)
    setMyDonationsError('')
    try {
      const res = await memberService.getMyDonations({ per_page: 50 })
      const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : [])
      setMyDonations(list)
    } catch (err) {
      setMyDonationsError(
        err.message ||
          (isHindi
            ? 'आपका व्यक्तिगत सहयोग इतिहास लोड करने में त्रुटि।'
            : 'Failed to load your personal contribution history.')
      )
    } finally {
      setLoadingMyDonations(false)
    }
  }, [isAuthenticated, isHindi])

  useEffect(() => {
    fetchApprovedDonors()
  }, [fetchApprovedDonors])

  useEffect(() => {
    if (showMyHistory && isAuthenticated) {
      fetchMyDonations()
    }
  }, [showMyHistory, isAuthenticated, fetchMyDonations])

  // Handle My Contributions button click
  const handleMyContributionsClick = () => {
    if (!isAuthenticated) {
      navigate(routes.memberLogin)
      return
    }
    setShowMyHistory((prev) => !prev)
  }

  // Filter approved donations by search keyword
  const filteredDonors = approvedDonors.filter((item) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const nameMatch = (item.donor_name || '').toLowerCase().includes(term)
    const categoryMatch = (item.category || '').toLowerCase().includes(term)
    const districtMatch = (item.district || '').toLowerCase().includes(term)
    const amountMatch = String(item.amount || '').includes(term)
    const idMatch = String(item.id || '').includes(term)
    return nameMatch || categoryMatch || districtMatch || amountMatch || idMatch
  })

  // Filter personal donations by search keyword
  const filteredMyDonations = myDonations.filter((item) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const txnMatch = (item.transaction_id || '').toLowerCase().includes(term)
    const amountMatch = String(item.amount || '').includes(term)
    const statusMatch = (item.status || '').toLowerCase().includes(term)
    return txnMatch || amountMatch || statusMatch
  })

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '28px' }}>
          <span className="section-eyebrow">
            <HeartHandshake size={16} /> {isHindi ? '100% सार्वजनिक पारदर्शिता' : '100% Public Transparency'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'पारस्परिक जनसहयोग पारदर्शिता सूची' : 'Mutual Contribution Transparency Ledger'}
          </h1>
          <p className="section-subtitle">
            {isHindi 
              ? 'संस्था के सदस्यों द्वारा भेजे गए स्वैच्छिक सहयोग का पारदर्शी नामवार रिकॉर्ड एवं आधिकारिक सत्यापन स्थिति।'
              : 'Official live ledger of verified voluntary mutual aid contributions submitted across Uttar Pradesh.'}
          </p>
        </div>

        {/* MAIN LEDGER CARD */}
        <div className="table-card">
          <div className="table-header-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flexGrow: 1 }}>
              <div style={{ position: 'relative', minWidth: 260 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    showMyHistory
                      ? (isHindi ? 'UTR या राशि द्वारा खोजें...' : 'Search by UTR or Amount...')
                      : (isHindi ? 'सहयोगी का नाम, जनपद अथवा संवर्ग द्वारा खोजें...' : 'Search by Donor, District, Category or Amount...')
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: 34, fontSize: '13px' }}
                />
                <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              </div>

              {showMyHistory && (
                <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: 4, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <UserCheck size={14} /> {isHindi ? `लॉगिन सदस्य: ${user?.name || 'Member'}` : `Logged In: ${user?.name || 'Member'}`}
                </span>
              )}
            </div>

            {/* ACTION BUTTONS: MY CONTRIBUTIONS (LEFT) + CONTRIBUTE NOW */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`button button-small ${showMyHistory ? 'button-navy' : 'button-outline'}`}
                onClick={handleMyContributionsClick}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FileText size={15} /> 
                {showMyHistory
                  ? (isHindi ? 'सार्वजनिक सहयोग सूची' : 'View Public Sahyog List')
                  : (isHindi ? 'My Contributions (मेरा सहयोग)' : 'My Contributions')}
              </button>

              <button
                type="button"
                className="button button-gold button-small"
                onClick={() => setDonateModalOpen(true)}
              >
                <HeartHandshake size={15} /> {isHindi ? 'Contribute Now (सहयोग करें)' : 'Contribute Now'}
              </button>
            </div>
          </div>

          {/* ERROR BANNERS */}
          {donorsError && !showMyHistory && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 12, borderRadius: 6, margin: '14px 20px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{donorsError}</span>
            </div>
          )}

          {myDonationsError && showMyHistory && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 12, borderRadius: 6, margin: '14px 20px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{myDonationsError}</span>
            </div>
          )}

          {/* VIEW A: LOGGED-IN MEMBER'S PERSONAL DONATION HISTORY (FROM API) */}
          {showMyHistory ? (
            <div className="responsive-table-wrap">
              <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0c2340', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} style={{ color: '#b45309' }} />
                  {isHindi ? 'आपका व्यक्तिगत सहयोग इतिहास एवं रसीदें' : 'Your Personal Contribution Ledger & Receipts'}
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {isHindi ? 'स्वीकृत सहयोग की रसीद देखने व प्रिंट करने हेतु दाईं ओर बटन दबाएं।' : 'Click View Receipt to view or print official payment voucher.'}
                </span>
              </div>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>{isHindi ? 'संदर्भ सं. / UTR' : 'Txn Ref / UTR'}</th>
                    <th>{isHindi ? 'संवर्ग (Category)' : 'Category'}</th>
                    <th>{isHindi ? 'जनपद (District)' : 'District'}</th>
                    <th>{isHindi ? 'सहयोग राशि' : 'Contribution Amount'}</th>
                    <th>{isHindi ? 'सत्यापन स्थिति' : 'Verification Status'}</th>
                    <th>{isHindi ? 'दिनांक' : 'Date'}</th>
                    <th style={{ textAlign: 'center' }}>{isHindi ? 'रसीद' : 'Receipt'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingMyDonations ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px', color: '#b45309' }} />
                        <div style={{ fontSize: '13px' }}>
                          {isHindi ? 'आपका व्यक्तिगत सहयोग इतिहास लोड हो रहा है...' : 'Loading your personal contributions...'}
                        </div>
                      </td>
                    </tr>
                  ) : filteredMyDonations.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px 16px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: 12 }}>
                          {searchTerm.trim()
                            ? (isHindi ? 'खोज अनुसार कोई व्यक्तिगत सहयोग नहीं मिला।' : 'No personal contributions found matching your search.')
                            : (isHindi ? 'आपने अभी तक कोई सहयोग प्रविष्टि दर्ज नहीं की है।' : 'You have not submitted any contributions yet.')}
                        </div>
                        <button
                          type="button"
                          className="button button-gold button-small"
                          onClick={() => setDonateModalOpen(true)}
                        >
                          <HeartHandshake size={15} /> {isHindi ? 'सहयोग करें (Contribute Now)' : 'Contribute Now'}
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredMyDonations.map((item) => {
                      const isApproved = item.status === 'approved'
                      const isPending = item.status === 'pending'

                      return (
                        <tr key={item.id}>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0c2340', fontSize: '12px' }}>
                              {item.transaction_id || `TXN-#${item.id}`}
                            </span>
                          </td>
                          <td>
                            {item.category ? (
                              <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                                {String(item.category).startsWith('संवर्ग') || String(item.category).startsWith('Category') ? item.category : `संवर्ग ${item.category}`}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                            )}
                          </td>
                          <td style={{ fontSize: '12px', color: item.district ? '#334155' : '#94a3b8' }}>
                            {item.district || '—'}
                          </td>
                          <td>
                            <span className="amount-pill">₹{Number(item.amount || 0).toLocaleString('en-IN')}</span>
                          </td>
                          <td>
                            {isApproved ? (
                              <span style={{ color: '#047857', fontWeight: 700, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={13} /> {isHindi ? 'स्वीकृत (Approved)' : 'Approved'}
                              </span>
                            ) : isPending ? (
                              <span style={{ color: '#b45309', fontWeight: 700, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={13} /> {isHindi ? 'सत्यापन प्रक्रियाधीन' : 'Pending Verification'}
                              </span>
                            ) : (
                              <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <AlertCircle size={13} /> {isHindi ? 'अस्वीकृत (Rejected)' : 'Rejected'}
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '12px', color: '#64748b' }}>
                            {item.verified_at || item.created_at
                              ? new Date(item.verified_at || item.created_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isApproved ? (
                              <button
                                type="button"
                                className="button button-gold button-small"
                                style={{ padding: '4px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                onClick={() => setSelectedReceipt({
                                  receiptNo: `NSCT/REC/2026/${item.id}`,
                                  date: item.verified_at 
                                    ? new Date(item.verified_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')
                                    : new Date(item.created_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN'),
                                  donorName: user?.name || (isHindi ? 'सत्यापित सदस्य' : 'Verified Member'),
                                  memberId: user?.member_code || `NSCT-MEMBER-#${user?.id}`,
                                  district: item.district || '',
                                  category: item.category || '',
                                  amount: item.amount,
                                  utr: item.transaction_id || `VERIFIED-${item.id}`,
                                })}
                              >
                                <FileText size={12} /> {isHindi ? 'रसीद देखें' : 'View Receipt'}
                              </button>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* VIEW B: PUBLIC NAMEWISE SAHYOG LIST (100% LIVE DATA FROM API) */
            <div className="responsive-table-wrap">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>{isHindi ? 'सहयोगी का नाम' : 'Donor Full Name'}</th>
                    <th>{isHindi ? 'संवर्ग (Category)' : 'Category'}</th>
                    <th>{isHindi ? 'जनपद (District)' : 'District'}</th>
                    <th>{isHindi ? 'स्वीकृत राशि' : 'Approved Amount'}</th>
                    <th>{isHindi ? 'सत्यापन स्थिति' : 'Verification Status'}</th>
                    <th>{isHindi ? 'स्वीकृति दिनांक' : 'Verified Date & Time'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDonors ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px', color: '#b45309' }} />
                        <div style={{ fontSize: '13px' }}>
                          {isHindi ? 'स्वीकृत सहयोग सूची लोड हो रही है...' : 'Loading approved donors list...'}
                        </div>
                      </td>
                    </tr>
                  ) : filteredDonors.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: 12 }}>
                          {searchTerm.trim()
                            ? (isHindi ? 'आपकी खोज के अनुसार कोई स्वीकृत सहयोग नहीं मिला।' : 'No approved contributions found matching your search.')
                            : (isHindi ? 'वर्तमान में कोई स्वीकृत सहयोग प्रविष्टि उपलब्ध नहीं है।' : 'No approved contributions recorded yet.')}
                        </div>
                        <button
                          type="button"
                          className="button button-gold button-small"
                          onClick={() => setDonateModalOpen(true)}
                        >
                          <HeartHandshake size={15} /> {isHindi ? 'पहला सहयोग करें (Contribute Now)' : 'Be the first to contribute'}
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredDonors.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.donor_name}</strong>
                          {item.is_anonymous && (
                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                              {isHindi ? '(गोपनीय सहयोगी)' : '(Anonymous Donor)'}
                            </span>
                          )}
                        </td>
                        <td>
                          {item.category ? (
                            <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                              {String(item.category).startsWith('संवर्ग') || String(item.category).startsWith('Category') ? item.category : `संवर्ग ${item.category}`}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: item.district ? '#334155' : '#94a3b8' }}>
                          {item.district || '—'}
                        </td>
                        <td>
                          <span className="amount-pill">₹{Number(item.amount || 0).toLocaleString('en-IN')}</span>
                        </td>
                        <td>
                          <span style={{ color: '#047857', fontWeight: 700, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={13} /> {isHindi ? 'सत्यापित (Approved)' : 'Approved & Verified'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {item.verified_at
                            ? new Date(item.verified_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : (isHindi ? 'हाल ही में' : 'Recently')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedReceipt && (
        <PaymentReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      <DonateModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        onSuccess={() => {
          fetchApprovedDonors()
          if (isAuthenticated) fetchMyDonations()
        }}
      />
    </div>
  )
}
