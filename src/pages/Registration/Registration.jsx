import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Building, 
  CheckCircle2, 
  CreditCard, 
  Download, 
  FileText, 
  HeartHandshake, 
  Loader2,
  Lock, 
  MapPin, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Upload, 
  User, 
  UserPlus, 
  Users 
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authService } from '../../api'
import DigitalIdCard from '../../components/common/DigitalIdCard'
import { routes } from '../../config/routes'
import { siteConfig } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import { statesAndUnionTerritories, upDistricts } from '../../data/districts'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Registration() {
  const { isHindi } = useLanguage()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')?.toUpperCase()
  const validCategories = ['A', 'B', 'C', 'D']
  const initialCategory = validCategories.includes(categoryParam) ? categoryParam : 'A'

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    fatherHusbandName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'B+',
    aadhaarNumber: '',
    mobileNumber: '',
    alternateMobile: '',
    email: '',

    // Step 2: Category & Occupation
    category: initialCategory,
    departmentName: '',
    designation: '',
    employeeOrRegId: '',

    // Step 3: Location & Address
    state: 'Uttar Pradesh',
    district: 'lucknow',
    districtName: 'लखनऊ (Lucknow)',
    block: 'सरोजनी नगर',
    villageWard: '',
    fullAddress: '',
    pincode: '',

    // Step 4: Nominee Details
    nomineeName: '',
    nomineeRelation: 'Wife',
    nomineeAge: '',
    nomineeAadhaar: '',
    nomineeMobile: '',

    // Step 5: Bank Details
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    branchName: '',

    // Step 6: Password & Security
    password: '',
    confirmPassword: '',
    securityPin: '',
    agreeTerms: true,
  })

  const [photoPreview, setPhotoPreview] = useState(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  )
  const [photoFile, setPhotoFile] = useState(null)
  const [registeredMember, setRegisteredMember] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showIdCardModal, setShowIdCardModal] = useState(false)
  const [stepConfirmed, setStepConfirmed] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  })

  useEffect(() => {
    const cat = searchParams.get('category')?.toUpperCase()
    if (cat && ['A', 'B', 'C', 'D'].includes(cat)) {
      setFormData((prev) => ({ ...prev, category: cat }))
    }
  }, [searchParams])

  // Handle district selection and populate blocks
  const selectedDistrictObj = upDistricts.find((d) => d.id === formData.district) || upDistricts[0]

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'district') {
        const dObj = upDistricts.find((d) => d.id === value)
        if (dObj) {
          updated.districtName = `${dObj.hindiName} (${dObj.name})`
          updated.block = dObj.blocks[0] || 'सदर'
        }
      }
      return updated
    })
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg(isHindi ? 'फोटो का आकार 2MB से कम होना चाहिए।' : 'Photo size must be less than 2MB.')
        return
      }
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
      setErrorMsg('')
    }
  }

  const validateStep = (step) => {
    setErrorMsg('')
    if (step === 1) {
      if (!formData.fullName.trim()) return isHindi ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.'
      if (!formData.fatherHusbandName.trim())
        return isHindi ? 'कृपया पिता या पति का नाम दर्ज करें।' : 'Please enter Father / Husband name.'
      if (!formData.dob) return isHindi ? 'कृपया जन्म तिथि दर्ज करें।' : 'Please enter Date of Birth.'
      if (formData.aadhaarNumber.replace(/\D/g, '').length !== 12)
        return isHindi ? 'कृपया 12 अंकों का वैध आधार नंबर दर्ज करें।' : 'Please enter a valid 12-digit Aadhaar number.'
      if (formData.mobileNumber.replace(/\D/g, '').length !== 10)
        return isHindi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.'
    } else if (step === 2) {
      if (!formData.category) return isHindi ? 'कृपया संवर्ग का चयन करें।' : 'Please select a membership category.'
      if (!formData.designation.trim())
        return isHindi ? 'कृपया पदनाम या पेशा दर्ज करें।' : 'Please enter designation or occupation.'
    } else if (step === 3) {
      if (!formData.fullAddress.trim())
        return isHindi ? 'कृपया स्थायी पता दर्ज करें।' : 'Please enter full permanent address.'
      if (formData.pincode.replace(/\D/g, '').length !== 6)
        return isHindi ? 'कृपया 6 अंकों का पिनकोड दर्ज करें।' : 'Please enter a valid 6-digit Pincode.'
    } else if (step === 4) {
      if (!formData.nomineeName.trim())
        return isHindi ? 'कृपया नॉमिनी का पूरा नाम दर्ज करें।' : 'Please enter nominee full name.'
      if (!formData.nomineeRelation) return isHindi ? 'कृपया नॉमिनी से संबंध चुनें।' : 'Please select relationship with nominee.'
      const ageNum = parseInt(formData.nomineeAge, 10)
      if (!formData.nomineeAge || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        return isHindi ? 'कृपया नॉमिनी की वैध आयु (1 से 120 वर्ष) दर्ज करें।' : 'Please enter a valid nominee age (1 to 120 years).'
      }
    } else if (step === 5) {
      if (formData.accountNumber && formData.accountNumber !== formData.confirmAccountNumber) {
        return isHindi ? 'खाता संख्या और पुष्टि खाता संख्या मेल नहीं खाते!' : 'Bank Account numbers do not match!'
      }
    } else if (step === 6) {
      if (!formData.password || formData.password.length < 6)
        return isHindi ? 'पासवर्ड न्यूनतम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.'
      if (formData.password !== formData.confirmPassword)
        return isHindi ? 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.'
      if (!formData.agreeTerms)
        return isHindi ? 'पंजीकरण हेतु संस्था के नियमों व शर्तों की स्वीकृति अनिवार्य है।' : 'Acceptance of trust rules and terms is required.'
    }
    if (!stepConfirmed[step]) {
      return isHindi
        ? 'आगे बढ़ने से पहले कृपया पुष्टि चेकबॉक्स पर टिक करें कि दी गई जानकारी सही है।'
        : 'Please tick the confirmation box to verify that the given information is correct before proceeding.'
    }
    return ''
  }

  const handleNext = () => {
    const err = validateStep(currentStep)
    if (err) {
      setErrorMsg(err)
      return
    }
    setCurrentStep((prev) => prev + 1)
    window.scrollTo({ top: 180, behavior: 'smooth' })
  }

  const handlePrev = () => {
    setErrorMsg('')
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const err = validateStep(6)
    if (err) {
      setErrorMsg(err)
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    setFieldErrors({})

    try {
      const payload = new FormData()
      payload.append('name', formData.fullName.trim())
      payload.append('father_husband_name', formData.fatherHusbandName.trim())
      payload.append('dob', formData.dob)
      payload.append('gender', formData.gender)
      if (formData.bloodGroup) payload.append('blood_group', formData.bloodGroup)
      payload.append('aadhaar_number', formData.aadhaarNumber.replace(/\D/g, ''))
      payload.append('phone', formData.mobileNumber.replace(/\D/g, ''))
      if (formData.alternateMobile) {
        const alt = formData.alternateMobile.replace(/\D/g, '')
        if (alt) payload.append('alternate_mobile', alt)
      }
      if (formData.email && formData.email.trim()) {
        payload.append('email', formData.email.trim())
      }

      payload.append('category', formData.category)
      if (formData.departmentName && formData.departmentName.trim()) {
        payload.append('department_name', formData.departmentName.trim())
      }
      payload.append('designation', formData.designation.trim())
      if (formData.employeeOrRegId && formData.employeeOrRegId.trim()) {
        payload.append('employee_or_reg_id', formData.employeeOrRegId.trim())
      }

      const cleanState = formData.state.includes('(') ? formData.state.split('(')[0].trim() : formData.state.trim()
      const cleanDistrict = selectedDistrictObj ? selectedDistrictObj.name : 'Lucknow'
      payload.append('state', cleanState)
      payload.append('district', cleanDistrict)
      payload.append('block', formData.block.trim())
      if (formData.villageWard && formData.villageWard.trim()) {
        payload.append('village_ward', formData.villageWard.trim())
      }
      payload.append('pincode', formData.pincode.replace(/\D/g, ''))
      payload.append('full_address', formData.fullAddress.trim())

      payload.append('nominee_name', formData.nomineeName.trim())
      payload.append('nominee_relation', formData.nomineeRelation)
      payload.append('nominee_age', String(parseInt(formData.nomineeAge, 10)))
      if (formData.nomineeAadhaar) {
        const nomAadhaar = formData.nomineeAadhaar.replace(/\D/g, '')
        if (nomAadhaar) payload.append('nominee_aadhaar', nomAadhaar)
      }
      if (formData.nomineeMobile) {
        const nomMobile = formData.nomineeMobile.replace(/\D/g, '')
        if (nomMobile) payload.append('nominee_mobile', nomMobile)
      }

      if (formData.accountNumber && formData.accountNumber.trim()) {
        if (formData.accountHolderName && formData.accountHolderName.trim()) {
          payload.append('account_holder_name', formData.accountHolderName.trim())
        }
        if (formData.bankName && formData.bankName.trim()) {
          payload.append('bank_name', formData.bankName.trim())
        }
        payload.append('account_number', formData.accountNumber.trim())
        payload.append('confirmAccountNumber', (formData.confirmAccountNumber || formData.accountNumber).trim())
        if (formData.ifscCode && formData.ifscCode.trim()) {
          payload.append('ifsc_code', formData.ifscCode.trim().toUpperCase().slice(0, 11))
        }
        if (formData.branchName && formData.branchName.trim()) {
          payload.append('branch_name', formData.branchName.trim())
        }
      }

      payload.append('password', formData.password)
      payload.append('confirmPassword', formData.confirmPassword)
      if (formData.securityPin) {
        const pin = formData.securityPin.replace(/\D/g, '')
        if (pin) payload.append('security_pin', pin)
      }
      payload.append('agree_terms', '1')

      if (photoFile) {
        payload.append('image', photoFile)
      }

      const res = await authService.registerMember(payload)
      const data = res.data || {}
      const token = data.token
      const user = data.user || {}
      const memberCode = user.member_code || user.membership?.member_code || `NSCT-${new Date().getFullYear()}-MEMBER`

      // Auto login if token & user are present
      if (token && user) {
        login(token, user)
      }

      const memberObj = {
        id: memberCode,
        name: user.name || formData.fullName,
        fatherHusband: user.profile?.father_husband_name || formData.fatherHusbandName,
        category: user.profile?.category || formData.category,
        categoryName: `संवर्ग ${user.profile?.category || formData.category}`,
        designation: user.profile?.designation || formData.designation,
        district: user.profile?.district || cleanDistrict,
        block: user.profile?.block || formData.block,
        mobile: user.phone || formData.mobileNumber,
        aadhaar: `XXXX-XXXX-${formData.aadhaarNumber.slice(-4)}`,
        bloodGroup: user.profile?.blood_group || formData.bloodGroup,
        joinDate: user.membership?.joined_at || new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN'),
        status: isHindi ? 'सत्यापित सक्रिय सदस्य (Active)' : 'Verified Active Member',
        nomineeName: user.profile?.nominee_name || formData.nomineeName,
        nomineeRelation: user.profile?.nominee_relation || formData.nomineeRelation,
        avatar: photoPreview,
      }

      setRegisteredMember(memberObj)
      setShowIdCardModal(true)
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors)
        const firstKey = Object.keys(err.errors)[0]
        const firstMsg = err.errors[firstKey]?.[0]
        setErrorMsg(firstMsg || (isHindi ? 'कृपया फ़ॉर्म में दी गई त्रुटियों को सुधारें।' : 'Please correct the errors in the form.'))

        // Jump to appropriate step where the error is located
        if (['name', 'father_husband_name', 'dob', 'gender', 'blood_group', 'aadhaar_number', 'phone', 'alternate_mobile', 'email'].includes(firstKey)) {
          setCurrentStep(1)
        } else if (['category', 'department_name', 'designation', 'employee_or_reg_id'].includes(firstKey)) {
          setCurrentStep(2)
        } else if (['state', 'district', 'block', 'village_ward', 'pincode', 'full_address'].includes(firstKey)) {
          setCurrentStep(3)
        } else if (['nominee_name', 'nominee_relation', 'nominee_age', 'nominee_aadhaar', 'nominee_mobile'].includes(firstKey)) {
          setCurrentStep(4)
        } else if (['account_holder_name', 'bank_name', 'account_number', 'account_number_confirmation', 'ifsc_code', 'branch_name'].includes(firstKey)) {
          setCurrentStep(5)
        } else if (['password', 'security_pin', 'agree_terms', 'image'].includes(firstKey)) {
          setCurrentStep(6)
        }
      } else {
        setErrorMsg(err.message || (isHindi ? 'पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।' : 'Registration failed. Please try again.'))
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
      <div className="container" style={{ maxWidth: '920px' }}>
        <div className="section-header" style={{ marginBottom: '28px' }}>
          <span className="section-eyebrow">
            <UserPlus size={16} /> {isHindi ? 'राष्ट्रीय सेल्फ केयर टीम सदस्यता पोर्टल' : 'National Self Care Team Membership Portal'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'नया सदस्य ऑनलाइन पंजीकरण फॉर्म' : 'New Member Online Registration Form'}
          </h1>
          <p className="section-subtitle">
            {isHindi
              ? 'उत्तर प्रदेश एवं भारत भर के नागरिकों हेतु आधिकारिक सदस्यता प्रपत्र (संवर्ग A, B, C, D) • पंजीकरण के तुरंत बाद आधिकारिक डिजिटल पहचान पत्र प्राप्त करें।'
              : 'Official Membership Form for Citizens of Uttar Pradesh & Across India (Category A, B, C, D) • Download Official Digital Smart ID Card immediately upon registration.'}
          </p>
        </div>

        {registeredMember ? (
          <div className="form-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 18px',
              }}
            >
              <CheckCircle2 size={42} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#047857', marginBottom: '8px' }}>
              {isHindi ? 'बधाई हो! सदस्यता पंजीकरण सफलतापूर्वक संपन्न हुआ' : 'Congratulations! Membership Registration Successful'}
            </h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '22px' }}>
              {isHindi
                ? `आप ${siteConfig.hindiName} के अधिकृत सदस्य बन चुके हैं। आपकी सदस्यता आईडी नीचे दी गई है:`
                : `You are now an authorized member of ${siteConfig.name}. Your official Member ID is given below:`}
            </p>

            <div
              style={{
                background: '#fef3c7',
                border: '2px dashed #b45309',
                borderRadius: '12px',
                padding: '16px',
                display: 'inline-block',
                marginBottom: '28px',
              }}
            >
              <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 700, display: 'block' }}>
                {isHindi ? 'आपकी स्थायी सदस्यता आईडी (Member ID)' : 'Your Permanent Member ID'}
              </span>
              <strong style={{ fontSize: '24px', color: '#0c2340', fontFamily: 'monospace' }}>
                {registeredMember.id}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14 }}>
              <button
                type="button"
                className="button button-gold button-large"
                onClick={() => setShowIdCardModal(true)}
              >
                <Printer size={18} /> {isHindi ? 'डिजिटल पहचान पत्र (ID Card) डाउनलोड करें' : 'Download Digital ID Card'}
              </button>
              <Link to={routes.dashboard} className="button button-primary button-large">
                {isHindi ? 'सदस्य डैशबोर्ड पर जाएं' : 'Go to Member Dashboard'}
              </Link>
              <Link to={routes.home} className="button button-outline button-large">
                {isHindi ? 'मुख्य पृष्ठ पर जाएं' : 'Return to Home'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="form-card">
            {/* Step Indicators */}
            <div className="form-step-nav">
              {[
                { step: 1, title: isHindi ? 'व्यक्तिगत विवरण' : 'Personal Info' },
                { step: 2, title: isHindi ? 'संवर्ग व पेशा' : 'Category & Work' },
                { step: 3, title: isHindi ? 'स्थान व पता' : 'Address Details' },
                { step: 4, title: isHindi ? 'नॉमिनी विवरण' : 'Nominee Info' },
                { step: 5, title: isHindi ? 'बैंक खाता' : 'Bank Account' },
                { step: 6, title: isHindi ? 'सुरक्षा व सत्यापन' : 'Security & Pin' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`form-step-btn ${currentStep === s.step ? 'active' : ''} ${currentStep > s.step ? 'completed' : ''}`}
                >
                  <span className="step-num-bubble">{currentStep > s.step ? '✓' : s.step}</span>
                  <span>{s.title}</span>
                </div>
              ))}
            </div>

            {errorMsg && (
              <div
                style={{
                  background: '#fee2e2',
                  border: '1px solid #f87171',
                  color: '#b91c1c',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Personal Details */}
            {currentStep === 1 && (
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0c2340',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <User size={20} style={{ color: '#b45309' }} />{' '}
                  {isHindi ? 'चरण 1: आवेदक का व्यक्तिगत विवरण (Personal Details)' : 'Step 1: Applicant Personal Details'}
                </h3>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'पूरा नाम (Full Name As Per Aadhaar):' : 'Full Name (As Per Aadhaar):'} <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={fieldErrors.name ? { borderColor: '#ef4444' } : {}}
                      placeholder={isHindi ? 'उदा. राजेश कुमार वर्मा' : 'e.g. Rajesh Kumar Verma'}
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                    />
                    {fieldErrors.name && (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.name[0]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'पिता / पति का नाम (Father / Husband Name):' : 'Father / Husband Name:'} <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={fieldErrors.father_husband_name ? { borderColor: '#ef4444' } : {}}
                      placeholder={isHindi ? 'उदा. श्री बाबूलाल वर्मा' : 'e.g. Babulal Verma'}
                      value={formData.fatherHusbandName}
                      onChange={(e) => handleChange('fatherHusbandName', e.target.value)}
                    />
                    {fieldErrors.father_husband_name && (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.father_husband_name[0]}</span>
                    )}
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'जन्म तिथि (DOB):' : 'Date of Birth (DOB):'} <span className="req">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      style={fieldErrors.dob ? { borderColor: '#ef4444' } : {}}
                      value={formData.dob}
                      onChange={(e) => handleChange('dob', e.target.value)}
                    />
                    {fieldErrors.dob && (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.dob[0]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'लिंग (Gender):' : 'Gender:'} <span className="req">*</span>
                    </label>
                    <select
                      className="form-control form-select"
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                    >
                      <option value="Male">{isHindi ? 'पुरुष (Male)' : 'Male (पुरुष)'}</option>
                      <option value="Female">{isHindi ? 'महिला (Female)' : 'Female (महिला)'}</option>
                      <option value="Other">{isHindi ? 'अन्य (Other)' : 'Other (अन्य)'}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'रक्त समूह (Blood Group):' : 'Blood Group:'}</label>
                    <select
                      className="form-control form-select"
                      value={formData.bloodGroup}
                      onChange={(e) => handleChange('bloodGroup', e.target.value)}
                    >
                      {['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'आधार कार्ड संख्या (12 Digit Aadhaar):' : 'Aadhaar Card Number (12 Digits):'} <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      className="form-control"
                      style={fieldErrors.aadhaar_number ? { borderColor: '#ef4444' } : {}}
                      placeholder="1234 5678 9012"
                      value={formData.aadhaarNumber}
                      onChange={(e) => handleChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                    />
                    {fieldErrors.aadhaar_number ? (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.aadhaar_number[0]}</span>
                    ) : (
                      <span className="form-hint">
                        {isHindi ? 'आधार संख्या गोपनीय रहेगी तथा अंतिम 4 अंक ही प्रदर्शित होंगे।' : 'Aadhaar stays fully confidential; only last 4 digits are shown on public ID.'}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'मोबाइल नंबर (10 Digit Mobile - यही लॉगिन आईडी होगी):' : 'Mobile Number (10 Digits - Primary Login ID):'}{' '}
                      <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      className="form-control"
                      style={fieldErrors.phone ? { borderColor: '#ef4444' } : {}}
                      placeholder="9876543210"
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                    />
                    {fieldErrors.phone ? (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.phone[0]}</span>
                    ) : (
                      <span className="form-hint">
                        {isHindi ? 'भविष्य में लॉगिन एवं SMS सूचनाओं हेतु सक्रिय नंबर दें।' : 'Provide an active number for login and SMS notifications.'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'ईमेल आईडी (Email ID):' : 'Email Address:'}</label>
                    <input
                      type="email"
                      className="form-control"
                      style={fieldErrors.email ? { borderColor: '#ef4444' } : {}}
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                    {fieldErrors.email && (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.email[0]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'वैकल्पिक / व्हाट्सएप नंबर (WhatsApp Number):' : 'Alternative / WhatsApp Number:'}</label>
                    <input
                      type="tel"
                      maxLength={10}
                      className="form-control"
                      placeholder={isHindi ? 'वैकल्पिक नंबर' : 'Optional Number'}
                      value={formData.alternateMobile}
                      onChange={(e) => handleChange('alternateMobile', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Category & Profession */}
            {currentStep === 2 && (
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0c2340',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Building size={20} style={{ color: '#b45309' }} />{' '}
                  {isHindi ? 'चरण 2: संवर्ग एवं कार्यक्षेत्र का विवरण (Category & Profession)' : 'Step 2: Category & Profession'}
                </h3>

                <div className="form-group">
                  <label className="form-label">
                    {isHindi ? 'सदस्यता संवर्ग चुनिए (Select Category):' : 'Select Membership Category:'} <span className="req">*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {[
                      { id: 'A', name: 'संवर्ग A (Government)', desc: isHindi ? 'सरकारी व संविदा कर्मचारी' : 'Govt & Contractual Staff' },
                      { id: 'B', name: 'संवर्ग B (Private)', desc: isHindi ? 'प्राइवेट शिक्षक व कॉर्पोरेट कर्मी' : 'Private Teachers & Corporate' },
                      { id: 'C', name: 'संवर्ग C (Professional)', desc: isHindi ? 'डॉक्टर, वकील, सीए, व्यापारी' : 'Doctors, Advocates, CAs' },
                      { id: 'D', name: 'संवर्ग D (Others)', desc: isHindi ? 'किसान, गृहणी व आम नागरिक' : 'Farmers, Homemakers & Citizens' },
                    ].map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => handleChange('category', cat.id)}
                        style={{
                          border: formData.category === cat.id ? '2px solid #b45309' : '1px solid #cbd5e1',
                          background: formData.category === cat.id ? '#fef3c7' : '#ffffff',
                          borderRadius: '10px',
                          padding: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <strong style={{ fontSize: '14px', color: '#0c2340', display: 'block' }}>{cat.name}</strong>
                        <small style={{ color: '#64748b', fontSize: '11.5px' }}>{cat.desc}</small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'विभाग / विद्यालय / कंपनी / फर्म का नाम:' : 'Department / School / Firm / Employer Name:'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isHindi ? 'उदा. बेसिक शिक्षा परिषद / अपोलो अस्पताल / स्वयं का व्यवसाय' : 'e.g. Basic Education Dept / Private Firm'}
                      value={formData.departmentName}
                      onChange={(e) => handleChange('departmentName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'पदनाम / पेशा (Designation / Occupation):' : 'Designation / Occupation:'} <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={fieldErrors.designation ? { borderColor: '#ef4444' } : {}}
                      placeholder={isHindi ? 'उदा. सहायक अध्यापक / प्रबंधक / अधिवक्ता / कृषक' : 'e.g. Assistant Teacher / Manager / Advocate'}
                      value={formData.designation}
                      onChange={(e) => handleChange('designation', e.target.value)}
                    />
                    {fieldErrors.designation && (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.designation[0]}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {isHindi
                      ? 'कर्मचारी कोड / बार काउंसिल / रजिस्ट्रेशन संख्या (यदि उपलब्ध हो):'
                      : 'Employee ID / Bar Council / Reg No (If available):'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={isHindi ? 'वैकल्पिक पहचान संख्या' : 'Optional ID number'}
                    value={formData.employeeOrRegId}
                    onChange={(e) => handleChange('employeeOrRegId', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Location & Address */}
            {currentStep === 3 && (
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0c2340',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <MapPin size={20} style={{ color: '#b45309' }} />{' '}
                  {isHindi ? 'चरण 3: निवास स्थान एवं जनपद विवरण (Address Details)' : 'Step 3: Residential Address & District Details'}
                </h3>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'राज्य (State):' : 'State:'} <span className="req">*</span></label>
                    <select
                      className="form-control form-select"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                    >
                      {statesAndUnionTerritories.map((st) => {
                        const cleanSt = st.includes('(') ? st.split('(')[0].trim() : st
                        return (
                          <option key={st} value={cleanSt}>
                            {st}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'जनपद (District - समस्त 75 जिले):' : 'District (All 75 Districts):'} <span className="req">*</span></label>
                    <select
                      className="form-control form-select"
                      value={formData.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                    >
                      {upDistricts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.hindiName} ({d.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'तहसील / ब्लॉक (Block/Tehsil):' : 'Block / Tehsil:'} <span className="req">*</span></label>
                    <select
                      className="form-control form-select"
                      value={formData.block}
                      onChange={(e) => handleChange('block', e.target.value)}
                    >
                      {selectedDistrictObj.blocks.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'ग्राम / मोहल्ला / वार्ड (Village/Ward):' : 'Village / Ward / Locality:'}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isHindi ? 'उदा. शांति नगर / ग्राम बरौली' : 'e.g. Shanti Nagar'}
                      value={formData.villageWard}
                      onChange={(e) => handleChange('villageWard', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'पिनकोड (6 Digit Pincode):' : 'Pincode (6 Digits):'} <span className="req">*</span></label>
                    <input
                      type="text"
                      maxLength={6}
                      className="form-control"
                      style={fieldErrors.pincode ? { borderColor: '#ef4444' } : {}}
                      placeholder="226010"
                      value={formData.pincode}
                      onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                    />
                    {fieldErrors.pincode && (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.pincode[0]}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{isHindi ? 'स्थायी पूरा पता (Full Address):' : 'Full Permanent Address:'} <span className="req">*</span></label>
                  <textarea
                    rows={3}
                    className="form-control"
                    style={fieldErrors.full_address ? { borderColor: '#ef4444' } : {}}
                    placeholder={isHindi ? 'मकान नंबर, गली/सड़क का नाम, लैंडमार्क आदि' : 'House No., Street name, Landmark, etc.'}
                    value={formData.fullAddress}
                    onChange={(e) => handleChange('fullAddress', e.target.value)}
                  />
                  {fieldErrors.full_address && (
                    <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.full_address[0]}</span>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Nominee Details */}
            {currentStep === 4 && (
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0c2340',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Users size={20} style={{ color: '#b45309' }} />{' '}
                  {isHindi ? 'चरण 4: नामांकित नॉमिनी विवरण (Nominee Details - अत्यंत महत्वपूर्ण)' : 'Step 4: Nominee Information (Critical)'}
                </h3>

                <div
                  style={{
                    background: '#fef3c7',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#92400e',
                    marginBottom: '18px',
                    lineHeight: 1.6,
                  }}
                >
                  <strong>{isHindi ? 'महत्वपूर्ण निर्देश:' : 'Important Notice:'}</strong>{' '}
                  {isHindi
                    ? 'किसी भी आकस्मिक विपत्ति या निधन की स्थिति में संस्था की ओर से समस्त प्रत्यक्ष आर्थिक संबल इसी नामांकित नॉमिनी के बैंक खाते में भेजा जाएगा। कृपया विवरण सावधानीपूर्वक भरें।'
                    : "In the unforeseen event of untimely demise, all direct mutual relief will be transferred directly to this registered nominee's bank account. Please provide precise details."}
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'नॉमिनी का पूरा नाम (Nominee Full Name):' : 'Nominee Full Name:'} <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={fieldErrors.nominee_name ? { borderColor: '#ef4444' } : {}}
                      placeholder={isHindi ? 'उदा. श्रीमती सुनीता वर्मा' : 'e.g. Mrs. Sunita Verma'}
                      value={formData.nomineeName}
                      onChange={(e) => handleChange('nomineeName', e.target.value)}
                    />
                    {fieldErrors.nominee_name && (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.nominee_name[0]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'नॉमिनी से संबंध (Relationship):' : 'Relationship:'} <span className="req">*</span>
                    </label>
                    <select
                      className="form-control form-select"
                      value={formData.nomineeRelation}
                      onChange={(e) => handleChange('nomineeRelation', e.target.value)}
                    >
                      <option value="Wife">{isHindi ? 'पत्नी (Wife)' : 'Wife (पत्नी)'}</option>
                      <option value="Husband">{isHindi ? 'पति (Husband)' : 'Husband (पति)'}</option>
                      <option value="Son">{isHindi ? 'पुत्र (Son)' : 'Son (पुत्र)'}</option>
                      <option value="Daughter">{isHindi ? 'पुत्री (Daughter)' : 'Daughter (पुत्री)'}</option>
                      <option value="Mother">{isHindi ? 'माता (Mother)' : 'Mother (माता)'}</option>
                      <option value="Father">{isHindi ? 'पिता (Father)' : 'Father (पिता)'}</option>
                      <option value="Other">{isHindi ? 'अन्य (Other)' : 'Other (अन्य)'}</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'नॉमिनी की आयु (Nominee Age):' : 'Nominee Age:'} <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      className="form-control"
                      style={fieldErrors.nominee_age ? { borderColor: '#ef4444' } : {}}
                      placeholder="34"
                      value={formData.nomineeAge}
                      onChange={(e) => handleChange('nomineeAge', e.target.value)}
                    />
                    {fieldErrors.nominee_age && (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.nominee_age[0]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'नॉमिनी का आधार नंबर (वैकल्पिक):' : 'Nominee Aadhaar (Optional):'}</label>
                    <input
                      type="text"
                      maxLength={12}
                      className="form-control"
                      placeholder="1234 5678 9012"
                      value={formData.nomineeAadhaar}
                      onChange={(e) => handleChange('nomineeAadhaar', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'नॉमिनी का संपर्क मोबाइल:' : 'Nominee Contact Mobile:'}</label>
                    <input
                      type="tel"
                      maxLength={10}
                      className="form-control"
                      placeholder="9876543210"
                      value={formData.nomineeMobile}
                      onChange={(e) => handleChange('nomineeMobile', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Bank Details */}
            {currentStep === 5 && (
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0c2340',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CreditCard size={20} style={{ color: '#b45309' }} />{' '}
                  {isHindi ? 'चरण 5: बैंक खाता विवरण (Direct Benefit Bank Details)' : 'Step 5: Direct Benefit Bank Details'}
                </h3>

                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                  {isHindi
                    ? 'कन्यादान योजना, चिकित्सा सहायता अथवा आपात सहयोग सीधे बैंक खाते में प्रेषित करने हेतु बैंक विवरण दें (आवेदक अथवा नॉमिनी का खाता)।'
                    : 'Provide bank account details for direct transfer of Kanyadaan grants, medical relief, or emergency bereavement aid.'}
                </p>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'खाता धारक का नाम (Account Holder Name):' : 'Account Holder Name:'}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isHindi ? 'पासबुक अनुसार नाम' : 'Name as per Bank Passbook'}
                      value={formData.accountHolderName}
                      onChange={(e) => handleChange('accountHolderName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'बैंक का नाम (Bank Name):' : 'Bank Name:'}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isHindi ? 'उदा. भारतीय स्टेट बैंक (SBI)' : 'e.g. State Bank of India (SBI)'}
                      value={formData.bankName}
                      onChange={(e) => handleChange('bankName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'बैंक खाता संख्या (Account Number):' : 'Bank Account Number:'}</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder={isHindi ? 'खाता संख्या दर्ज करें' : 'Enter Account Number'}
                      value={formData.accountNumber}
                      onChange={(e) => handleChange('accountNumber', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'पुष्टि खाता संख्या (Confirm Account Number):' : 'Confirm Account Number:'}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isHindi ? 'खाता संख्या पुनः दर्ज करें' : 'Re-enter Account Number'}
                      value={formData.confirmAccountNumber}
                      onChange={(e) => handleChange('confirmAccountNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'आईएफएससी कोड (IFSC Code):' : 'IFSC Code:'}</label>
                    <input
                      type="text"
                      maxLength={11}
                      className="form-control"
                      placeholder="SBIN0001234"
                      value={formData.ifscCode}
                      onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase().slice(0, 11))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'शाखा का नाम (Branch Name):' : 'Branch Name:'}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isHindi ? 'उदा. गोमती नगर, लखनऊ' : 'e.g. Gomti Nagar, Lucknow'}
                      value={formData.branchName}
                      onChange={(e) => handleChange('branchName', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Security, Photo & Declaration */}
            {currentStep === 6 && (
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0c2340',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Lock size={20} style={{ color: '#b45309' }} />{' '}
                  {isHindi ? 'चरण 6: पासवर्ड, फोटो एवं घोषणा (Security & Declaration)' : 'Step 6: Security, Photo & Declaration'}
                </h3>

                <div className="form-grid-2" style={{ marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'लॉगिन हेतु पासवर्ड बनाएं (Create Password):' : 'Create Password:'} <span className="req">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      style={fieldErrors.password ? { borderColor: '#ef4444' } : {}}
                      placeholder={isHindi ? 'न्यूनतम 6 अक्षर या अंक' : 'Minimum 6 characters'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                    />
                    {fieldErrors.password && (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.password[0]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {isHindi ? 'पासवर्ड की पुष्टि करें (Confirm Password):' : 'Confirm Password:'} <span className="req">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder={isHindi ? 'पासवर्ड दोबारा दर्ज करें' : 'Re-enter password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '24px' }}>
                  <div className="form-group">
                    <label className="form-label">{isHindi ? 'पासपोर्ट साइज फोटो (Passport Size Photo):' : 'Passport Size Photo:'}</label>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div
                        style={{
                          width: 70,
                          height: 85,
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          overflow: 'hidden',
                          background: '#f1f5f9',
                          flexShrink: 0,
                        }}
                      >
                        <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        <label
                          className="button button-outline button-small"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 6 }}
                        >
                          <Upload size={14} /> {isHindi ? 'फोटो चुनें' : 'Choose Photo'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={handlePhotoChange}
                          />
                        </label>
                        <p style={{ margin: 0 }}>{isHindi ? 'JPG, PNG, WebP (अधिकतम 2MB)' : 'JPG, PNG, WebP (Max 2MB)'}</p>
                      </div>
                    </div>
                    {fieldErrors.image && (
                      <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.image[0]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isHindi ? '4-अंकों का त्वरित सुरक्षा पिन (4-Digit PIN):' : '4-Digit Fast Security PIN:'}</label>
                    <input
                      type="password"
                      maxLength={4}
                      className="form-control"
                      placeholder="1234"
                      value={formData.securityPin}
                      onChange={(e) => handleChange('securityPin', e.target.value.replace(/\D/g, ''))}
                    />
                    <span className="form-hint">{isHindi ? 'मोबाइल ऐप व त्वरित लॉगिन हेतु।' : 'For quick login and mobile app verification.'}</span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '24px',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '13px', color: '#1e293b', lineHeight: 1.6 }}>
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                      style={{ marginTop: 4, width: 18, height: 18 }}
                    />
                    <span>
                      <strong>{isHindi ? 'स्व-घोषणा पत्र: ' : 'Self-Declaration: '}</strong>
                      {isHindi
                        ? `मैं प्रमाणित करता/करती हूँ कि मेरे द्वारा दी गई समस्त जानकारी सत्य व सही है। मैंने ${siteConfig.hindiName} की विस्तृत नियमावली पढ़ व समझ ली है और मैं सभी नियमों का निष्ठापूर्वक पालन करने हेतु सहमत हूँ। मैं सक्रिय सहयोग अभियानों में सहभागिता करने का संकल्प लेता/लेती हूँ।`
                        : `I solemnly declare that all particulars submitted by me are true and accurate to the best of my knowledge. I have thoroughly read and accepted the official Constitution and operational By-Laws of ${siteConfig.name} and undertake to abide by them.`}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Per-Step Recheck Confirmation Checkbox */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                padding: '12px 16px',
                marginTop: '24px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#78350f',
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!stepConfirmed[currentStep]}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setStepConfirmed((prev) => ({ ...prev, [currentStep]: checked }))
                    if (checked && errorMsg) setErrorMsg('')
                  }}
                  style={{ marginTop: 3, width: 17, height: 17, accentColor: '#d97706', cursor: 'pointer' }}
                />
                <span>
                  {isHindi
                    ? 'मैं पुष्टि करता/करती हूँ कि ऊपर दी गई सभी जानकारी सही है। कृपया आगे बढ़ने से पहले अपने विवरण की पुनः जांच कर लें।'
                    : 'I confirm that the given information is correct. Please recheck all details carefully before going further.'}
                </span>
              </label>
            </div>

            {/* Form Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              {currentStep > 1 ? (
                <button type="button" className="button button-outline" onClick={handlePrev} disabled={submitting}>
                  <ArrowLeft size={16} /> {isHindi ? 'पिछला चरण' : 'Previous Step'}
                </button>
              ) : (
                <div />
              )}

              {currentStep < 6 ? (
                <button type="button" className="button button-gold" onClick={handleNext}>
                  {isHindi ? `अगला चरण (${currentStep + 1}/6)` : `Next Step (${currentStep + 1}/6)`} <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary button-large"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity: submitting ? 0.75 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>{isHindi ? 'पंजीकरण हो रहा है...' : 'Registering...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>{isHindi ? 'ऑनलाइन पंजीकरण पूर्ण करें' : 'Complete Online Registration'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showIdCardModal && registeredMember && (
        <DigitalIdCard member={registeredMember} onClose={() => setShowIdCardModal(false)} />
      )}
    </div>
  )
}
