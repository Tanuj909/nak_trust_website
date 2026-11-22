import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Copy, 
  HeartHandshake, 
  Loader2, 
  QrCode, 
  X 
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getMediaUrl, publicService } from '../../api'
import { siteConfig } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import { upDistricts } from '../../data/districts'
import { useLanguage } from '../../i18n/LanguageContext'

export default function DonateModal({ campaign, isOpen, onClose, onSuccess }) {
  const { isHindi } = useLanguage()
  const { user } = useAuth()

  // 1: Select amount & details, 2: QR & Bank, 3: Upload Code & Screenshot, 4: Submitted Pending Review
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [district, setDistrict] = useState('लखनऊ (Lucknow)')
  const [category, setCategory] = useState('B')
  const [isAnonymous, setIsAnonymous] = useState(false)

  // Active QR state from backend
  const [activeQr, setActiveQr] = useState(null)
  const [loadingQr, setLoadingQr] = useState(false)

  // Verification fields
  const [utrCode, setUtrCode] = useState('')
  const [screenshotFile, setScreenshotFile] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionId, setSubmissionId] = useState('')
  const [copiedUpi, setCopiedUpi] = useState(false)

  // Field validation and API errors
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  // Prefill details and fetch Active QR whenever modal opens
  useEffect(() => {
    if (!isOpen) return

    setStep(1)
    setSubmitError('')
    setFieldErrors({})
    setUtrCode('')
    setScreenshotFile(null)
    setScreenshotPreview(null)

    // Prefill logged in member details if available
    if (user) {
      if (user.name) setDonorName(user.name)
      if (user.email) setEmail(user.email)
      if (user.phone) setMobile(user.phone)
      if (user.profile?.district) setDistrict(user.profile.district)
      if (user.profile?.category) setCategory(user.profile.category)
    }

    // Fetch live active Trust QR configuration
    const fetchActiveQr = async () => {
      setLoadingQr(true)
      try {
        const res = await publicService.getActiveQr()
        if (res?.data) {
          setActiveQr(res.data)
        }
      } catch (err) {
        // Fallback to null if not configured or 404
        setActiveQr(null)
      } finally {
        setLoadingQr(false)
      }
    }

    fetchActiveQr()
  }, [isOpen, user])

  if (!isOpen) return null

  const handleAmountClick = (val) => {
    setAmount(val)
    setCustomAmount('')
  }

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value)
    setAmount(Number(e.target.value) || 0)
  }

  const handleProceedToQR = (e) => {
    e.preventDefault()
    if (!donorName.trim() || !mobile.trim()) {
      alert(isHindi ? 'कृपया अपना नाम और मोबाइल नंबर दर्ज करें!' : 'Please enter your name and mobile number!')
      return
    }
    if (amount < 1) {
      alert(isHindi ? 'कृपया कम से कम ₹1 की सहयोग राशि दर्ज करें।' : 'Please enter a donation amount of at least ₹1.')
      return
    }
    setStep(2)
  }

  const handleProceedToVerify = () => {
    setStep(3)
  }

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert(isHindi ? 'फ़ाइल का आकार 2MB से कम होना चाहिए।' : 'Screenshot file size must be less than 2MB.')
        return
      }
      setScreenshotFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result)
      }
      reader.readAsDataURL(file)
      // Clear screenshot error
      setFieldErrors((prev) => ({ ...prev, screenshot: null }))
    }
  }

  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setFieldErrors({})

    const errors = {}
    if (!utrCode.trim()) {
      errors.transaction_id = [
        isHindi 
          ? 'कृपया 12-अंकों का UPI UTR अथवा बैंक संदर्भ संख्या (Transaction Reference Code) दर्ज करें!'
          : 'Please enter the 12-digit UPI UTR or bank transaction reference code!'
      ]
    }
    if (!screenshotFile) {
      errors.screenshot = [
        isHindi 
          ? 'कृपया भुगतान की रसीद अथवा स्क्रीनशॉट अपलोड करें!'
          : 'Please upload the payment screenshot as proof of transaction!'
      ]
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('donor_name', donorName.trim())
      if (email.trim()) formData.append('donor_email', email.trim())
      if (mobile.trim()) formData.append('donor_phone', mobile.trim())
      formData.append('amount', String(amount))
      formData.append('transaction_id', utrCode.trim())
      formData.append('screenshot', screenshotFile)
      formData.append('is_anonymous', isAnonymous ? '1' : '0')
      if (category) formData.append('category', category)
      if (district) formData.append('district', district)

      const res = await publicService.submitDonation(formData)
      const savedDonation = res?.data || {}
      setSubmissionId(savedDonation.id ? `DON-${savedDonation.id}` : utrCode.trim())
      setStep(4)

      if (typeof onSuccess === 'function') {
        onSuccess(savedDonation)
      }
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors)
        setSubmitError(
          err.message ||
            (isHindi
              ? 'सत्यापन विफल रहा। कृपया नीचे दी गई त्रुटियों को सुधारें।'
              : 'Validation failed. Please correct the highlighted fields.')
        )
      } else {
        setSubmitError(
          err.message ||
            (isHindi
              ? 'सहयोग सबमिट करने में असमर्थ। कृपया इंटरनेट कनेक्शन या UTR कोड जांचें।'
              : 'Unable to submit donation. Please check your connection or UTR number.')
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyUpiId = () => {
    const upi = activeQr?.upi_id || 'nsctup.trust@sbi'
    navigator.clipboard.writeText(upi)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2500)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* STEP 1: AMOUNT & DONOR DETAILS */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
                <HeartHandshake size={26} />
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0c2340' }}>
                {isHindi ? 'Direct Contribution / स्वैच्छिक जनसहयोग' : 'Direct Mutual Contribution'}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {campaign ? campaign.title : 'NAK Trust - National Self Care Team Mutual Welfare Fund'}
              </p>
            </div>

            {campaign && (
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>{isHindi ? 'Nominee / आश्रित:' : 'Beneficiary Nominee:'}</span>
                  <strong>{campaign.nomineeName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>{isHindi ? 'Bank / खाता:' : 'Nominee Bank Account:'}</span>
                  <strong style={{ color: '#047857' }}>{campaign.nomineeAccount} ({campaign.nomineeIfsc})</strong>
                </div>
              </div>
            )}

            <form onSubmit={handleProceedToQR}>
              <div className="form-group">
                <label className="form-label">{isHindi ? 'Select Contribution Amount (सहयोग राशि):' : 'Select Contribution Amount:'}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  {[50, 100, 200, 500].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => handleAmountClick(val)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: amount === val && !customAmount ? '2px solid #b45309' : '1px solid #cbd5e1',
                        background: amount === val && !customAmount ? '#fef3c7' : '#ffffff',
                        color: amount === val && !customAmount ? '#92400e' : '#1e293b',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder={isHindi ? 'Enter other custom amount (₹ अन्य राशि)' : 'Enter custom amount in ₹'}
                  value={customAmount}
                  onChange={handleCustomChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isHindi ? 'Donor Full Name (आपका नाम):' : 'Donor Full Name:'} <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder={isHindi ? 'उदा. रमेश कुमार' : 'e.g. Ramesh Kumar'}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{isHindi ? 'Mobile Number:' : 'Mobile Number:'} <span className="req">*</span></label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    className="form-control"
                    placeholder="10 digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{isHindi ? 'Email (वैकल्पिक):' : 'Email Address (Optional):'}</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{isHindi ? 'District (जनपद):' : 'District:'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={isHindi ? 'उदा. लखनऊ / गोरखपुर' : 'e.g. Lucknow / Gorakhpur'}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{isHindi ? 'Category (संवर्ग):' : 'Membership Category:'}</label>
                  <select
                    className="form-control form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="A">संवर्ग A (Government)</option>
                    <option value="B">संवर्ग B (Private)</option>
                    <option value="C">संवर्ग C (Professional)</option>
                    <option value="D">संवर्ग D (Others)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="button button-gold" style={{ width: '100%', padding: '12px', marginTop: 10 }}>
                {isHindi ? `भुगतान विकल्प देखें (₹${amount}) →` : `Proceed to Payment (₹${amount}) →`}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: QR CODE */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <span className="badge-pill" style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 800 }}>
                {isHindi ? 'चरण 2/3: QR कोड स्कैन करें' : 'Step 2 of 3: Scan UPI QR Code'}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', marginTop: 4 }}>
                {isHindi ? 'भुगतान विकल्प (UPI QR कोड)' : 'Payment Options (UPI QR Code)'}
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>
                {isHindi ? 'सहयोग राशि: ' : 'Payment Amount: '}<strong style={{ color: '#047857', fontSize: '15px' }}>₹{amount}</strong>
              </p>
            </div>

            {/* QR Code Card */}
            <div style={{ maxWidth: '340px', margin: '0 auto 18px', background: '#f8fafc', border: '2px dashed #b45309', borderRadius: 12, padding: 18, textAlign: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                {activeQr?.title || (isHindi ? 'आधिकारिक ट्रस्ट UPI QR कोड' : 'Official Trust UPI QR Code')}
              </span>

              <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 160, minWidth: 160, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                {loadingQr ? (
                  <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#b45309' }} />
                ) : activeQr?.qr_image_url ? (
                  <img
                    src={getMediaUrl(activeQr.qr_image_url)}
                    alt={activeQr.title || 'Trust QR'}
                    style={{ maxHeight: '160px', maxWidth: '160px', objectFit: 'contain' }}
                  />
                ) : (
                  <QrCode size={145} style={{ color: '#0c2340' }} />
                )}
              </div>

              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: '#047857', marginBottom: 6 }}>
                  UPI ID: {activeQr?.upi_id || 'nsctup.trust@sbi'}
                </p>
                <button
                  type="button"
                  onClick={copyUpiId}
                  style={{ fontSize: '11px', color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                >
                  <Copy size={12} /> {copiedUpi ? (isHindi ? 'UPI कॉपी हुआ!' : 'UPI Copied!') : (isHindi ? 'UPI आईडी कॉपी करें' : 'Copy UPI ID')}
                </button>
              </div>
              <small style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: 8 }}>
                {isHindi ? 'GPay, PhonePe, Paytm, BHIM द्वारा स्कैन करें' : 'Scan with GPay, PhonePe, Paytm, BHIM'}
              </small>
            </div>

            {/* Success button */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
              <p style={{ fontSize: '12.5px', color: '#065f46', fontWeight: 700, marginBottom: 8 }}>
                {isHindi 
                  ? `क्या आपने QR कोड स्कैन करके ₹${amount} का भुगतान कर दिया है?`
                  : `Have you completed the payment of ₹${amount} via QR Code?`}
              </p>
              <button
                type="button"
                className="button button-gold"
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                onClick={handleProceedToVerify}
              >
                <CheckCircle size={17} /> {isHindi ? 'Payment Completed / Success (मैंने भुगतान कर दिया है)' : 'Payment Completed / Success'}
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => setStep(1)}
              >
                ← {isHindi ? 'पिछला' : 'Back'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSACTION CODE & SCREENSHOT UPLOAD */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span className="badge-pill" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '11px', fontWeight: 800 }}>
                {isHindi ? 'चरण 3/3: सत्यापन विवरण' : 'Step 3 of 3: Verification Details'}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', marginTop: 4 }}>
                {isHindi ? 'लेन-देन कोड दर्ज करें एवं स्क्रीनशॉट अपलोड करें' : 'Enter Transaction Code & Upload Screenshot'}
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>
                {isHindi 
                  ? 'कृपया अपने भुगतान का 12-अंकों का UTR/Ref कोड एवं स्क्रीनशॉट अपलोड करें ताकि ट्रस्ट प्रशासन सत्यापन कर इसे स्वीकृत कर सके।'
                  : 'Please enter your 12-digit UTR/Ref code and attach screenshot so Trust Administration can verify and approve it.'}
              </p>
            </div>

            {submitError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 10, borderRadius: 6, fontSize: '12px', marginBottom: 14 }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleFinalSubmit}>
              <div className="form-group">
                <label className="form-label">
                  {isHindi ? 'Transaction Code / UPI UTR / Bank Reference No:' : 'Transaction Reference Code / UPI UTR No:'} <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="508219482103 (12-digit UTR)"
                  value={utrCode}
                  onChange={(e) => {
                    setUtrCode(e.target.value)
                    setFieldErrors((prev) => ({ ...prev, transaction_id: null }))
                  }}
                />
                {fieldErrors.transaction_id && (
                  <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 4, display: 'block' }}>
                    {fieldErrors.transaction_id[0]}
                  </span>
                )}
                <span className="form-hint">
                  {isHindi ? 'आपके Google Pay, PhonePe, Paytm अथवा बैंक रसीद पर प्रदर्शित UTR नंबर।' : '12-digit UTR or Reference number shown on receipt.'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {isHindi ? 'Upload Payment Screenshot (स्क्रीनशॉट अपलोड करें):' : 'Upload Payment Screenshot:'} <span className="req">*</span>
                </label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: 8, padding: 14, textAlign: 'center', background: '#f8fafc' }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    required
                    onChange={handleScreenshotChange}
                    style={{ marginBottom: 10, fontSize: '12px' }}
                  />
                  {screenshotPreview && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: 4 }}>
                        {isHindi ? 'स्क्रीनशॉट प्रिव्यू (Preview):' : 'Screenshot Preview:'}
                      </span>
                      <img
                        src={screenshotPreview}
                        alt="Screenshot Preview"
                        style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: 6, margin: '0 auto', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}
                </div>
                {fieldErrors.screenshot && (
                  <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 4, display: 'block' }}>
                    {fieldErrors.screenshot[0]}
                  </span>
                )}
              </div>

              {/* Anonymous Checkbox */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12.5px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#b45309' }}
                  />
                  <span>
                    {isHindi ? 'दानकर्ता का नाम सार्वजनिक सूची में गोपनीय (Anonymous) रखें' : 'Keep my identity anonymous on the public Sahyog Wall'}
                  </span>
                </label>
              </div>

              <div style={{ background: '#fef3c7', padding: 10, borderRadius: 6, fontSize: '11.5px', color: '#92400e', marginBottom: 16 }}>
                <strong>{isHindi ? 'नोट: ' : 'Note: '}</strong>
                {isHindi 
                  ? 'सबमिट करने के उपरांत ट्रस्ट प्रशासन द्वारा कोड व स्क्रीनशॉट का मिलान कर इसे सत्यापित किया जाएगा।'
                  : 'After submission, the Trust administration will review the transaction and record it in the official ledger.'}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  className="button button-primary"
                  style={{ flexGrow: 1, padding: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>{isHindi ? 'सबमिट हो रहा है...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <span>{isHindi ? 'सत्यापन हेतु सबमिट करें' : 'Submit for Verification'}</span>
                  )}
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                >
                  {isHindi ? 'वापस जाएं' : 'Back'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: SUBMISSION CONFIRMATION - PENDING ADMIN REVIEW */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
              <Clock size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0c2340', marginBottom: 6 }}>
              {isHindi ? 'भुगतान सत्यापन हेतु सबमिट हुआ' : 'Payment Submitted for Verification'}
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
              {isHindi ? 'आपके भुगतान का UTR कोड एवं स्क्रीनशॉट सफलतापूर्वक दर्ज कर लिया गया है।' : 'Your UTR reference and payment screenshot have been recorded successfully.'}
            </p>

            <div style={{ background: '#f8fafc', border: '1px dashed #b45309', borderRadius: 10, padding: 14, display: 'inline-block', marginBottom: 18, textAlign: 'left', minWidth: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{isHindi ? 'सबमिशन आईडी:' : 'Submission ID:'}</span>
                <strong style={{ fontFamily: 'monospace', color: '#b45309' }}>{submissionId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{isHindi ? 'राशि:' : 'Amount:'}</span>
                <strong style={{ color: '#047857' }}>₹{amount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{isHindi ? 'UTR कोड:' : 'UTR Code:'}</span>
                <code style={{ fontSize: '12px' }}>{utrCode}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{isHindi ? 'समीक्षा स्थिति:' : 'Review Status:'}</span>
                <span style={{ color: '#d97706', fontWeight: 800, fontSize: '12px' }}>● {isHindi ? 'समीक्षाधीन (Pending Review)' : 'Pending Review'}</span>
              </div>
            </div>

            <div style={{ background: '#ecfdf5', padding: 10, borderRadius: 8, fontSize: '12px', color: '#065f46', marginBottom: 20 }}>
              {isHindi 
                ? '✓ ट्रस्ट प्रशासन द्वारा सत्यापन होते ही यह सहयोग सूची में प्रदर्शित हो जाएगा।'
                : '✓ Once verified by the Trust administration, this entry will reflect on the live Public Sahyog List.'}
            </div>

            <button
              type="button"
              className="button button-gold"
              onClick={onClose}
              style={{ width: '100%' }}
            >
              {isHindi ? 'Done / बंद करें' : 'Done / Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
