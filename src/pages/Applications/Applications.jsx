import { 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  Check,
  CheckCircle2, 
  Clock,
  CreditCard, 
  FileCheck, 
  FileText, 
  Gift, 
  HeartHandshake, 
  Hospital, 
  Loader2,
  MapPin, 
  Printer, 
  Search,
  ShieldAlert, 
  ShieldCheck,
  Stethoscope, 
  Upload, 
  User, 
  Users,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { publicService } from '../../api'
import { routes } from '../../config/routes'
import { siteConfig } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import { upDistricts } from '../../data/districts'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Applications() {
  const { isHindi } = useLanguage()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const schemeParam = searchParams.get('scheme')
  const validSchemes = ['death', 'kanyadaan', 'medical']

  // Navigation mode: 'apply' or 'track'
  const [pageMode, setPageMode] = useState('apply') // 'apply' | 'track'
  const [activeTab, setActiveTab] = useState(
    validSchemes.includes(schemeParam) ? schemeParam : 'death'
  ) // 'death' | 'kanyadaan' | 'medical'

  useEffect(() => {
    const param = searchParams.get('scheme')
    if (param && validSchemes.includes(param)) {
      setActiveTab(param)
      setPageMode('apply')
    }
  }, [searchParams])
  const [submittedApp, setSubmittedApp] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Document upload state
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadError, setUploadError] = useState('')

  // Tracking state
  const [trackQuery, setTrackQuery] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [trackedApplication, setTrackedApplication] = useState(null)
  const [trackError, setTrackError] = useState('')

  // Form states
  const [formData, setFormData] = useState({
    memberId: '',
    district: 'lucknow',
    mobile: '',

    // Demise specific
    deceasedName: '',
    dateOfDemise: '',
    causeOfDemise: '',
    deathCertNo: '',
    nomineeName: '',
    nomineeRelation: 'पत्नी (Wife)',
    nomineeBank: '',
    nomineeAccount: '',
    nomineeIfsc: '',

    // Kanyadaan specific
    daughterName: '',
    daughterAge: '',
    groomName: '',
    groomFather: '',
    weddingDate: '',
    weddingVenue: '',
    invitedDistrictTeam: 'हाँ (Yes)',

    // Medical specific
    patientName: '',
    patientRelation: 'स्वयं (Self)',
    diseaseName: 'हृदय रोग / कार्डियक सर्जरी (Heart)',
    hospitalName: '',
    estimatedCost: '',
    doctorName: '',

    agreeTerms: true,
  })

  // Pre-fill logged-in Member credentials if available
  useEffect(() => {
    if (user) {
      const userMemberCode = user.membership?.member_code || user.member_code || user.member_id || ''
      const userDistrict = user.assigned_district || user.profile?.district || ''
      const userPhone = user.phone || ''

      setFormData((prev) => ({
        ...prev,
        memberId: prev.memberId || userMemberCode,
        district: userDistrict || prev.district || 'lucknow',
        mobile: prev.mobile || userPhone,
      }))
    }
  }, [user])

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  // Handle document file selections (Max 5 files, 5MB each)
  const handleFileChange = (e) => {
    setUploadError('')
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    if (uploadedFiles.length + files.length > 5) {
      setUploadError(isHindi ? 'अधिकतम 5 दस्तावेज ही संलग्न किए जा सकते हैं।' : 'Maximum 5 files can be attached.')
      return
    }

    const validFiles = []
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

    for (const f of files) {
      if (!allowedTypes.includes(f.type)) {
        setUploadError(isHindi ? `${f.name}: केवल JPG, PNG, WebP या PDF स्वीकार्य हैं।` : `${f.name}: Only JPG, PNG, WebP, or PDF allowed.`)
        return
      }
      if (f.size > 5 * 1024 * 1024) {
        setUploadError(isHindi ? `${f.name}: फाइल का आकार 5MB से कम होना चाहिए।` : `${f.name}: File size must be under 5MB.`)
        return
      }
      validFiles.push(f)
    }

    setUploadedFiles((prev) => [...prev, ...validFiles])
    e.target.value = ''
  }

  const handleRemoveFile = (indexToRemove) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // Handle Form Submission to Live Laravel Backend
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    if (!formData.memberId.trim()) {
      setErrorMsg(isHindi ? 'कृपया पंजीकृत सदस्यता आईडी दर्ज करें!' : 'Please enter registered Member ID!')
      return
    }

    if (!formData.agreeTerms) {
      setErrorMsg(isHindi ? 'कृपया घोषणा स्वीकार करें!' : 'Please accept the declaration!')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = new FormData()
      payload.append('scheme_type', activeTab)
      payload.append('member_id', formData.memberId.trim())
      payload.append('district', formData.district)
      payload.append('mobile', formData.mobile)
      payload.append('agree_terms', formData.agreeTerms ? '1' : '0')

      if (activeTab === 'death') {
        payload.append('deceased_name', formData.deceasedName.trim())
        payload.append('date_of_demise', formData.dateOfDemise)
        payload.append('cause_of_demise', formData.causeOfDemise.trim())
        if (formData.deathCertNo.trim()) {
          payload.append('death_cert_no', formData.deathCertNo.trim())
        }
        payload.append('nominee_name', formData.nomineeName.trim())
        payload.append('nominee_relation', formData.nomineeRelation)
        payload.append('nominee_bank', formData.nomineeBank.trim())
        payload.append('nominee_account', formData.nomineeAccount.trim())
        payload.append('nominee_ifsc', formData.nomineeIfsc.trim().toUpperCase())
      } else if (activeTab === 'kanyadaan') {
        payload.append('daughter_name', formData.daughterName.trim())
        payload.append('daughter_age', String(formData.daughterAge))
        payload.append('groom_name', formData.groomName.trim())
        payload.append('groom_father', formData.groomFather.trim())
        payload.append('wedding_date', formData.weddingDate)
        payload.append('wedding_venue', formData.weddingVenue.trim())
        payload.append('invited_district_team', formData.invitedDistrictTeam)
      } else if (activeTab === 'medical') {
        payload.append('patient_name', formData.patientName.trim())
        payload.append('patient_relation', formData.patientRelation)
        payload.append('disease_name', formData.diseaseName)
        payload.append('estimated_cost', String(formData.estimatedCost))
        payload.append('hospital_name', formData.hospitalName.trim())
        if (formData.doctorName.trim()) {
          payload.append('doctor_name', formData.doctorName.trim())
        }
      }

      // Append documents
      uploadedFiles.forEach((file) => {
        payload.append('documents[]', file)
      })

      const res = await publicService.submitWelfareApplication(payload)
      // axiosClient flattens response.data, so res is { status: true, message: '...', data: { application_number: ... } }
      const data = res?.data || res
      const appRecord = data?.application || data

      setSubmittedApp({
        applicationNumber: appRecord.application_number || data.application_number,
        schemeType: appRecord.scheme_type || data.scheme_type || activeTab,
        status: appRecord.status || data.status || 'Pending',
        memberId: appRecord.member_id || data.member_id || formData.memberId,
        district: appRecord.district || data.district || formData.district,
        createdAt: appRecord.created_at || data.created_at || new Date().toISOString(),
      })

      // Reset uploaded files
      setUploadedFiles([])
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors)
        setErrorMsg(
          err.message || 
          (isHindi ? 'कृपया नीचे दी गई त्रुटियों को सुधारें।' : 'Please correct the validation errors below.')
        )
      } else {
        setErrorMsg(
          err.message || 
          (isHindi ? 'आवेदन सबमिट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Failed to submit application. Please try again.')
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Application Live Tracking
  const handleTrackSubmit = async (e) => {
    e.preventDefault()
    setTrackError('')
    setTrackedApplication(null)

    const cleanNum = trackQuery.trim().toUpperCase()
    if (!cleanNum) {
      setTrackError(isHindi ? 'कृपया आवेदन संख्या (Application Number) दर्ज करें।' : 'Please enter application reference number.')
      return
    }

    setIsTracking(true)
    try {
      const res = await publicService.trackWelfareApplication(cleanNum)
      // axiosClient already flattens response.data, so res is { status: true, message: '...', data: { application: { ... } } }
      const app = res?.data?.application || res?.application || res?.data || res
      if (app && (app.application_number || app.id)) {
        setTrackedApplication(app)
      } else {
        setTrackError(isHindi ? 'आवेदन नहीं मिला। कृपया संदर्भ संख्या जांचें।' : 'Application record not found.')
      }
    } catch (err) {
      setTrackError(
        err.message || 
        (isHindi ? 'आवेदन संदर्भ संख्या नहीं मिली। कृपया सही संख्या दर्ज करें।' : 'Application reference number not found.')
      )
    } finally {
      setIsTracking(false)
    }
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }
      case 'Under Review':
        return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }
      case 'Rejected':
        return { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }
      default:
        return { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }
    }
  }

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <div className="section-header" style={{ marginBottom: '28px' }}>
          <span className="section-eyebrow">
            <HeartHandshake size={16} /> {isHindi ? 'जनकल्याणकारी सहायता प्रपत्र' : 'Social Welfare Assistance Portal'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'पारस्परिक कल्याण सहायता ऑनलाइन प्रपत्र' : 'Mutual Welfare Relief Online Portal'}
          </h1>
          <p className="section-subtitle">
            {isHindi 
              ? 'संस्था की नियमावली अनुसार दिवंगत साथी सहायता, कन्यादान महाभियान अथवा आपातकालीन चिकित्सा सहायता हेतु आवेदन अथवा स्थिति ट्रैक करें।'
              : 'Submit official application for Demise Relief, Kanyadaan Marriage Grant, or Sanjeevani Medical Aid and track real-time verification status.'}
          </p>

          {/* Primary Top Mode Switcher: Apply vs Track */}
          <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: 4, borderRadius: 10, marginTop: 18, gap: 4 }}>
            <button
              type="button"
              className={`button button-small ${pageMode === 'apply' ? 'button-gold' : 'button-outline'}`}
              style={{ border: 'none', boxShadow: pageMode === 'apply' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none' }}
              onClick={() => { setPageMode('apply'); setErrorMsg(''); }}
            >
              <HeartHandshake size={15} /> {isHindi ? 'नया सहायता आवेदन (Apply)' : 'New Application'}
            </button>
            <button
              type="button"
              className={`button button-small ${pageMode === 'track' ? 'button-gold' : 'button-outline'}`}
              style={{ border: 'none', boxShadow: pageMode === 'track' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none' }}
              onClick={() => { setPageMode('track'); setTrackError(''); }}
            >
              <Search size={15} /> {isHindi ? 'आवेदन स्थिति ट्रैक करें (Track)' : 'Track Application Status'}
            </button>
          </div>
        </div>

        {/* ========================================================
            TRACK APPLICATION STATUS VIEW
            ======================================================== */}
        {pageMode === 'track' && (
          <div className="form-card">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#eff6ff', color: '#1d4ed8', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <Search size={26} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0c2340', marginBottom: 6 }}>
                {isHindi ? 'सहायता आवेदन स्थिति खोजें' : 'Track Welfare Application Status'}
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                {isHindi ? 'आवेदन जमा करने पर प्राप्त reference number (e.g., APP-2026-MED-00001) दर्ज करें।' : 'Enter the official reference number received upon submission.'}
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} style={{ maxWidth: '540px', margin: '0 auto 24px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  required
                  className="form-control"
                  style={{ textTransform: 'uppercase' }}
                  placeholder="APP-2026-MED-00001"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value.toUpperCase())}
                />
                <button
                  type="submit"
                  className="button button-gold"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: '120px', justifyContent: 'center' }}
                  disabled={isTracking}
                >
                  {isTracking ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
                  <span>{isHindi ? 'ट्रैक करें' : 'Track'}</span>
                </button>
              </div>
            </form>

            {trackError && (
              <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 8, maxWidth: '540px', margin: '0 auto 20px' }}>
                <AlertCircle size={18} /> {trackError}
              </div>
            )}

            {trackedApplication && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 14, marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      {isHindi ? 'आवेदन संदर्भ संख्या' : 'Application Reference'}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', fontFamily: 'monospace' }}>
                      {trackedApplication.application_number}
                    </h3>
                  </div>
                  <span style={{ ...getStatusBadgeStyle(trackedApplication.status), padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: '12.5px' }}>
                    ● {trackedApplication.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, fontSize: '13px', marginBottom: 16 }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>{isHindi ? 'योजना का प्रकार:' : 'Scheme Type:'}</span>
                    <strong style={{ textTransform: 'capitalize' }}>
                      {trackedApplication.scheme_type === 'death' ? (isHindi ? 'दिवंगत आश्रित सहायता (Demise)' : 'Demise Relief Aid') : trackedApplication.scheme_type === 'kanyadaan' ? (isHindi ? 'कन्यादान सहायता (Kanyadaan)' : 'Kanyadaan Marriage Aid') : (isHindi ? 'संजीवनी चिकित्सा सहायता (Medical)' : 'Medical Aid')}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>{isHindi ? 'सदस्यता आईडी:' : 'Member ID:'}</span>
                    <strong style={{ fontFamily: 'monospace' }}>{trackedApplication.member_id}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>{isHindi ? 'जनपद (District):' : 'District:'}</span>
                    <strong>{trackedApplication.district}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>{isHindi ? 'आवेदन तिथि:' : 'Submission Date:'}</span>
                    <strong>{trackedApplication.created_at ? new Date(trackedApplication.created_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN') : 'N/A'}</strong>
                  </div>
                </div>

                {/* Scheme Specific Beneficiary Highlights */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, fontSize: '12.5px', marginBottom: 16 }}>
                  {trackedApplication.scheme_type === 'death' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'दिवंगत साथी: ' : 'Deceased Member: '}</span><strong>{trackedApplication.deceased_name}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'नॉमिनी: ' : 'Nominee: '}</span><strong>{trackedApplication.nominee_name} ({trackedApplication.nominee_relation})</strong></div>
                    </div>
                  )}
                  {trackedApplication.scheme_type === 'kanyadaan' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'सुपुत्री व वर: ' : 'Bride & Groom: '}</span><strong>{trackedApplication.daughter_name} & {trackedApplication.groom_name}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'विवाह तिथि: ' : 'Wedding Date: '}</span><strong>{trackedApplication.wedding_date}</strong></div>
                    </div>
                  )}
                  {trackedApplication.scheme_type === 'medical' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'मरीज व बीमारी: ' : 'Patient & Diagnosis: '}</span><strong>{trackedApplication.patient_name} — {trackedApplication.disease_name}</strong></div>
                      <div><span style={{ color: '#64748b' }}>{isHindi ? 'अस्पताल: ' : 'Hospital: '}</span><strong>{trackedApplication.hospital_name}</strong></div>
                    </div>
                  )}
                </div>

                {/* Administrative Remarks */}
                {trackedApplication.admin_remarks && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12, fontSize: '12.5px', color: '#92400e' }}>
                    <strong>{isHindi ? 'सत्यापन टिप्पणी (Official Remarks):' : 'Official Remarks:'}</strong> {trackedApplication.admin_remarks}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUBMITTED SUCCESS RECEIPT
            ======================================================== */}
        {pageMode === 'apply' && submittedApp && (
          <div className="form-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#047857', marginBottom: '8px' }}>
              {isHindi ? 'सहायता आवेदन सफलतापूर्वक दर्ज किया गया!' : 'Relief Application Submitted Successfully!'}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px' }}>
              {isHindi ? 'आपका आवेदन संबंधित जिला कार्यकारिणी को स्थलीय सत्यापन हेतु प्रेषित कर दिया गया है।' : 'Your application has been forwarded to the local District Executive Committee for on-site inquiry.'}
            </p>

            <div style={{ background: '#f8fafc', border: '2px dashed #b45309', borderRadius: '12px', padding: '18px', display: 'inline-block', marginBottom: '24px', textAlign: 'left', minWidth: '320px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{isHindi ? 'आवेदन संदर्भ संख्या:' : 'Application Reference ID:'}</span>
                <strong style={{ color: '#b45309', fontFamily: 'monospace', fontSize: '16px' }}>{submittedApp.applicationNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{isHindi ? 'सदस्यता आईडी:' : 'Member ID:'}</span>
                <strong style={{ fontSize: '13px' }}>{submittedApp.memberId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{isHindi ? 'योजना का प्रकार:' : 'Scheme Type:'}</span>
                <strong style={{ fontSize: '13px', textTransform: 'capitalize' }}>
                  {submittedApp.schemeType === 'death' ? 'दिवंगत आश्रित सहायता (Demise)' : submittedApp.schemeType === 'kanyadaan' ? 'कन्यादान योजना (Kanyadaan)' : 'संजीवनी चिकित्सा सहायता (Medical)'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{isHindi ? 'वर्तमान स्थिति:' : 'Current Status:'}</span>
                <span style={{ color: '#047857', fontWeight: 800, fontSize: '12.5px' }}>{submittedApp.status}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button-gold button-small"
                onClick={() => window.print()}
              >
                <Printer size={16} /> {isHindi ? 'आवेदन रसीद प्रिंट करें' : 'Print Application Receipt'}
              </button>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => setSubmittedApp(null)}
              >
                {isHindi ? 'नया आवेदन करें' : 'Submit Another Application'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            APPLY FORM VIEW
            ======================================================== */}
        {pageMode === 'apply' && !submittedApp && (
          <div className="form-card">
            {/* Scheme Tab Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: '#f1f5f9', padding: 6, borderRadius: 12, marginBottom: 28 }}>
              <button
                type="button"
                onClick={() => { setActiveTab('death'); setSearchParams({ scheme: 'death' }); setErrorMsg(''); setFieldErrors({}); }}
                style={{
                  padding: '12px 10px',
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: '13px',
                  background: activeTab === 'death' ? '#ffffff' : 'transparent',
                  color: activeTab === 'death' ? '#991b1b' : '#64748b',
                  boxShadow: activeTab === 'death' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <ShieldAlert size={16} /> {isHindi ? 'दिवंगत आश्रित सहायता' : 'Demise Relief Aid'}
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('kanyadaan'); setSearchParams({ scheme: 'kanyadaan' }); setErrorMsg(''); setFieldErrors({}); }}
                style={{
                  padding: '12px 10px',
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: '13px',
                  background: activeTab === 'kanyadaan' ? '#ffffff' : 'transparent',
                  color: activeTab === 'kanyadaan' ? '#92400e' : '#64748b',
                  boxShadow: activeTab === 'kanyadaan' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Gift size={16} /> {isHindi ? 'कन्यादान योजना सहायता' : 'Kanyadaan Marriage Aid'}
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('medical'); setSearchParams({ scheme: 'medical' }); setErrorMsg(''); setFieldErrors({}); }}
                style={{
                  padding: '12px 10px',
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: '13px',
                  background: activeTab === 'medical' ? '#ffffff' : 'transparent',
                  color: activeTab === 'medical' ? '#065f46' : '#64748b',
                  boxShadow: activeTab === 'medical' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Stethoscope size={16} /> {isHindi ? 'संजीवनी चिकित्सा सहायता' : 'Sanjeevani Medical Aid'}
              </button>
            </div>

            {errorMsg && (
              <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Member common lookup */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '22px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0c2340', marginBottom: 12 }}>
                  {isHindi ? '1. पंजीकृत सदस्य का मूल विवरण' : '1. Registered Member Primary Details'}
                </h4>
                <div className="form-grid-3">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{isHindi ? 'सदस्यता आईडी (Member ID):' : 'Member ID:'} <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="NSCT-2024-UP-00101"
                      value={formData.memberId}
                      onChange={(e) => handleChange('memberId', e.target.value.toUpperCase())}
                    />
                    {fieldErrors.member_id && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.member_id[0]}</span>}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{isHindi ? 'गृह जनपद (District):' : 'Home District:'} <span className="req">*</span></label>
                    <select
                      className="form-control form-select"
                      value={formData.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                    >
                      {upDistricts.map((d) => (
                        <option key={d.id} value={d.id}>{d.hindiName} ({d.name})</option>
                      ))}
                    </select>
                    {fieldErrors.district && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.district[0]}</span>}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{isHindi ? 'संपर्क मोबाइल नंबर:' : 'Contact Mobile:'} <span className="req">*</span></label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      className="form-control"
                      placeholder="9876543210"
                      value={formData.mobile}
                      onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
                    />
                    {fieldErrors.mobile && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.mobile[0]}</span>}
                  </div>
                </div>
              </div>

              {/* TAB 1: DEATH RELIEF APPLICATION */}
              {activeTab === 'death' && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#991b1b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldAlert size={18} /> {isHindi ? '2. दिवंगत साथी एवं घटना का विवरण' : '2. Deceased Member & Incident Details'}
                  </h4>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'दिवंगत सदस्य का पूरा नाम:' : 'Deceased Member Full Name:'} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder={isHindi ? 'स्व. सदस्य का नाम' : 'Late Member Name'}
                        value={formData.deceasedName}
                        onChange={(e) => handleChange('deceasedName', e.target.value)}
                      />
                      {fieldErrors.deceased_name && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.deceased_name[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'आकस्मिक निधन की तिथि:' : 'Date of Untimely Demise:'} <span className="req">*</span></label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={formData.dateOfDemise}
                        onChange={(e) => handleChange('dateOfDemise', e.target.value)}
                      />
                      {fieldErrors.date_of_demise && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.date_of_demise[0]}</span>}
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'निधन का कारण (Cause of Demise):' : 'Cause of Demise:'} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder={isHindi ? 'उदा. हार्ट अटैक / सड़क दुर्घटना / आकस्मिक बीमारी' : 'e.g. Heart Attack / Road Accident'}
                        value={formData.causeOfDemise}
                        onChange={(e) => handleChange('causeOfDemise', e.target.value)}
                      />
                      {fieldErrors.cause_of_demise && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.cause_of_demise[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'मृत्यु प्रमाण पत्र संख्या (Death Cert No):' : 'Death Certificate Number:'}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={isHindi ? 'नगर निगम / ग्राम पंचायत द्वारा जारी' : 'Issued by Municipal Corp / Gram Panchayat'}
                        value={formData.deathCertNo}
                        onChange={(e) => handleChange('deathCertNo', e.target.value)}
                      />
                    </div>
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#047857', margin: '20px 0 14px' }}>
                    {isHindi ? '3. नामांकित नॉमिनी बैंक खाता (जिसमें सीधे सहयोग भेजा जाना है)' : '3. Nominee Bank Account (For Direct Benefit Transfer)'}
                  </h4>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'नॉमिनी का पूरा नाम:' : 'Nominee Full Name:'} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder={isHindi ? 'नॉमिनी का नाम' : 'Nominee Name'}
                        value={formData.nomineeName}
                        onChange={(e) => handleChange('nomineeName', e.target.value)}
                      />
                      {fieldErrors.nominee_name && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.nominee_name[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'नॉमिनी का सदस्य से संबंध:' : 'Relationship with Member:'} <span className="req">*</span></label>
                      <select
                        className="form-control form-select"
                        value={formData.nomineeRelation}
                        onChange={(e) => handleChange('nomineeRelation', e.target.value)}
                      >
                        <option value="पत्नी (Wife)">पत्नी (Wife)</option>
                        <option value="पति (Husband)">पति (Husband)</option>
                        <option value="पुत्र (Son)">पुत्र (Son)</option>
                        <option value="पुत्री (Daughter)">पुत्री (Daughter)</option>
                        <option value="माता (Mother)">माता (Mother)</option>
                        <option value="पिता (Father)">पिता (Father)</option>
                      </select>
                      {fieldErrors.nominee_relation && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.nominee_relation[0]}</span>}
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'बैंक का नाम (Bank):' : 'Bank Name:'} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="State Bank of India"
                        value={formData.nomineeBank}
                        onChange={(e) => handleChange('nomineeBank', e.target.value)}
                      />
                      {fieldErrors.nominee_bank && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.nominee_bank[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'खाता संख्या (A/C No):' : 'Bank Account No:'} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="1234567890"
                        value={formData.nomineeAccount}
                        onChange={(e) => handleChange('nomineeAccount', e.target.value)}
                      />
                      {fieldErrors.nominee_account && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.nominee_account[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'आईएफएससी कोड (IFSC):' : 'IFSC Code:'} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        className="form-control"
                        placeholder="SBIN0001234"
                        value={formData.nomineeIfsc}
                        onChange={(e) => handleChange('nomineeIfsc', e.target.value.toUpperCase())}
                      />
                      {fieldErrors.nominee_ifsc && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.nominee_ifsc[0]}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: KANYADAAN APPLICATION */}
              {activeTab === 'kanyadaan' && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#92400e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Gift size={18} /> {isHindi ? '2. पुत्री एवं वैवाहिक कार्यक्रम का विवरण' : '2. Daughter & Marriage Ceremony Particulars'}
                  </h4>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{isHindi ? "सुपुत्री का पूरा नाम (Daughter's Name):" : "Daughter's Full Name:"} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder={isHindi ? 'कन्या का नाम' : 'Bride Name'}
                        value={formData.daughterName}
                        onChange={(e) => handleChange('daughterName', e.target.value)}
                      />
                      {fieldErrors.daughter_name && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.daughter_name[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'सुपुत्री की आयु (Age - 18+ होना अनिवार्य):' : 'Daughter Age (18+ Mandatory):'} <span className="req">*</span></label>
                      <input
                        type="number"
                        min="18"
                        required
                        className="form-control"
                        placeholder="21"
                        value={formData.daughterAge}
                        onChange={(e) => handleChange('daughterAge', e.target.value)}
                      />
                      {fieldErrors.daughter_age && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.daughter_age[0]}</span>}
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{isHindi ? "वर का पूरा नाम (Groom's Name):" : "Groom's Full Name:"} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder={isHindi ? 'वर का नाम' : 'Groom Name'}
                        value={formData.groomName}
                        onChange={(e) => handleChange('groomName', e.target.value)}
                      />
                      {fieldErrors.groom_name && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.groom_name[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? "वर के पिता का नाम (Groom's Father):" : "Groom's Father Name:"} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder={isHindi ? 'वर के पिता का नाम' : 'Father of Groom'}
                        value={formData.groomFather}
                        onChange={(e) => handleChange('groomFather', e.target.value)}
                      />
                      {fieldErrors.groom_father && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.groom_father[0]}</span>}
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'शुभ विवाह की तिथि (Wedding Date):' : 'Wedding Date:'} <span className="req">*</span></label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={formData.weddingDate}
                        onChange={(e) => handleChange('weddingDate', e.target.value)}
                      />
                      <span className="form-hint">{isHindi ? 'विवाह से कम से कम 30 दिन पूर्व आवेदन करना अनिवार्य है।' : 'Application must be submitted at least 30 days prior.'}</span>
                      {fieldErrors.wedding_date && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.wedding_date[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'विवाह स्थल / मैरिज लॉन का पता:' : 'Wedding Venue / Banquet Address:'} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder={isHindi ? 'उदा. रॉयल पैलेस, सिविल लाइंस' : 'e.g. Royal Palace, Civil Lines'}
                        value={formData.weddingVenue}
                        onChange={(e) => handleChange('weddingVenue', e.target.value)}
                      />
                      {fieldErrors.wedding_venue && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.wedding_venue[0]}</span>}
                    </div>
                  </div>

                  <div style={{ background: '#fef3c7', padding: '14px', borderRadius: '8px', border: '1px solid #fde68a', margin: '14px 0 20px' }}>
                    <label className="form-label" style={{ color: '#92400e' }}>
                      {isHindi 
                        ? 'क्या आपने विवाह समारोह में स्थानीय जिला कार्यकारिणी को औपचारिक निमंत्रण भेजा है?' 
                        : 'Have you sent an official wedding invitation to the local district executive committee?'} <span className="req">*</span>
                    </label>
                    <select
                      className="form-control form-select"
                      value={formData.invitedDistrictTeam}
                      onChange={(e) => handleChange('invitedDistrictTeam', e.target.value)}
                    >
                      <option value="हाँ (Yes)">{isHindi ? 'हाँ, निमंत्रण पत्र प्रेषित किया गया है (Yes)' : 'Yes, invitation sent (Yes)'}</option>
                      <option value="शीघ्र भेज दिया जाएगा">{isHindi ? 'शीघ्र भेज दिया जाएगा (Will send shortly)' : 'Will send shortly'}</option>
                    </select>
                    <span style={{ fontSize: '11px', color: '#b45309', display: 'block', marginTop: 4 }}>
                      {isHindi 
                        ? 'नियमावली अनुसार जिला टीम का विवाह में सम्मिलित होकर भौतिक सत्यापन करना कन्यादान सहयोग हेतु अनिवार्य शर्त है।' 
                        : 'Physical verification by district team representatives at wedding is statutory requirement.'}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: MEDICAL APPLICATION */}
              {activeTab === 'medical' && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#047857', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Stethoscope size={18} /> {isHindi ? '2. मरीज एवं गंभीर बीमारी का विवरण' : '2. Patient Diagnosis & Hospital Details'}
                  </h4>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'मरीज का पूरा नाम (Patient Name):' : 'Patient Full Name:'} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder={isHindi ? 'मरीज का नाम' : 'Patient Name'}
                        value={formData.patientName}
                        onChange={(e) => handleChange('patientName', e.target.value)}
                      />
                      {fieldErrors.patient_name && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.patient_name[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'सदस्य से संबंध:' : 'Relationship with Member:'} <span className="req">*</span></label>
                      <select
                        className="form-control form-select"
                        value={formData.patientRelation}
                        onChange={(e) => handleChange('patientRelation', e.target.value)}
                      >
                        <option value="स्वयं (Self)">स्वयं (Self)</option>
                        <option value="पत्नी (Wife)">पत्नी (Wife)</option>
                        <option value="पति (Husband)">पति (Husband)</option>
                        <option value="पुत्र (Son)">पुत्र (Son)</option>
                        <option value="पुत्री (Daughter)">पुत्री (Daughter)</option>
                        <option value="माता (Mother)">माता (Mother)</option>
                        <option value="पिता (Father)">पिता (Father)</option>
                      </select>
                      {fieldErrors.patient_relation && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.patient_relation[0]}</span>}
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'बीमारी / व्याधि का नाम (Diagnosis):' : 'Disease / Diagnosis Category:'} <span className="req">*</span></label>
                      <select
                        className="form-control form-select"
                        value={formData.diseaseName}
                        onChange={(e) => handleChange('diseaseName', e.target.value)}
                      >
                        <option value="कैंसर रोग (Cancer)">कैंसर रोग (Cancer - सभी चरण)</option>
                        <option value="हृदय रोग / कार्डियक सर्जरी (Heart)">हृदय रोग / ओपन हार्ट सर्जरी</option>
                        <option value="किडनी विफलता / प्रत्यारोपण (Kidney)">किडनी विफलता / डायलिसिस</option>
                        <option value="गंभीर सड़क दुर्घटना / ट्रॉमा (Accident)">गंभीर सड़क दुर्घटना / ट्रॉमा</option>
                        <option value="ब्रेन हैमरेज / न्यूरोलॉजिकल (Neuro)">ब्रेन हैमरेज / न्यूरोलॉजिकल</option>
                        <option value="अन्य गंभीर जीवन रक्षक उपचार (Other)">अन्य गंभीर जीवन रक्षक उपचार</option>
                      </select>
                      {fieldErrors.disease_name && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.disease_name[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'अनुमानित उपचार खर्च (₹ Estimated Cost):' : 'Estimated Treatment Cost (₹):'} <span className="req">*</span></label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-control"
                        placeholder="500000"
                        value={formData.estimatedCost}
                        onChange={(e) => handleChange('estimatedCost', e.target.value)}
                      />
                      {fieldErrors.estimated_cost && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.estimated_cost[0]}</span>}
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'अस्पताल / चिकित्सा संस्थान का नाम:' : 'Hospital / Medical Institute Name:'} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="SGPGIMS Lucknow / AIIMS"
                        value={formData.hospitalName}
                        onChange={(e) => handleChange('hospitalName', e.target.value)}
                      />
                      {fieldErrors.hospital_name && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.hospital_name[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'उपचारक वरिष्ठ चिकित्सक का नाम:' : 'Attending Senior Consultant Name:'}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={isHindi ? 'डॉक्टर का नाम' : 'Doctor Name'}
                        value={formData.doctorName}
                        onChange={(e) => handleChange('doctorName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Supporting Document Uploads Section */}
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Upload size={20} style={{ color: '#b45309', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0c2340' }}>
                      {isHindi ? 'संबंधित दस्तावेज संलग्न करें (वैकल्पिक / Optional):' : 'Attach Supporting Documents (Optional):'}
                    </strong>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {isHindi 
                        ? 'मृत्यु प्रमाण पत्र / विवाह निमंत्रण कार्ड / चिकित्सा प्राक्कलन (JPG, PNG, WebP, PDF - अधिकतम 5 फाइलें, 5MB प्रत्येक)'
                        : 'Certificates, wedding card, medical bills/estimates (JPG, PNG, WebP, PDF - max 5 files, 5MB each)'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label
                    className="button button-outline button-small"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff' }}
                  >
                    <Upload size={14} />
                    <span>{isHindi ? 'दस्तावेज चुनें' : 'Choose Files'}</span>
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      disabled={uploadedFiles.length >= 5}
                    />
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 10 }}>
                    {uploadedFiles.length}/5 {isHindi ? 'फाइलें चयनित' : 'files selected'}
                  </span>
                </div>

                {uploadError && (
                  <div style={{ color: '#dc2626', fontSize: '12px', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={14} /> {uploadError}
                  </div>
                )}

                {/* Selected File Pills */}
                {uploadedFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '12px',
                          color: '#334155'
                        }}
                      >
                        <FileText size={14} style={{ color: '#0284c7' }} />
                        <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.name}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                          ({(f.size / 1024).toFixed(0)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(i)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'grid', placeItems: 'center', color: '#dc2626' }}
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Declaration */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: '12.5px', color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    {isHindi
                      ? 'मैं प्रमाणित करता/करती हूँ कि ऊपर दी गई समस्त जानकारी पूर्णतः सत्य है। यदि कोई जानकारी असत्य या भ्रामक पाई जाती है, तो संस्था को आवेदन निरस्त करने तथा सदस्यता समाप्त करने का पूर्ण अधिकार होगा।'
                      : 'I certify that all details submitted above are true and accurate. In case of any fraudulent or misleading information, the Trust reserves the right to reject the application and terminate membership.'}
                  </span>
                </label>
                {fieldErrors.agree_terms && <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: 4 }}>{fieldErrors.agree_terms[0]}</span>}
              </div>

              <button
                type="submit"
                className="button button-gold button-large"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>{isHindi ? 'आवेदन सबमिट हो रहा है...' : 'Submitting Application...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>{isHindi ? 'ऑनलाइन सहायता आवेदन सबमिट करें' : 'Submit Welfare Application Online'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
