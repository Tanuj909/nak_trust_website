import { 
  AlertCircle, 
  Building, 
  Camera,
  CheckCircle, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Download,
  Edit3, 
  Eye,
  FileText, 
  HeartHandshake, 
  Loader2, 
  Lock, 
  LogOut, 
  MapPin, 
  Phone, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  User, 
  UserCheck, 
  Users, 
  X 
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getMediaUrl, memberService } from '../../api'
import DigitalIdCard from '../../components/common/DigitalIdCard'
import { routes } from '../../config/routes'
import { siteConfig } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import { activeCampaigns } from '../../data/campaigns'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Dashboard() {
  const { isHindi } = useLanguage()
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Navigation tab: 'overview', 'ecard', 'donations', 'applications'
  const [dashboardTab, setDashboardTab] = useState('overview')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Listen to tab query param if navigated with ?tab=ecard or ?tab=applications
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab')
    if (tabParam && ['overview', 'ecard', 'donations', 'applications'].includes(tabParam)) {
      setDashboardTab(tabParam)
    }
  }, [location.search])

  // Live profile state
  const [profileData, setProfileData] = useState(user || null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState('')

  // Profile Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [editFieldErrors, setEditFieldErrors] = useState({})
  const [editGeneralError, setEditGeneralError] = useState('')

  // E-Card State
  const [cardData, setCardData] = useState(null)
  const [loadingCard, setLoadingCard] = useState(false)
  const [cardError, setCardError] = useState('')
  const [showIdCardModal, setShowIdCardModal] = useState(false)

  // Live Donations State
  const [donations, setDonations] = useState([])
  const [loadingDonations, setLoadingDonations] = useState(false)
  const [donationsError, setDonationsError] = useState('')

  // Live Welfare Applications State
  const [applications, setApplications] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [applicationsError, setApplicationsError] = useState('')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [downloadingDocId, setDownloadingDocId] = useState(null)

  // Profile Photo Upload & Lightbox State
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoToast, setPhotoToast] = useState(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [cacheBuster, setCacheBuster] = useState(Date.now())

  // 1. Fetch authenticated profile on mount
  useEffect(() => {
    let isMounted = true

    async function fetchLiveProfile() {
      setLoadingProfile(true)
      setProfileError('')
      try {
        const res = await memberService.getProfile()
        const liveUser = res?.data?.user || res?.data || {}
        if (isMounted) {
          setProfileData(liveUser)
          updateUser(liveUser)
        }
      } catch (err) {
        if (isMounted) {
          setProfileError(err.message || 'Failed to fetch member profile.')
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false)
        }
      }
    }

    fetchLiveProfile()

    return () => {
      isMounted = false
    }
  }, [updateUser])

  // 2. Fetch E-Card when switching to E-Card tab or when modal opens
  const fetchLiveCard = async () => {
    if (cardData) return
    setLoadingCard(true)
    setCardError('')
    try {
      const res = await memberService.getECard()
      const card = res?.data?.card || res?.data || {}
      setCardData(card)
    } catch (err) {
      setCardError(err.message || 'Failed to fetch Digital E-Card.')
    } finally {
      setLoadingCard(false)
    }
  }

  // 3. Fetch Donations history when switching to donations tab
  const fetchLiveDonations = async () => {
    setLoadingDonations(true)
    setDonationsError('')
    try {
      const res = await memberService.getMyDonations()
      const list = res?.data?.data || res?.data || []
      setDonations(Array.isArray(list) ? list : [])
    } catch (err) {
      setDonationsError(err.message || 'Failed to fetch donation history.')
    } finally {
      setLoadingDonations(false)
    }
  }

  // 4. Fetch Welfare Applications when switching to applications tab
  const fetchLiveApplications = async () => {
    setLoadingApplications(true)
    setApplicationsError('')
    try {
      const res = await memberService.getMyWelfareApplications()
      const list = res?.data?.data?.data || res?.data?.data || []
      setApplications(Array.isArray(list) ? list : [])
    } catch (err) {
      setApplicationsError(err.message || (isHindi ? 'सहायता आवेदन लोड करने में त्रुटि हुई।' : 'Failed to fetch welfare applications.'))
    } finally {
      setLoadingApplications(false)
    }
  }

  useEffect(() => {
    if (dashboardTab === 'ecard') {
      fetchLiveCard()
    } else if (dashboardTab === 'donations') {
      fetchLiveDonations()
    } else if (dashboardTab === 'applications') {
      fetchLiveApplications()
    }
  }, [dashboardTab])

  // Open Edit Profile Modal and prefill form
  const handleOpenEdit = () => {
    const prof = profileData?.profile || {}
    setEditFormData({
      alternate_mobile: prof.alternate_mobile || '',
      department_name: prof.department_name || '',
      designation: prof.designation || prof.occupation || '',
      employee_or_reg_id: prof.employee_or_reg_id || '',
      village_ward: prof.village_ward || '',
      full_address: prof.full_address || prof.address_line_1 || '',
      pincode: prof.pincode || '',
      nominee_name: prof.nominee_name || '',
      nominee_relation: prof.nominee_relation || 'Wife',
      nominee_age: prof.nominee_age || '',
      nominee_mobile: prof.nominee_mobile || prof.nominee_phone || '',
      bank_name: prof.bank_name || '',
      branch_name: prof.branch_name || '',
      account_holder_name: prof.account_holder_name || '',
      account_number: prof.account_number || '',
      ifsc_code: prof.ifsc_code || '',
    })
    setEditFieldErrors({})
    setEditGeneralError('')
    setShowEditModal(true)
  }

  // Submit Profile Updates
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setEditFieldErrors({})
    setEditGeneralError('')

    try {
      const res = await memberService.updateProfile(editFormData)
      const updatedProfile = res?.data?.profile || res?.data || {}

      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev?.profile,
          ...updatedProfile,
        },
      }))
      updateUser({
        profile: {
          ...user?.profile,
          ...updatedProfile,
        },
      })
      setShowEditModal(false)
      alert(isHindi ? 'आपकी प्रोफ़ाइल सफलतापूर्वक अद्यतन कर दी गई है।' : 'Profile updated successfully.')
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setEditFieldErrors(err.errors)
        setEditGeneralError(err.message || (isHindi ? 'कृपया त्रुटियों को सुधारें।' : 'Please correct the highlighted errors.'))
      } else {
        setEditGeneralError(err.message || (isHindi ? 'प्रोफ़ाइल अद्यतन विफल रहा।' : 'Failed to update profile.'))
      }
    } finally {
      setSavingProfile(false)
    }
  }

  // Handle Profile Photo Upload / Change
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setPhotoToast({
        type: 'error',
        message: isHindi
          ? 'फ़ोटो का आकार 2MB से अधिक नहीं होना चाहिए।'
          : 'Profile photo size must be less than 2MB.',
      })
      setTimeout(() => setPhotoToast(null), 4500)
      return
    }

    setUploadingPhoto(true)
    setPhotoToast(null)

    try {
      const res = await memberService.updateProfilePhoto(file)
      const updatedUser = res?.data?.user || res?.data || {}
      const newImageUrl = res?.data?.image_url || updatedUser?.image_url || `/media/user/${user?.id || profileData?.id}`

      const cb = Date.now()
      setCacheBuster(cb)

      setProfileData((prev) => ({
        ...prev,
        ...updatedUser,
        image_url: newImageUrl,
      }))

      updateUser({
        ...user,
        ...updatedUser,
        image_url: newImageUrl,
      })

      setPhotoToast({
        type: 'success',
        message: isHindi
          ? '✓ प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट कर दी गई है।'
          : '✓ Profile photo updated successfully.',
      })
      setTimeout(() => setPhotoToast(null), 4000)
    } catch (err) {
      setPhotoToast({
        type: 'error',
        message:
          err.errors?.image?.[0] ||
          err.message ||
          (isHindi ? 'फ़ोटो अपलोड करने में त्रुटि आई।' : 'Failed to upload profile photo.'),
      })
      setTimeout(() => setPhotoToast(null), 5000)
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    setShowLogoutConfirm(false)
    await logout()
    navigate('/')
  }

  const memberName = profileData?.name || user?.name || (isHindi ? 'सम्मानित सदस्य' : 'Valued Member')
  const memberCode = profileData?.membership?.member_code || user?.membership?.member_code || 'NSCT-MEMBER'
  const memberCategory = profileData?.profile?.category || user?.profile?.category || 'A'
  const memberDistrict = profileData?.profile?.district || user?.profile?.district || (isHindi ? 'उत्तर प्रदेश' : 'Uttar Pradesh')
  const avatarUrl = profileData?.image_url || user?.image_url || null

  // Member object prepared for DigitalIdCard component
  const memberForCard = {
    id: cardData?.member_code || memberCode,
    name: cardData?.name || memberName,
    fatherHusband: cardData?.father_husband_name || profileData?.profile?.father_husband_name || '',
    category: cardData?.category || memberCategory,
    categoryName: `संवर्ग ${cardData?.category || memberCategory}`,
    district: cardData?.district || memberDistrict,
    block: cardData?.block || profileData?.profile?.block || '',
    bloodGroup: cardData?.blood_group || profileData?.profile?.blood_group || 'O+',
    nomineeName: cardData?.nominee_name || profileData?.profile?.nominee_name || '',
    nomineeRelation: cardData?.nominee_relation || profileData?.profile?.nominee_relation || '',
    status: isHindi ? 'सत्यापित सक्रिय सदस्य (Active)' : 'Verified Active Member',
    joinDate: cardData?.joined_at || profileData?.membership?.joined_at || '',
    avatar: getMediaUrl(cardData?.photo_url || avatarUrl),
  }

  // Handle document download for the selected application
  const handleDownloadDocument = async (doc) => {
    try {
      setDownloadingDocId(doc.id)
      await memberService.downloadWelfareDocument(doc.id, doc.file_name || `welfare_doc_${doc.id}`)
    } catch (err) {
      alert(isHindi ? 'दस्तावेज डाउनलोड करने में त्रुटि हुई।' : 'Failed to download document attachment.')
    } finally {
      setDownloadingDocId(null)
    }
  }

  return (
    <div className="section section-alt" style={{ minHeight: '85vh' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="container">
        {/* Top Member Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0c2340 0%, #1e3a8a 100%)',
            color: '#ffffff',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
            boxShadow: '0 8px 24px rgba(12, 35, 64, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar with Camera Update Overlay & View Click */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                onClick={() => avatarUrl && setShowPhotoModal(true)}
                title={avatarUrl ? (isHindi ? 'फ़ोटो देखें (Click to view full photo)' : 'Click to view full photo') : (isHindi ? 'फ़ोटो अपलोड करें' : 'Upload photo')}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #fbbf24',
                  background: '#f1f5f9',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: avatarUrl ? 'pointer' : 'default',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                }}
              >
                {uploadingPhoto ? (
                  <Loader2 size={26} style={{ animation: 'spin 1s linear infinite', color: '#b45309' }} />
                ) : avatarUrl ? (
                  <img
                    src={`${getMediaUrl(avatarUrl)}${avatarUrl.includes('?') ? '&' : '?'}cb=${cacheBuster}`}
                    alt={memberName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={34} style={{ color: '#0c2340' }} />
                )}
              </div>

              {/* Camera Upload Badge */}
              <label
                htmlFor="banner-photo-input"
                title={isHindi ? 'फ़ोटो बदलें (Upload Photo)' : 'Change Photo'}
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: '#fbbf24',
                  color: '#0c2340',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                  border: '2px solid #0c2340',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
              >
                {uploadingPhoto ? (
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Camera size={13} />
                )}
              </label>
              <input
                id="banner-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                disabled={uploadingPhoto}
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {isHindi ? `संवर्ग ${memberCategory}` : `Category ${memberCategory}`}
                </span>
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#065f46',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <CheckCircle size={11} /> {isHindi ? 'सत्यापित सदस्य' : 'Verified Member'}
                </span>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    style={{
                      background: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 600,
                    }}
                  >
                    <Eye size={12} /> {isHindi ? 'फ़ोटो देखें' : 'View Photo'}
                  </button>
                )}
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 900, marginTop: 4, marginBottom: 2 }}>{memberName}</h1>
              <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>
                {isHindi ? 'सदस्यता आईडी: ' : 'Member ID: '}
                <strong style={{ color: '#fbbf24', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                  {memberCode}
                </strong>{' '}
                • {isHindi ? 'जनपद: ' : 'District: '}
                {memberDistrict}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="button button-gold button-small"
              onClick={() => {
                fetchLiveCard()
                setShowIdCardModal(true)
              }}
            >
              <CreditCard size={16} /> {isHindi ? 'डिजिटल ई-कार्ड' : 'Digital E-Card'}
            </button>
            <button
              type="button"
              className="button button-outline button-small"
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', background: 'transparent' }}
              onClick={handleLogoutClick}
            >
              <LogOut size={16} /> {isHindi ? 'लॉगआउट' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Global Error Banner if live profile failed */}
        {profileError && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #f87171',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 20,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={18} />
            <span>{profileError}</span>
          </div>
        )}

        {/* Profile Photo Toast Banner */}
        {photoToast && (
          <div
            style={{
              background: photoToast.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${photoToast.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              color: photoToast.type === 'success' ? '#065f46' : '#991b1b',
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 20,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
            }}
          >
            {photoToast.type === 'success' ? (
              <CheckCircle2 size={18} style={{ color: '#059669' }} />
            ) : (
              <AlertCircle size={18} style={{ color: '#dc2626' }} />
            )}
            <span>{photoToast.message}</span>
          </div>
        )}

        {/* Member Portal Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', borderBottom: '2px solid #e2e8f0', paddingBottom: 10 }}>
          <button
            type="button"
            className={`button button-small ${dashboardTab === 'overview' ? 'button-gold' : 'button-outline'}`}
            onClick={() => setDashboardTab('overview')}
          >
            <UserCheck size={16} /> {isHindi ? 'प्रोफ़ाइल एवं विवरण' : 'Profile & Overview'}
          </button>
          <button
            type="button"
            className={`button button-small ${dashboardTab === 'ecard' ? 'button-gold' : 'button-outline'}`}
            onClick={() => setDashboardTab('ecard')}
          >
            <CreditCard size={16} /> {isHindi ? 'डिजिटल ई-कार्ड' : 'Digital E-Card'}
          </button>
          <button
            type="button"
            className={`button button-small ${dashboardTab === 'donations' ? 'button-gold' : 'button-outline'}`}
            onClick={() => setDashboardTab('donations')}
          >
            <CreditCard size={16} /> {isHindi ? 'मेरा सहयोग इतिहास' : 'My Donations History'}
          </button>
          <button
            type="button"
            className={`button button-small ${dashboardTab === 'applications' ? 'button-gold' : 'button-outline'}`}
            onClick={() => setDashboardTab('applications')}
          >
            <HeartHandshake size={16} /> {isHindi ? 'सहायता आवेदन (My Applications)' : 'My Aid Applications'}
          </button>
        </div>

        {/* TAB 1: OVERVIEW & PROFILE */}
        {dashboardTab === 'overview' && (
          <div>
            {/* Quick Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, marginBottom: 28 }}>
              {/* Metric 1: Status */}
              <div className="category-card" style={{ padding: 20, textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                  {isHindi ? 'सदस्यता स्थिति' : 'Membership Status'}
                </span>
                <strong
                  style={{
                    fontSize: '17px',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  <CheckCircle size={18} /> {isHindi ? 'सत्यापित सक्रिय सदस्य' : 'Verified Active Member'}
                </strong>
                <small style={{ color: '#64748b', display: 'block', marginTop: 4 }}>
                  {isHindi ? 'पंजीकरण दिनांक: ' : 'Joined: '}
                  {profileData?.membership?.joined_at || '2026-11-22'}
                </small>
              </div>

              {/* Metric 2: Nominee */}
              <div className="category-card" style={{ padding: 20, textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                  {isHindi ? 'नामांकित नॉमिनी' : 'Registered Nominee'}
                </span>
                <strong style={{ fontSize: '16px', color: '#0c2340', marginTop: 6, display: 'block' }}>
                  {profileData?.profile?.nominee_name || (isHindi ? 'विवरण उपलब्ध नहीं' : 'Not Provided')}
                </strong>
                <small style={{ color: '#b45309', fontWeight: 700, display: 'block', marginTop: 2 }}>
                  {profileData?.profile?.nominee_relation
                    ? `(${profileData.profile.nominee_relation})`
                    : ''}
                </small>
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="form-card" style={{ padding: 28, marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserCheck size={20} style={{ color: '#b45309' }} />
                  {isHindi ? 'सदस्य प्रोफ़ाइल एवं अभिलेखीय विवरण' : 'Member Profile & Verified Records'}
                </h2>
                <button
                  type="button"
                  className="button button-gold button-small"
                  onClick={handleOpenEdit}
                >
                  <Edit3 size={15} /> {isHindi ? 'प्रोफ़ाइल संशोधित करें' : 'Edit Profile'}
                </button>
              </div>

              {loadingProfile ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '13px' }}>{isHindi ? 'प्रोफ़ाइल लोड हो रही है...' : 'Loading profile data...'}</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                  {/* Group 1: Personal */}
                  <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0c2340', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={16} style={{ color: '#b45309' }} /> {isHindi ? 'व्यक्तिगत विवरण' : 'Personal Details'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px' }}>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'पूरा नाम: ' : 'Full Name: '}</span><strong>{memberName}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'पिता/पति: ' : 'Father/Husband: '}</span><strong>{profileData?.profile?.father_husband_name || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'जन्म तिथि: ' : 'Date of Birth: '}</span><strong>{profileData?.profile?.dob || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'लिंग: ' : 'Gender: '}</span><strong>{profileData?.profile?.gender || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'रक्त समूह: ' : 'Blood Group: '}</span><strong style={{ color: '#dc2626' }}>{profileData?.profile?.blood_group || 'O+'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'मोबाइल: ' : 'Mobile: '}</span><strong>{profileData?.phone || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'ईमेल: ' : 'Email: '}</span><strong>{profileData?.email || 'N/A'}</strong></div>
                    </div>
                  </div>

                  {/* Group 2: Work & Category */}
                  <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0c2340', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building size={16} style={{ color: '#b45309' }} /> {isHindi ? 'संवर्ग एवं कार्यक्षेत्र' : 'Category & Work'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px' }}>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'संवर्ग: ' : 'Category: '}</span><strong>संवर्ग {memberCategory}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'पदनाम/पेशा: ' : 'Designation: '}</span><strong>{profileData?.profile?.designation || profileData?.profile?.occupation || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'विभाग/फर्म: ' : 'Department: '}</span><strong>{profileData?.profile?.department_name || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'कर्मचारी/रेजि. कोड: ' : 'Employee/Reg ID: '}</span><strong>{profileData?.profile?.employee_or_reg_id || 'N/A'}</strong></div>
                    </div>
                  </div>

                  {/* Group 3: Address */}
                  <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0c2340', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={16} style={{ color: '#b45309' }} /> {isHindi ? 'स्थायी निवास पता' : 'Permanent Address'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px' }}>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'राज्य: ' : 'State: '}</span><strong>{profileData?.profile?.state || 'Uttar Pradesh'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'जनपद: ' : 'District: '}</span><strong>{memberDistrict}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'ब्लॉक/तहसील: ' : 'Block: '}</span><strong>{profileData?.profile?.block || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'ग्राम/वार्ड: ' : 'Village/Ward: '}</span><strong>{profileData?.profile?.village_ward || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'पिनकोड: ' : 'Pincode: '}</span><strong>{profileData?.profile?.pincode || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'पूरा पता: ' : 'Address: '}</span><strong>{profileData?.profile?.full_address || profileData?.profile?.address_line_1 || 'N/A'}</strong></div>
                    </div>
                  </div>

                  {/* Group 4: Nominee & Bank */}
                  <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0c2340', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CreditCard size={16} style={{ color: '#b45309' }} /> {isHindi ? 'नॉमिनी व बैंक खाता' : 'Nominee & Bank'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px' }}>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'नॉमिनी का नाम: ' : 'Nominee: '}</span><strong>{profileData?.profile?.nominee_name || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'संबंध: ' : 'Relation: '}</span><strong>{profileData?.profile?.nominee_relation || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'नॉमिनी आयु: ' : 'Nominee Age: '}</span><strong>{profileData?.profile?.nominee_age ? `${profileData.profile.nominee_age} वर्ष` : 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'बैंक: ' : 'Bank: '}</span><strong>{profileData?.profile?.bank_name || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'शाखा: ' : 'Branch: '}</span><strong>{profileData?.profile?.branch_name || 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'खाता संख्या: ' : 'Account No: '}</span><strong>{profileData?.profile?.account_number ? `XXXX-XXXX-${String(profileData.profile.account_number).slice(-4)}` : 'N/A'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'आईएफएससी: ' : 'IFSC: '}</span><strong>{profileData?.profile?.ifsc_code || 'N/A'}</strong></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL E-CARD VIEW */}
        {dashboardTab === 'ecard' && (
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div className="section-header" style={{ marginBottom: 20 }}>
              <h2 className="section-title">{isHindi ? 'आधिकारिक डिजिटल ई-सदस्यता पहचान पत्र' : 'Official Digital E-Member Smart Card'}</h2>
              <p className="section-subtitle">
                {isHindi
                  ? 'उत्तर प्रदेश शासन में पंजीकृत नागवंशीय चेतना ट्रस्ट का डिजिटल स्मार्ट कार्ड।'
                  : 'Digitally verified Smart Member Card issued by Nagvanshiya Chetna Trust.'}
              </p>
            </div>

            {loadingCard ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <p>{isHindi ? 'ई-कार्ड लोड हो रहा है...' : 'Generating Digital Smart Card...'}</p>
              </div>
            ) : cardError ? (
              <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '16px', borderRadius: 8, textAlign: 'center' }}>
                <AlertCircle size={24} style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0 }}>{cardError}</p>
              </div>
            ) : (
              <div>
                <DigitalIdCard member={memberForCard} isInline />
                <div style={{ textAlign: 'center', marginTop: 18 }}>
                  <button
                    type="button"
                    className="button button-gold button-small"
                    onClick={() => setShowIdCardModal(true)}
                  >
                    <Printer size={16} /> {isHindi ? 'पूर्ण कार्ड प्रिंट / डाउनलोड करें' : 'Print / Download ID Card'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY DONATIONS HISTORY */}
        {dashboardTab === 'donations' && (
          <div className="form-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={20} style={{ color: '#b45309' }} />
                  {isHindi ? 'मेरा व्यक्तिगत सहयोग इतिहास' : 'My Personal Donations History'}
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: 4, marginBottom: 0 }}>
                  {isHindi
                    ? 'आपके द्वारा विभिन्न अभियानों में भेजे गए स्वैच्छिक सहयोग का पूर्ण पारदर्शी विवरण।'
                    : 'Read-only ledger of all direct mutual aid contributions submitted from your account.'}
                </p>
              </div>

              <button
                type="button"
                className="button button-gold button-small"
                onClick={() => navigate(routes.donate, { state: { campaign: activeCampaigns[0] } })}
              >
                <HeartHandshake size={15} /> {isHindi ? 'नया सहयोग भेजें' : 'Make a Contribution'}
              </button>
            </div>

            {loadingDonations ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px' }}>{isHindi ? 'सहयोग इतिहास लोड हो रहा है...' : 'Loading donations ledger...'}</p>
              </div>
            ) : donationsError ? (
              <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: 14, borderRadius: 8, fontSize: '13px' }}>
                <AlertCircle size={16} /> {donationsError}
              </div>
            ) : donations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                <HeartHandshake size={42} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0c2340', marginBottom: 6 }}>
                  {isHindi ? 'कोई सहयोग प्रविष्टि नहीं मिली' : 'No Contributions Found Yet'}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', maxWidth: 440, margin: '0 auto 18px' }}>
                  {isHindi
                    ? 'आपने अभी तक कोई सहयोग राशि प्रेषित नहीं की है। दिवंगत परिवार या कन्यादान योजना में सहयोग कर पुण्य के भागी बनें।'
                    : 'You have not submitted any contributions yet. Support active bereavement aid or Kanyadaan campaigns.'}
                </p>
                <button
                  type="button"
                  className="button button-gold button-small"
                  onClick={() => navigate(routes.donate, { state: { campaign: activeCampaigns[0] } })}
                >
                  <HeartHandshake size={15} /> {isHindi ? 'सक्रिय अभियान में सहयोग करें' : 'Contribute to Active Campaign'}
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#0c2340' }}>#</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#0c2340' }}>{isHindi ? 'दिनांक' : 'Date'}</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#0c2340' }}>{isHindi ? 'सहयोग राशि' : 'Amount'}</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#0c2340' }}>{isHindi ? 'यूटीआर / लेन-देन आईडी' : 'UTR / Txn ID'}</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#0c2340' }}>{isHindi ? 'स्थिति' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((item, idx) => {
                      const isApproved = item.status === 'approved'
                      const isRejected = item.status === 'rejected'
                      const isPending = !isApproved && !isRejected

                      return (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px 14px', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '12px 14px' }}>
                            {item.created_at ? new Date(item.created_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN') : 'N/A'}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0c2340' }}>
                            ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#b45309', fontWeight: 700 }}>
                            {item.transaction_id || 'N/A'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {isApproved && (
                              <span style={{ background: '#ecfdf5', color: '#047857', padding: '4px 8px', borderRadius: 6, fontWeight: 800, fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle size={12} /> {isHindi ? 'सत्यापित एवं स्वीकृत' : 'Approved'}
                              </span>
                            )}
                            {isPending && (
                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: 6, fontWeight: 800, fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} /> {isHindi ? 'सत्यापन प्रक्रियाधीन' : 'Pending Verification'}
                              </span>
                            )}
                            {isRejected && (
                              <div>
                                <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: 6, fontWeight: 800, fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <AlertCircle size={12} /> {isHindi ? 'अस्वीकृत' : 'Rejected'}
                                </span>
                                {item.rejection_reason && (
                                  <small style={{ display: 'block', color: '#dc2626', fontSize: '10.5px', marginTop: 2 }}>
                                    {item.rejection_reason}
                                  </small>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY WELFARE ASSISTANCE APPLICATIONS */}
        {dashboardTab === 'applications' && (
          <div className="dashboard-section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0c2340', marginBottom: 4 }}>
                  {isHindi ? 'मेरे प्रस्तुत सहायता प्रपत्र (My Applied Aid Forms)' : 'My Applied Aid Forms'}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  {isHindi 
                    ? 'संस्था में आपके द्वारा प्रस्तुत समस्त सहायता आवेदनों (दिवंगत/कन्यादान/चिकित्सा) का विवरण एवं अद्यतन स्थिति।' 
                    : 'Read-only ledger of all assistance applications submitted under your membership.'}
                </p>
              </div>

              <Link
                to={routes.applications}
                className="button button-gold button-small"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <HeartHandshake size={15} />
                <span>{isHindi ? 'नया सहायता आवेदन करें' : 'Apply for Aid'}</span>
              </Link>
            </div>

            {loadingApplications ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px' }}>{isHindi ? 'आवेदन लोड हो रहे हैं...' : 'Loading applications...'}</p>
              </div>
            ) : applicationsError ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 14, borderRadius: 8, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18} />
                <span>{applicationsError}</span>
              </div>
            ) : applications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1' }}>
                <HeartHandshake size={40} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  {isHindi ? 'कोई सहायता आवेदन नहीं मिला' : 'No Welfare Applications Found'}
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '480px', margin: '0 auto 16px' }}>
                  {isHindi 
                    ? 'आपने अभी तक कोई सहायता आवेदन प्रस्तुत नहीं किया है। दिवंगत साथी, कन्यादान विवाह अथवा गंभीर चिकित्सा सहायता हेतु नया आवेदन कर सकते हैं।' 
                    : 'You have not submitted any welfare assistance applications yet. You can apply for Demise Relief, Kanyadaan Marriage Grant, or Sanjeevani Medical Aid.'}
                </p>
                <Link to={routes.applications} className="button button-gold button-small">
                  <HeartHandshake size={15} /> {isHindi ? 'आवेदन प्रपत्र खोलें' : 'Open Application Form'}
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#334155', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 14px' }}>{isHindi ? 'आवेदन सं.' : 'App No.'}</th>
                      <th style={{ padding: '12px 14px' }}>{isHindi ? 'योजना' : 'Scheme'}</th>
                      <th style={{ padding: '12px 14px' }}>{isHindi ? 'लाभार्थी / विवरण' : 'Beneficiary / Details'}</th>
                      <th style={{ padding: '12px 14px' }}>{isHindi ? 'आवेदन तिथि' : 'Submitted Date'}</th>
                      <th style={{ padding: '12px 14px' }}>{isHindi ? 'सत्यापन स्थिति' : 'Status'}</th>
                      <th style={{ padding: '12px 14px' }}>{isHindi ? 'टिप्पणी' : 'Official Remarks'}</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>{isHindi ? 'विवरण' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const statusStyle = 
                        app.status === 'Approved' ? { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' } :
                        app.status === 'Under Review' ? { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' } :
                        app.status === 'Rejected' ? { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' } :
                        { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }

                      const schemeLabel = 
                        app.scheme_type === 'death' ? (isHindi ? 'दिवंगत आश्रित' : 'Demise Relief') :
                        app.scheme_type === 'kanyadaan' ? (isHindi ? 'कन्यादान विवाह' : 'Kanyadaan Grant') :
                        (isHindi ? 'संजीवनी चिकित्सा' : 'Sanjeevani Medical')

                      const beneficiaryDesc = 
                        app.scheme_type === 'death' ? `${app.deceased_name || ''} → ${app.nominee_name || ''}` :
                        app.scheme_type === 'kanyadaan' ? `${app.daughter_name || ''} & ${app.groom_name || ''}` :
                        `${app.patient_name || ''} (${app.disease_name || ''})`

                      return (
                        <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#b45309' }}>
                            {app.application_number}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                            <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 4, fontSize: '11.5px' }}>
                              {schemeLabel}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#1e293b' }}>
                            {beneficiaryDesc}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b' }}>
                            {app.created_at ? new Date(app.created_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN') : 'N/A'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ ...statusStyle, padding: '4px 10px', borderRadius: 12, fontWeight: 700, fontSize: '11.5px', display: 'inline-block' }}>
                              ● {app.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px', maxWidth: '200px' }}>
                            {app.admin_remarks || '—'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              className="button button-small button-outline"
                              onClick={() => setSelectedApplication(app)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '5px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderColor: '#0c2340',
                                color: '#0c2340',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Eye size={13} />
                              <span>{isHindi ? 'प्रपत्र देखें' : 'View Form'}</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VIEW WELFARE APPLICATION DETAILS MODAL */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)} style={{ zIndex: 9999 }}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '780px', width: '95%', maxHeight: '92vh', overflowY: 'auto', padding: '28px 24px' }}
          >
            <button className="modal-close-btn" onClick={() => setSelectedApplication(null)} aria-label="Close">
              <X size={18} />
            </button>

            {/* Modal Title & Reference Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <HeartHandshake size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', margin: 0 }}>
                    {isHindi ? 'पारस्परिक कल्याण सहायता आवेदन पत्र' : 'Mutual Aid Application Details'}
                  </h3>
                  <span style={{ 
                    background: '#f1f5f9', 
                    color: '#0c2340', 
                    fontSize: '11px', 
                    fontWeight: 800, 
                    padding: '2px 8px', 
                    borderRadius: 4, 
                    border: '1px solid #cbd5e1' 
                  }}>
                    {selectedApplication.scheme_type === 'death' ? (isHindi ? 'दिवंगत आश्रित राहत' : 'Demise Relief') :
                     selectedApplication.scheme_type === 'kanyadaan' ? (isHindi ? 'कन्यादान विवाह अनुदान' : 'Kanyadaan Grant') :
                     (isHindi ? 'संजीवनी चिकित्सा सहायता' : 'Sanjeevani Medical Aid')}
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0' }}>
                  {isHindi ? 'आवेदन संदर्भ संख्या:' : 'Application Reference Number:'}{' '}
                  <strong style={{ color: '#b45309', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    {selectedApplication.application_number}
                  </strong>
                </p>
              </div>
            </div>

            {/* Status & Review Summary Banner */}
            <div style={{
              background: selectedApplication.status === 'Approved' ? '#ecfdf5' :
                          selectedApplication.status === 'Under Review' ? '#eff6ff' :
                          selectedApplication.status === 'Rejected' ? '#fef2f2' : '#fffbeb',
              border: `1px solid ${selectedApplication.status === 'Approved' ? '#a7f3d0' :
                                   selectedApplication.status === 'Under Review' ? '#bfdbfe' :
                                   selectedApplication.status === 'Rejected' ? '#fecaca' : '#fde68a'}`,
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 22,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedApplication.status === 'Approved' ? <CheckCircle2 size={20} style={{ color: '#059669' }} /> :
                 selectedApplication.status === 'Under Review' ? <ShieldCheck size={20} style={{ color: '#2563eb' }} /> :
                 selectedApplication.status === 'Rejected' ? <AlertCircle size={20} style={{ color: '#dc2626' }} /> :
                 <Clock size={20} style={{ color: '#d97706' }} />}
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>
                    {isHindi ? 'वर्तमान सत्यापन स्थिति' : 'Current Verification Status'}
                  </span>
                  <strong style={{ 
                    fontSize: '14px', 
                    color: selectedApplication.status === 'Approved' ? '#047857' :
                           selectedApplication.status === 'Under Review' ? '#1d4ed8' :
                           selectedApplication.status === 'Rejected' ? '#b91c1c' : '#b45309' 
                  }}>
                    {selectedApplication.status === 'Approved' ? (isHindi ? 'स्वीकृत (Approved)' : 'Approved') :
                     selectedApplication.status === 'Under Review' ? (isHindi ? 'जाँच प्रक्रियाधीन (Under Review)' : 'Under Review') :
                     selectedApplication.status === 'Rejected' ? (isHindi ? 'अस्वीकृत (Rejected)' : 'Rejected') :
                     (isHindi ? 'प्रतीक्षारत (Pending Verification)' : 'Pending Verification')}
                  </strong>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
                <span>{isHindi ? 'आवेदन दर्ज करने की तिथि:' : 'Submitted On:'} </span>
                <strong style={{ color: '#334155' }}>
                  {selectedApplication.created_at ? new Date(selectedApplication.created_at).toLocaleString(isHindi ? 'hi-IN' : 'en-IN') : 'N/A'}
                </strong>
              </div>
            </div>

            {/* Official Administrative Remarks Banner */}
            {selectedApplication.admin_remarks && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '12.5px', color: '#92400e' }}>
                <strong>{isHindi ? 'प्रशासनिक सत्यापन टिप्पणी (Official Remarks):' : 'Official Remarks:'}</strong> {selectedApplication.admin_remarks}
              </div>
            )}

            {/* Section 1: Member Credentials */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0c2340', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {isHindi ? '1. आवेदक सदस्य विवरण (Member Information)' : '1. Member Credentials'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '13px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'सदस्यता आईडी:' : 'Member ID:'}</span>
                  <strong style={{ color: '#0c2340', fontFamily: 'monospace' }}>{selectedApplication.member_id}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'जनपद:' : 'District:'}</span>
                  <strong style={{ color: '#0c2340' }}>{selectedApplication.district}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'पंजीकृत मोबाइल नंबर:' : 'Registered Mobile:'}</span>
                  <strong style={{ color: '#0c2340' }}>{selectedApplication.mobile}</strong>
                </div>
              </div>
            </div>

            {/* Section 2: Scheme-Specific Details */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0c2340', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedApplication.scheme_type === 'death' ? (isHindi ? '2. दिवंगत साथी एवं नॉमिनी विवरण (Demise Details)' : '2. Demise & Nominee Details') :
                 selectedApplication.scheme_type === 'kanyadaan' ? (isHindi ? '2. कन्यादान विवाह विवरण (Wedding Details)' : '2. Daughter Wedding Details') :
                 (isHindi ? '2. चिकित्सा एवं उपचार विवरण (Medical Treatment Details)' : '2. Medical & Treatment Details')}
              </h4>

              {/* DEMISE FIELDS */}
              {selectedApplication.scheme_type === 'death' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '13px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'दिवंगत सदस्य का नाम:' : 'Deceased Member Name:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.deceased_name || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'देहावसान तिथि:' : 'Date of Demise:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.date_of_demise || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'मृत्यु का कारण:' : 'Cause of Demise:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.cause_of_demise || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'मृत्यु प्रमाण पत्र संख्या:' : 'Death Certificate No:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.death_cert_no || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'नामिती (Nominee) का नाम:' : 'Nominee Name:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.nominee_name || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'नामिती का सम्बंध:' : 'Relation with Deceased:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.nominee_relation || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'बैंक का नाम:' : 'Bank Name:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.nominee_bank || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'खाता संख्या:' : 'Account Number:'}</span>
                    <strong style={{ color: '#0c2340', fontFamily: 'monospace' }}>{selectedApplication.nominee_account || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'IFSC कोड:' : 'IFSC Code:'}</span>
                    <strong style={{ color: '#0c2340', fontFamily: 'monospace' }}>{selectedApplication.nominee_ifsc || '—'}</strong>
                  </div>
                </div>
              )}

              {/* KANYADAAN FIELDS */}
              {selectedApplication.scheme_type === 'kanyadaan' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '13px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'पुत्री का नाम:' : 'Daughter Name:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.daughter_name || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'पुत्री की आयु:' : 'Daughter Age:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.daughter_age ? `${selectedApplication.daughter_age} वर्ष (Years)` : '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'वर का नाम:' : 'Groom Name:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.groom_name || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'वर के पिता का नाम:' : 'Groom Father:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.groom_father || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'विवाह तिथि:' : 'Wedding Date:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.wedding_date || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'विवाह स्थल / पता:' : 'Wedding Venue:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.wedding_venue || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'जिला टीम को आमंत्रण:' : 'District Team Invited:'}</span>
                    <strong style={{ color: '#0c2340' }}>
                      {selectedApplication.invited_district_team ? (isHindi ? 'हाँ (आमंत्रित)' : 'Yes (Invited)') : (isHindi ? 'नहीं' : 'No')}
                    </strong>
                  </div>
                </div>
              )}

              {/* MEDICAL FIELDS */}
              {selectedApplication.scheme_type === 'medical' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '13px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'रोगी का नाम:' : 'Patient Name:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.patient_name || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'रोगी से सम्बंध:' : 'Relation with Patient:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.patient_relation || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'गंभीर बीमारी का नाम:' : 'Illness / Disease:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.disease_name || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'अनुमानित उपचार व्यय:' : 'Estimated Cost:'}</span>
                    <strong style={{ color: '#b45309', fontWeight: 800 }}>
                      ₹{Number(selectedApplication.estimated_cost || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'चिकित्सालय का नाम:' : 'Hospital Name:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.hospital_name || '—'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{isHindi ? 'परामर्शदाता चिकित्सक:' : 'Attending Doctor:'}</span>
                    <strong style={{ color: '#0c2340' }}>{selectedApplication.doctor_name || '—'}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Attached Documents */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0c2340', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {isHindi ? '3. संलग्न साक्ष्य दस्तावेज (Attached Documents)' : '3. Attached Verification Documents'}
              </h4>
              {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedApplication.documents.map((doc) => (
                    <div 
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: '12.5px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={18} style={{ color: '#b45309' }} />
                        <div>
                          <strong style={{ color: '#0c2340', display: 'block' }}>
                            {doc.document_label || doc.file_name}
                          </strong>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>
                            {doc.file_name} • {(Number(doc.file_size || 0) / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="button button-small button-outline"
                        disabled={downloadingDocId === doc.id}
                        onClick={() => handleDownloadDocument(doc)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', fontSize: '11.5px' }}
                      >
                        {downloadingDocId === doc.id ? (
                          <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Download size={13} />
                        )}
                        <span>{downloadingDocId === doc.id ? (isHindi ? 'डाउनलोडिंग...' : 'Downloading...') : (isHindi ? 'दस्तावेज देखें' : 'Download')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '12.5px', textAlign: 'center' }}>
                  {isHindi ? 'इस आवेदन के साथ कोई दस्तावेज संलग्न नहीं है।' : 'No verification documents attached.'}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <button
                type="button"
                className="button button-primary button-small"
                onClick={() => setSelectedApplication(null)}
              >
                {isHindi ? 'बंद करें (Close)' : 'Close Window'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <button className="modal-close-btn" onClick={() => setShowEditModal(false)} aria-label="Close">
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340' }}>
                {isHindi ? 'सदस्य प्रोफ़ाइल संपादन' : 'Edit Member Profile'}
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>
                {isHindi ? 'कृपया वैध एवं सही जानकारी ही अद्यतन करें।' : 'Update your verified contact and nominee details.'}
              </p>
            </div>

            {editGeneralError && (
              <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '12.5px' }}>
                {editGeneralError}
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{isHindi ? 'पदनाम / पेशा:' : 'Designation / Occupation:'}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                  />
                  {editFieldErrors.designation && <span style={{ color: '#dc2626', fontSize: '11px' }}>{editFieldErrors.designation[0]}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">{isHindi ? 'विभाग / संस्था:' : 'Department:'}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.department_name}
                    onChange={(e) => setEditFormData({ ...editFormData, department_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{isHindi ? 'वैकल्पिक मोबाइल:' : 'Alternate Mobile:'}</label>
                  <input
                    type="tel"
                    maxLength={10}
                    className="form-control"
                    value={editFormData.alternate_mobile}
                    onChange={(e) => setEditFormData({ ...editFormData, alternate_mobile: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{isHindi ? 'पिनकोड:' : 'Pincode:'}</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-control"
                    value={editFormData.pincode}
                    onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{isHindi ? 'स्थायी पूरा पता:' : 'Full Permanent Address:'}</label>
                <textarea
                  rows={2}
                  className="form-control"
                  value={editFormData.full_address}
                  onChange={(e) => setEditFormData({ ...editFormData, full_address: e.target.value })}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{isHindi ? 'नॉमिनी का नाम:' : 'Nominee Name:'}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.nominee_name}
                    onChange={(e) => setEditFormData({ ...editFormData, nominee_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{isHindi ? 'नॉमिनी से संबंध:' : 'Nominee Relation:'}</label>
                  <select
                    className="form-control form-select"
                    value={editFormData.nominee_relation}
                    onChange={(e) => setEditFormData({ ...editFormData, nominee_relation: e.target.value })}
                  >
                    <option value="Wife">{isHindi ? 'पत्नी (Wife)' : 'Wife'}</option>
                    <option value="Husband">{isHindi ? 'पति (Husband)' : 'Husband'}</option>
                    <option value="Son">{isHindi ? 'पुत्र (Son)' : 'Son'}</option>
                    <option value="Daughter">{isHindi ? 'पुत्री (Daughter)' : 'Daughter'}</option>
                    <option value="Mother">{isHindi ? 'माता (Mother)' : 'Mother'}</option>
                    <option value="Father">{isHindi ? 'पिता (Father)' : 'Father'}</option>
                    <option value="Other">{isHindi ? 'अन्य (Other)' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{isHindi ? 'नॉमिनी मोबाइल:' : 'Nominee Contact Phone:'}</label>
                  <input
                    type="tel"
                    maxLength={10}
                    className="form-control"
                    value={editFormData.nominee_mobile}
                    onChange={(e) => setEditFormData({ ...editFormData, nominee_mobile: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{isHindi ? 'नॉमिनी आयु (वर्ष):' : 'Nominee Age:'}</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    className="form-control"
                    value={editFormData.nominee_age}
                    onChange={(e) => setEditFormData({ ...editFormData, nominee_age: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{isHindi ? 'बैंक का नाम:' : 'Bank Name:'}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.bank_name}
                    onChange={(e) => setEditFormData({ ...editFormData, bank_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{isHindi ? 'आईएफएससी कोड (IFSC):' : 'IFSC Code:'}</label>
                  <input
                    type="text"
                    maxLength={11}
                    className="form-control"
                    value={editFormData.ifsc_code}
                    onChange={(e) => setEditFormData({ ...editFormData, ifsc_code: e.target.value.toUpperCase().slice(0, 11) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button
                  type="submit"
                  className="button button-gold"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>{isHindi ? 'सुरक्षित हो रहा है...' : 'Saving Changes...'}</span>
                    </>
                  ) : (
                    <span>{isHindi ? 'परिवर्तन सुरक्षित करें' : 'Save Changes'}</span>
                  )}
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL DIGITAL ID CARD MODAL */}
      {showIdCardModal && (
        <DigitalIdCard
          member={memberForCard}
          onClose={() => setShowIdCardModal(false)}
        />
      )}

      {/* VIEW PROFILE PHOTO LIGHTBOX MODAL */}
      {showPhotoModal && avatarUrl && (
        <div
          className="modal-overlay"
          onClick={() => setShowPhotoModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(12, 35, 64, 0.85)',
            zIndex: 9999,
            display: 'grid',
            placeItems: 'center',
            padding: 16,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 420,
              width: '100%',
              background: '#ffffff',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative',
              textAlign: 'center',
              padding: 0,
            }}
          >
            {/* Header bar */}
            <div style={{ padding: '16px 20px', background: '#0c2340', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{memberName}</h4>
                <small style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{memberCode}</small>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Image Preview */}
            <div style={{ background: '#f8fafc', padding: 24, display: 'grid', placeItems: 'center' }}>
              <img
                src={`${getMediaUrl(avatarUrl)}${avatarUrl.includes('?') ? '&' : '?'}cb=${cacheBuster}`}
                alt={memberName}
                style={{
                  maxHeight: '340px',
                  maxWidth: '100%',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Actions Bar */}
            <div style={{ padding: '14px 20px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <label
                htmlFor="modal-photo-upload"
                className="button button-gold button-small"
                style={{ cursor: uploadingPhoto ? 'not-allowed' : 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {uploadingPhoto ? (
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Camera size={14} />
                )}
                <span>{uploadingPhoto ? (isHindi ? 'अपलोड हो रहा है...' : 'Uploading...') : (isHindi ? 'फ़ोटो बदलें' : 'Change Photo')}</span>
              </label>
              <input
                id="modal-photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                disabled={uploadingPhoto}
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => setShowPhotoModal(false)}
              >
                {isHindi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <LogOut size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0c2340', marginBottom: 8 }}>
              {isHindi ? 'लॉगआउट की पुष्टि' : 'Confirm Logout'}
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: 22, lineHeight: 1.5 }}>
              {isHindi ? 'क्या आप वाकई अपने सदस्य खाते से लॉगआउट करना चाहते हैं?' : 'Are you sure you want to logout from your member account?'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setShowLogoutConfirm(false)}
                style={{ minWidth: 100 }}
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                className="button button-gold"
                onClick={confirmLogout}
                style={{ minWidth: 100, background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
              >
                {isHindi ? 'हाँ, लॉगआउट करें' : 'Yes, Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
