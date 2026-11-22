import { 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  FileCheck, 
  FileText, 
  Gift, 
  HeartHandshake, 
  Hospital, 
  MapPin, 
  Printer, 
  ShieldAlert, 
  Stethoscope, 
  Upload, 
  User, 
  Users 
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '../../config/routes'
import { siteConfig } from '../../config/site'
import { upDistricts } from '../../data/districts'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Applications() {
  const { isHindi } = useLanguage()
  const [activeTab, setActiveTab] = useState('death') // 'death', 'kanyadaan', 'medical'
  const [submittedApp, setSubmittedApp] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Form states
  const [formData, setFormData] = useState({
    memberId: '',
    applicantName: '',
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
    groomAddress: '',
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

    agreeTerms: true
  })

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.memberId.trim()) {
      setErrorMsg(isHindi ? 'कृपया पंजीकृत सदस्य आईडी दर्ज करें!' : 'Please enter registered Member ID!')
      return
    }

    if (activeTab === 'death') {
      if (!formData.deceasedName.trim() || !formData.dateOfDemise || !formData.nomineeAccount) {
        setErrorMsg(isHindi ? 'कृपया दिवंगत सदस्य का नाम, निधन की तिथि और नॉमिनी का बैंक खाता भरें!' : 'Please fill deceased member name, date of demise, and nominee bank account!')
        return
      }
    } else if (activeTab === 'kanyadaan') {
      if (!formData.daughterName.trim() || !formData.groomName.trim() || !formData.weddingDate) {
        setErrorMsg(isHindi ? 'कृपया सुपुत्री का नाम, वर का नाम एवं विवाह की तिथि दर्ज करें!' : 'Please enter daughter name, groom name, and wedding date!')
        return
      }
    } else if (activeTab === 'medical') {
      if (!formData.patientName.trim() || !formData.hospitalName.trim()) {
        setErrorMsg(isHindi ? 'कृपया मरीज का नाम और अस्पताल का नाम भरें!' : 'Please enter patient name and hospital name!')
        return
      }
    }

    const appPrefix = activeTab === 'death' ? 'DTH' : activeTab === 'kanyadaan' ? 'KNY' : 'MED'
    const appId = `APP-2025-${appPrefix}-${Math.floor(1000 + Math.random() * 9000)}`

    const newApp = {
      appId,
      type: activeTab,
      typeName: activeTab === 'death' 
        ? (isHindi ? 'दिवंगत सदस्य आश्रित सहायता आवेदन' : 'Untimely Demise Financial Relief Application') 
        : activeTab === 'kanyadaan' 
          ? (isHindi ? 'कन्यादान योजना महाभियान आवेदन' : 'Kanyadaan Daughter Marriage Grant Application') 
          : (isHindi ? 'संजीवनी चिकित्सा सहायता आवेदन' : 'Sanjeevani Medical Treatment Aid Application'),
      date: new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN'),
      memberId: formData.memberId,
      applicantName: formData.applicantName || formData.nomineeName || (isHindi ? 'आवेदक' : 'Applicant'),
      district: upDistricts.find((d) => d.id === formData.district)?.hindiName || 'लखनऊ',
      status: isHindi ? 'प्राप्त (Submitted) - जिला टीम स्थलीय जांच हेतु अग्रेषित' : 'Submitted - Forwarded to District Team for Verification',
      formData: { ...formData }
    }

    setSubmittedApp(newApp)
  }

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <div className="section-header" style={{ marginBottom: '28px' }}>
          <span className="section-eyebrow">
            <HeartHandshake size={16} /> {isHindi ? 'जनकल्याणकारी सहायता प्रपत्र' : 'Social Welfare Assistance Application'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'पारस्परिक कल्याण सहायता ऑनलाइन आवेदन' : 'Mutual Welfare Relief Online Application'}
          </h1>
          <p className="section-subtitle">
            {isHindi 
              ? 'संस्था की नियमावली अनुसार दिवंगत साथी सहायता, कन्यादान महाभियान अथवा आपातकालीन चिकित्सा सहायता हेतु आवेदन प्रस्तुत करें।'
              : 'Submit official application for Demise Relief, Kanyadaan Marriage Grant, or Sanjeevani Medical Aid as per Trust By-Laws.'}
          </p>
        </div>

        {submittedApp ? (
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

            <div style={{ background: '#f8fafc', border: '2px dashed #b45309', borderRadius: '12px', padding: '18px', display: 'inline-block', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{isHindi ? 'आवेदन संख्या (Application ID):' : 'Application Reference ID:'}</span>
                <strong style={{ color: '#b45309', fontFamily: 'monospace', fontSize: '16px' }}>{submittedApp.appId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{isHindi ? 'आवेदन का प्रकार:' : 'Scheme Type:'}</span>
                <strong style={{ fontSize: '13px' }}>{submittedApp.typeName}</strong>
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
        ) : (
          <div className="form-card">
            {/* Scheme Tab Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: '#f1f5f9', padding: 6, borderRadius: 12, marginBottom: 28 }}>
              <button
                type="button"
                onClick={() => { setActiveTab('death'); setErrorMsg(''); }}
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
                onClick={() => { setActiveTab('kanyadaan'); setErrorMsg(''); }}
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
                onClick={() => { setActiveTab('medical'); setErrorMsg(''); }}
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
              <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={16} /> {errorMsg}
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
                      onChange={(e) => handleChange('memberId', e.target.value)}
                    />
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
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'आईएफएससी कोड (IFSC):' : 'IFSC Code:'} <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="SBIN0001234"
                        value={formData.nomineeIfsc}
                        onChange={(e) => handleChange('nomineeIfsc', e.target.value.toUpperCase())}
                      />
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
                    </div>

                    <div className="form-group">
                      <label className="form-label">{isHindi ? 'अनुमानित उपचार खर्च (₹ Estimated Cost):' : 'Estimated Treatment Cost (₹):'} <span className="req">*</span></label>
                      <input
                        type="number"
                        required
                        className="form-control"
                        placeholder="500000"
                        value={formData.estimatedCost}
                        onChange={(e) => handleChange('estimatedCost', e.target.value)}
                      />
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

              {/* Uploads simulation notice */}
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '12px', color: '#475569' }}>
                <Upload size={20} style={{ color: '#b45309', flexShrink: 0 }} />
                <span>
                  <strong>{isHindi ? 'दस्तावेज सत्यापन: ' : 'Document Verification: '}</strong>
                  {isHindi
                    ? 'आवेदन सबमिट करने के उपरांत जिला सत्यापन अधिकारी द्वारा आपसे भौतिक प्रपत्र (प्रमाण पत्र / कार्ड / बिल) का मिलान किया जाएगा।'
                    : 'Following submission, the District Verification Officer will verify original certificates, cards, and medical invoices.'}
                </span>
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
              </div>

              <button
                type="submit"
                className="button button-gold button-large"
                style={{ width: '100%' }}
              >
                <CheckCircle2 size={18} /> {isHindi ? 'ऑनलाइन सहायता आवेदन सबमिट करें' : 'Submit Welfare Application Online'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
