import { AlertCircle, CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, Send, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { publicService } from '../../api'
import { siteConfig } from '../../config/site'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Contact() {
  const { isHindi } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    memberId: '',
    subject: 'सदस्यता संबंधी प्रश्न',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [ticketData, setTicketData] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError('')

    // Client-side quick checks
    const errors = {}
    if (!formData.name.trim()) {
      errors.full_name = [isHindi ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Full name is required.']
    }
    if (!formData.email.trim()) {
      errors.email = [isHindi ? 'कृपया अपना ईमेल पता दर्ज करें।' : 'Email address is required.']
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = [isHindi ? 'कृपया एक वैध ईमेल पता दर्ज करें।' : 'Please enter a valid email address.']
    }
    const cleanPhone = formData.mobile.replace(/\D/g, '')
    if (!cleanPhone) {
      errors.phone = [isHindi ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Mobile number is required.']
    } else if (cleanPhone.length !== 10) {
      errors.phone = [isHindi ? 'मोबाइल नंबर ठीक 10 अंकों का होना चाहिए।' : 'Mobile number must be exactly 10 digits.']
    }
    if (!formData.message.trim()) {
      errors.message = [isHindi ? 'कृपया विस्तृत संदेश दर्ज करें।' : 'Message details are required.']
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        phone: cleanPhone,
        member_id: formData.memberId.trim() || null,
        subject: formData.subject,
        message: formData.message.trim(),
      }

      const res = await publicService.submitContact(payload)
      const inquiry = res?.data?.inquiry || res?.data || {}

      setTicketData({
        id: inquiry.id,
        email: inquiry.email || formData.email.trim(),
        fullName: inquiry.full_name || formData.name.trim(),
      })

      // Reset form on success
      setFormData({
        name: '',
        email: '',
        mobile: '',
        memberId: '',
        subject: 'सदस्यता संबंधी प्रश्न',
        message: '',
      })
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors)
        setGeneralError(
          err.message ||
            (isHindi ? 'कृपया नीचे दी गई त्रुटियों को ठीक करें।' : 'Please correct the highlighted errors.')
        )
      } else if (err.status === 429) {
        setGeneralError(
          isHindi
            ? 'आपने बहुत अधिक अनुरोध किए हैं। कृपया कुछ मिनट प्रतीक्षा करें।'
            : 'Too many inquiries submitted. Please wait a few moments and try again.'
        )
      } else {
        setGeneralError(
          err.message ||
            (isHindi
              ? 'संदेश प्रेषित करने में समस्या हुई। कृपया पुनः प्रयास करें।'
              : 'Failed to submit inquiry. Please try again later.')
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="section-eyebrow">
            <Phone size={16} /> {isHindi ? '24x7 सहायता एवं सम्पर्क' : '24x7 Support & Grievance Cell'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'केन्द्रीय कार्यालय एवं जनसुनवाई प्रकोष्ठ' : 'Headquarters & Grievance Redressal Cell'}
          </h1>
          <p className="section-subtitle">
            {isHindi
              ? 'सदस्यता, सहयोग अभियान, कन्यादान सहायता अथवा किसी भी समस्या के समाधान हेतु सम्पर्क करें।'
              : 'Connect with our statewide helpdesk for membership, campaign status, or welfare inquiries.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
          {/* Contact Details Card */}
          <div className="category-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', marginBottom: 18 }}>
              {isHindi ? 'केन्द्रीय प्रशासनिक कार्यालय (लखनऊ)' : 'Central Administrative Headquarters (Lucknow)'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <MapPin size={20} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#0c2340' }}>{isHindi ? 'केन्द्रीय पता:' : 'HQ Address:'}</strong>
                  <p style={{ fontSize: '13px', color: '#475569', marginTop: 2 }}>{siteConfig.officeAddress}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Phone size={20} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#0c2340' }}>{isHindi ? 'हेल्पलाइन नम्बर:' : 'Helpline Numbers:'}</strong>
                  <p style={{ fontSize: '13px', color: '#475569', marginTop: 2 }}>
                    <strong>{siteConfig.helpline}</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Mail size={20} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#0c2340' }}>{isHindi ? 'ईमेल आईडी:' : 'Official Email:'}</strong>
                  <p style={{ fontSize: '13px', color: '#475569', marginTop: 2 }}>{siteConfig.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Clock size={20} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#0c2340' }}>{isHindi ? 'कार्यालय समय:' : 'Office Hours:'}</strong>
                  <p style={{ fontSize: '13px', color: '#475569', marginTop: 2 }}>
                    {isHindi ? 'सोमवार से शनिवार: प्रातः 10:00 बजे से सायं 06:00 बजे तक' : 'Monday to Saturday: 10:00 AM to 06:00 PM'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: '#fef3c7', padding: '14px', borderRadius: 8, marginTop: 24, border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <ShieldCheck size={20} style={{ color: '#92400e' }} />
                <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 700 }}>
                  {isHindi ? 'पंजीकरण संख्या: 130/2025 • उत्तर प्रदेश शासन में विधिवत पंजीकृत' : 'Registration No: 130/2025 • Registered in Uttar Pradesh'}
                </span>
              </div>
            </div>
          </div>

          {/* Grievance Ticket Form */}
          <div className="form-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', marginBottom: 18 }}>
              {isHindi ? 'ऑनलाइन जनसुनवाई / संदेश प्रेषण' : 'Submit Online Query / Grievance'}
            </h2>

            {/* General Error Alert */}
            {generalError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 20,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  color: '#991b1b',
                  fontSize: '13px',
                  lineHeight: 1.4,
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1, color: '#dc2626' }} />
                <div style={{ flex: 1 }}>{generalError}</div>
              </div>
            )}

            {ticketData ? (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#047857', marginBottom: 8 }}>
                  {isHindi ? 'आपका संदेश सफलतापूर्वक प्राप्त हुआ!' : 'Inquiry Submitted Successfully!'}
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', marginBottom: 20 }}>
                  {isHindi
                    ? 'नागवंशीय चेतना ट्रस्ट से संपर्क करने के लिए धन्यवाद।'
                    : 'Thank you for reaching out to Nagvanshiya Chetna Trust.'}
                </p>

                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    padding: '12px 16px',
                    maxWidth: '440px',
                    margin: '0 auto 20px',
                    textAlign: 'left',
                  }}
                >
                  <p style={{ fontSize: '12.5px', color: '#166534', margin: 0, lineHeight: 1.5 }}>
                    <strong>{isHindi ? 'पुष्टिकरण ईमेल प्रेषित:' : 'Acknowledgment Email Sent:'}</strong>{' '}
                    {isHindi
                      ? `आपके ईमेल (${ticketData.email}) पर पावती भेज दी गई है। हमारे प्रतिनिधि शीघ्र ही आपसे संपर्क करेंगे।`
                      : `A confirmation email has been Sent to ${ticketData.email}. Our team will review and get in touch with you shortly.`}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    className="button button-gold button-small"
                    onClick={() => {
                      setTicketData(null)
                      setGeneralError('')
                      setFieldErrors({})
                    }}
                  >
                    {isHindi ? 'नया संदेश भेजें' : 'Send Another Message'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Full Name & Email in 2 columns */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'आपका पूरा नाम:' : 'Full Name:'} <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      style={fieldErrors.full_name ? { borderColor: '#ef4444' } : {}}
                      placeholder={isHindi ? 'उदा. राकेश कुमार' : 'e.g. Rakesh Kumar'}
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (fieldErrors.full_name) setFieldErrors({ ...fieldErrors, full_name: null })
                      }}
                    />
                    {fieldErrors.full_name && (
                      <span
                        style={{
                          color: '#dc2626',
                          fontSize: '12px',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertCircle size={12} /> {fieldErrors.full_name[0]}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'ईमेल पता:' : 'Email Address:'} <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      style={fieldErrors.email ? { borderColor: '#ef4444' } : {}}
                      placeholder={isHindi ? 'उदा. rakesh@example.com' : 'e.g. rakesh@example.com'}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null })
                      }}
                    />
                    {fieldErrors.email && (
                      <span
                        style={{
                          color: '#dc2626',
                          fontSize: '12px',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertCircle size={12} /> {fieldErrors.email[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Number & Member ID in 2 columns */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'मोबाइल नंबर (10 अंक):' : 'Mobile Number (10 digits):'} <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      className="form-control"
                      style={fieldErrors.phone ? { borderColor: '#ef4444' } : {}}
                      placeholder="9876543210"
                      value={formData.mobile}
                      onChange={(e) => {
                        setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: null })
                      }}
                    />
                    {fieldErrors.phone && (
                      <span
                        style={{
                          color: '#dc2626',
                          fontSize: '12px',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertCircle size={12} /> {fieldErrors.phone[0]}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'सदस्यता आईडी (यदि हो):' : 'Member ID (If applicable):'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={fieldErrors.member_id ? { borderColor: '#ef4444' } : {}}
                      placeholder="NSCT-2024-UP-00101"
                      value={formData.memberId}
                      onChange={(e) => {
                        setFormData({ ...formData, memberId: e.target.value })
                        if (fieldErrors.member_id) setFieldErrors({ ...fieldErrors, member_id: null })
                      }}
                    />
                    {fieldErrors.member_id && (
                      <span
                        style={{
                          color: '#dc2626',
                          fontSize: '12px',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertCircle size={12} /> {fieldErrors.member_id[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject Dropdown */}
                <div className="form-group">
                  <label className="form-label">
                    {isHindi ? 'विषय / संदर्भ:' : 'Subject:'} <span className="req">*</span>
                  </label>
                  <select
                    className="form-control form-select"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="सदस्यता संबंधी प्रश्न">
                      {isHindi ? 'सदस्यता पंजीकरण संबंधी प्रश्न' : 'Membership Registration Inquiry'}
                    </option>
                    <option value="सहयोग अपील सत्यापन">
                      {isHindi ? 'सहयोग अपील सत्यापन व DBT प्रश्न' : 'Relief Appeal & DBT Inquiries'}
                    </option>
                    <option value="कन्यादान योजना">
                      {isHindi ? 'कन्यादान योजना महाभियान' : 'Kanyadaan Marriage Scheme'}
                    </option>
                    <option value="अन्य शिकायत अथवा सुझाव">
                      {isHindi ? 'अन्य शिकायत अथवा सुझाव' : 'General Grievance or Suggestion'}
                    </option>
                  </select>
                  {fieldErrors.subject && (
                    <span
                      style={{
                        color: '#dc2626',
                        fontSize: '12px',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <AlertCircle size={12} /> {fieldErrors.subject[0]}
                    </span>
                  )}
                </div>

                {/* Message Textarea */}
                <div className="form-group">
                  <label className="form-label">
                    {isHindi ? 'विस्तृत संदेश:' : 'Message / Details:'} <span className="req">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="form-control"
                    style={fieldErrors.message ? { borderColor: '#ef4444' } : {}}
                    placeholder={isHindi ? 'अपनी बात विस्तार से लिखें...' : 'Type your detailed inquiry or feedback here...'}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value })
                      if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: null })
                    }}
                  />
                  {fieldErrors.message && (
                    <span
                      style={{
                        color: '#dc2626',
                        fontSize: '12px',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <AlertCircle size={12} /> {fieldErrors.message[0]}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="button button-gold"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: submitting ? 0.75 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>{isHindi ? 'संदेश प्रेषित हो रहा है...' : 'Sending Message...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>{isHindi ? 'संदेश प्रेषित करें' : 'Send Message'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
