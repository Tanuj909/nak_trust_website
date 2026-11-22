import { AlertCircle, Loader2, ShieldCheck, UserCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../api'
import { routes } from '../../config/routes'
import { siteConfig } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Login() {
  const { isHindi } = useLanguage()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [loginMethod, setLoginMethod] = useState('password') // 'password' or 'otp'
  const [mobileOrId, setMobileOrId] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const target = location.state?.from?.pathname || routes.dashboard
      navigate(target, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleSendOtp = () => {
    if (!mobileOrId.trim()) {
      setErrorMsg(isHindi ? 'कृपया अपना मोबाइल नंबर दर्ज करें!' : 'Please enter your mobile number!')
      return
    }
    setErrorMsg('')
    setOtpSent(true)
    setOtp('5289') // simulated OTP
  }

  const handleMemberLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    const cleanLoginId = mobileOrId.trim()
    if (!cleanLoginId) {
      setErrorMsg(isHindi ? 'कृपया मोबाइल नंबर, ईमेल या सदस्य आईडी दर्ज करें।' : 'Please enter mobile number, email, or Member ID.')
      return
    }

    if (loginMethod === 'password' && !password) {
      setErrorMsg(isHindi ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.')
      return
    }

    if (loginMethod === 'otp') {
      setErrorMsg(isHindi ? 'OTP आधारित लॉगिन सेवा शीघ्र प्रारंभ होगी। कृपया अपने पासवर्ड से लॉगिन करें।' : 'OTP login will be available soon. Please login using your password.')
      setLoginMethod('password')
      return
    }

    setSubmitting(true)
    try {
      const res = await authService.loginMember({
        login_id: cleanLoginId,
        password: password,
      })

      const data = res.data || {}
      const token = data.token
      const user = data.user

      if (token && user) {
        login(token, user)
        const redirectPath = location.state?.from?.pathname || routes.dashboard
        navigate(redirectPath, { replace: true })
      } else {
        setErrorMsg(isHindi ? 'अमान्य सर्वर प्रतिक्रिया प्राप्त हुई।' : 'Invalid response from server.')
      }
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors)
        const firstErr = Object.values(err.errors).flat()[0]
        setErrorMsg(firstErr || err.message)
      } else if (err.status === 401 || err.status === 403) {
        setErrorMsg(err.message || (isHindi ? 'अमान्य क्रेडेंशियल अथवा अनधिकृत खाता।' : 'Invalid credentials or unauthorized account.'))
      } else if (err.status === 429) {
        setErrorMsg(isHindi ? 'बहुत अधिक लॉगिन प्रयास। कृपया कुछ मिनट प्रतीक्षा करें।' : 'Too many login attempts. Please wait a few moments and try again.')
      } else {
        setErrorMsg(err.message || (isHindi ? 'लॉगिन विफल रहा। कृपया पुनः प्रयास करें।' : 'Login failed. Please try again.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="section section-alt" style={{ minHeight: '80vh', display: 'grid', placeItems: 'center' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#0c2340',
              color: '#fbbf24',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0c2340', marginBottom: 4 }}>
            {isHindi ? 'सदस्य पोर्टल लॉगिन' : 'Member Portal Login'}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            {isHindi ? siteConfig.hindiName : siteConfig.name} (Reg. No. 130/2025)
          </p>
        </div>

        <div className="form-card" style={{ padding: '32px' }}>
          {errorMsg && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #f87171',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 18,
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleMemberLogin}>
            <div className="form-group">
              <label className="form-label">
                {isHindi ? 'मोबाइल नंबर अथवा सदस्य आईडी / ईमेल:' : 'Mobile Number, Member ID or Email:'} <span className="req">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="form-control"
                  style={fieldErrors.login_id ? { borderColor: '#ef4444' } : {}}
                  placeholder={isHindi ? 'उदा. 9452081234 या NSCT-2026-...' : 'e.g. 9452081234 or NSCT-2026-...'}
                  value={mobileOrId}
                  onChange={(e) => {
                    setMobileOrId(e.target.value)
                    if (fieldErrors.login_id) setFieldErrors({ ...fieldErrors, login_id: null })
                  }}
                />
              </div>
              {fieldErrors.login_id ? (
                <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.login_id[0]}</span>
              ) : (
                <span className="form-hint">
                  {isHindi ? 'पंजीकरण के समय दिया गया 10 अंकों का मोबाइल, ईमेल अथवा आवंटित सदस्य आईडी।' : '10-digit registered mobile, email or allotted Member ID.'}
                </span>
              )}
            </div>

            {loginMethod === 'password' ? (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">
                    {isHindi ? 'पासवर्ड:' : 'Password:'} <span className="req">*</span>
                  </label>
                  {/* <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    style={{ fontSize: '11.5px', color: '#b45309', fontWeight: 700 }}
                  >
                    {isHindi ? 'OTP से लॉगिन करें' : 'Login via OTP'}
                  </button> */}
                </div>
                <input
                  type="password"
                  required
                  className="form-control"
                  style={fieldErrors.password ? { borderColor: '#ef4444' } : {}}
                  placeholder={isHindi ? 'पासवर्ड दर्ज करें' : 'Enter Password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null })
                  }}
                />
                {fieldErrors.password && (
                  <span style={{ color: '#dc2626', fontSize: '11.5px', marginTop: 2 }}>{fieldErrors.password[0]}</span>
                )}
              </div>
            ) : (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">
                    {isHindi ? 'एक बार का पासवर्ड (OTP):' : 'One-Time Password (OTP):'} <span className="req">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('password')}
                    style={{ fontSize: '11.5px', color: '#b45309', fontWeight: 700 }}
                  >
                    {isHindi ? 'पासवर्ड से लॉगिन करें' : 'Login via Password'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={isHindi ? '4-अंकों का OTP' : '4-Digit OTP'}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    className="button button-outline button-small"
                    onClick={handleSendOtp}
                  >
                    {otpSent ? (isHindi ? 'पुनः भेजें' : 'Resend') : (isHindi ? 'OTP भेजें' : 'Send OTP')}
                  </button>
                </div>
                {otpSent && (
                  <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700, marginTop: 4 }}>
                    {isHindi ? '✓ डेमो OTP (5289) स्वतः भर दिया गया है।' : '✓ Demo OTP (5289) auto-filled.'}
                  </span>
                )}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                fontSize: '12px',
              }}
            >
              {/* <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#475569' }}>
                <input type="checkbox" defaultChecked /> {isHindi ? 'मुझे याद रखें' : 'Remember Me'}
              </label> */}
              {/* <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault()
                  alert(
                    isHindi
                      ? 'पासवर्ड रीसेट करने हेतु हेल्पलाइन 9452081234 पर संपर्क करें।'
                      : 'To reset your password, please contact our helpline at 9452081234.'
                  )
                }}
                style={{ color: '#b45309', fontWeight: 700 }}
              >
                {isHindi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
              </a> */}
            </div>

            <button
              type="submit"
              className="button button-gold"
              style={{
                width: '100%',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: submitting ? 0.75 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{isHindi ? 'सत्यापित किया जा रहा है...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <UserCheck size={18} />
                  <span>{isHindi ? 'सदस्य पोर्टल पर लॉगिन करें' : 'Login to Member Portal'}</span>
                </>
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid #e2e8f0',
              fontSize: '13px',
              color: '#64748b',
            }}
          >
            <span>{isHindi ? 'क्या आप नए सदस्य हैं? ' : "Don't have an account? "}</span>
            <Link to={routes.registration} style={{ color: '#047857', fontWeight: 800 }}>
              {isHindi ? 'यहाँ नया पंजीकरण करें →' : 'Register New Member →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
