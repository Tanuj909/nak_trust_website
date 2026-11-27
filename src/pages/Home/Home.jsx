import { 
  ArrowRight, 
  Award, 
  Building2, 
  Calendar, 
  Camera,
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  Eye,
  Flame, 
  Gift, 
  HandHeart, 
  Heart, 
  HeartHandshake, 
  HelpCircle, 
  Loader2,
  Lock, 
  MapPin, 
  Newspaper, 
  Phone, 
  Printer, 
  QrCode, 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Stethoscope, 
  User,
  UserCheck, 
  UserPlus, 
  Users,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { routes } from '../../config/routes'
import { siteConfig } from '../../config/site'
import { activeCampaigns } from '../../data/campaigns'
import { patronLeadership, faqList } from '../../data/teamData'
import { useLanguage } from '../../i18n/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { formatCategory } from '../../utils/category'
import DigitalIdCard from '../../components/common/DigitalIdCard'
import { triggerDonateFlow } from '../../components/common/DonateChoiceModal'
import { publicService, getMediaUrl } from '../../api'

const staticGalleryItems = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80',
    category: 'सहायता वितरण',
    categoryEn: 'Relief Handover',
    titleHi: 'गोरखपुर: दिवंगत शिक्षक परिवार को त्वरित आर्थिक सहायता चेक हस्तांतरण',
    titleEn: 'Gorakhpur: Demise Relief Cheque Handover to Nominee Family',
    location: 'गोरखपुर (Gorakhpur)',
    date: '14 फरवरी 2026',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80',
    category: 'कन्यादान योजना',
    categoryEn: 'Kanyadaan Grant',
    titleHi: 'लखनऊ: सदस्य की सुपुत्री विवाह अवसर पर जिला टीम द्वारा मंगल आशीर्वाद व उपहार',
    titleEn: 'Lucknow: Kanyadaan Wedding Grant & Felicitations by Trust Team',
    location: 'लखनऊ (Lucknow)',
    date: '28 जनवरी 2026',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    category: 'चिकित्सा सहायता',
    categoryEn: 'Medical Aid',
    titleHi: 'प्रयागराज: गंभीर बीमारी से जूझ रहे सदस्य को संजीवनी आपातकालीन सहायता संबल',
    titleEn: 'Prayagraj: Sanjeevani Emergency Medical Relief Disbursement',
    location: 'प्रयागराज (Prayagraj)',
    date: '10 फरवरी 2026',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    category: 'संगठनात्मक बैठक',
    categoryEn: 'Review Meeting',
    titleHi: 'वाराणसी: पूर्वांचल मंडल कार्यकारिणी की त्रैमासिक नीति समीक्षा संगोष्ठी',
    titleEn: 'Varanasi: Eastern UP Regional Leadership Review Conference',
    location: 'वाराणसी (Varanasi)',
    date: '02 फरवरी 2026',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=80',
    category: 'रक्तदान शिविर',
    categoryEn: 'Blood Donation Camp',
    titleHi: 'कानपुर: संस्था द्वारा आयोजित विशाल स्वैच्छिक महा-रक्तदान एवं स्वास्थ्य शिविर',
    titleEn: 'Kanpur: Voluntary Blood Donation & Comprehensive Health Camp',
    location: 'कानपुर (Kanpur)',
    date: '18 जनवरी 2026',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80',
    category: 'सम्मान समारोह',
    categoryEn: 'Award Ceremony',
    titleHi: 'अयोध्या: सामाजिक सुरक्षा महाअभियान में उत्कृष्ट योगदान हेतु कार्यकर्ताओं का सम्मान',
    titleEn: 'Ayodhya: Felicitation Ceremony for Meritorious Social Volunteers',
    location: 'अयोध्या (Ayodhya)',
    date: '05 जनवरी 2026',
  },
]

export default function Home() {
  const { language, isHindi } = useLanguage()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchError, setSearchError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState(0)
  const [newsList, setNewsList] = useState([])
  const [isLoadingNews, setIsLoadingNews] = useState(true)
  const [liveDonors, setLiveDonors] = useState([])
  const [isLoadingDonors, setIsLoadingDonors] = useState(true)
  const [featuredMembers, setFeaturedMembers] = useState([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(null)

  useEffect(() => {
    setIsLoadingDonors(true)
    publicService.getApprovedDonors({ per_page: 5 })
      .then((res) => {
        const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : [])
        setLiveDonors(list)
      })
      .catch(() => {
        setLiveDonors([])
      })
      .finally(() => {
        setIsLoadingDonors(false)
      })
  }, [])

  useEffect(() => {
    setIsLoadingNews(true)
    publicService.getPosts({ per_page: 3 })
      .then((res) => {
        const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : [])
        setNewsList(list)
      })
      .catch(() => {
        setNewsList([])
      })
      .finally(() => {
        setIsLoadingNews(false)
      })
  }, [])

  useEffect(() => {
    setIsLoadingMembers(true)
    publicService.getPublicMembers({ per_page: 6 })
      .then((res) => {
        const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : [])
        setFeaturedMembers(list.slice(0, 6))
      })
      .catch(() => {
        setFeaturedMembers([])
      })
      .finally(() => {
        setIsLoadingMembers(false)
      })
  }, [])

  const handleSearchVerify = async (e) => {
    e.preventDefault()
    setSearchError('')
    const q = searchQuery.trim()
    if (!q) {
      setSearchError(isHindi ? 'कृपया अपनी सदस्यता आईडी दर्ज करें (उदा. NSCT-2026-I9Q8150)' : 'Please enter Member ID (e.g. NSCT-2026-I9Q8150)')
      return
    }

    setIsSearching(true)
    try {
      // Strictly verify by Member ID only (No search by Name allowed)
      const res = await publicService.verifyMemberECard(q)
      const card = res?.data?.data?.card || res?.data?.card
      if (card) {
        setSelectedMember({
          id: card.member_code,
          name: card.name,
          avatar: card.photo_url ? getMediaUrl(card.photo_url) : null,
          category: card.category,
          categoryName: `संवर्ग ${card.category}`,
          district: card.district,
          block: card.block,
          bloodGroup: card.blood_group,
          nomineeName: card.nominee_name || (isHindi ? 'गोपनीय' : 'Protected'),
          nomineeRelation: card.nominee_relation || '',
          fatherHusband: card.father_husband_name || '',
          status: card.status === 'active' ? (isHindi ? 'सत्यापित सक्रिय सदस्य' : 'Verified Active Member') : card.status,
          joinedAt: card.joined_at,
        })
        setIsSearching(false)
        return
      }
    } catch {
      // Invalid or not found
    } finally {
      setIsSearching(false)
    }

    setSearchError(
      isHindi 
        ? 'प्रदत्त सदस्यता आईडी से कोई सक्रिय सदस्य नहीं मिला। कृपया केवल वैध सदस्य आईडी (उदा. NSCT-2026-I9Q8150) दर्ज करें।' 
        : 'No active verified member found with this Member ID. Please enter a valid Member ID (e.g. NSCT-2026-I9Q8150).'
    )
  }

  const primaryCampaign = activeCampaigns[0]

  return (
    <>
      {/* ========================================================
          1. GRAND HERO SECTION
          ======================================================== */}
      <section className="hero-section">
        <div className="hero-tricolor-accent" />
        <div className="hero-bg-graphic" />

        <div className="container hero-grid">
          <div className="hero-left-content">
            <div className="hero-badge">
              <ShieldCheck size={16} style={{ color: '#fbbf24' }} />
              <span>
                {isHindi 
                  ? `उत्तर प्रदेश शासन में पंजीकृत लोक कल्याण ट्रस्ट • पंजीकरण सं. ${siteConfig.regNo.split(' ')[0] || '130/2025'}`
                  : `Govt. Registered Public Welfare Trust • Reg. No. ${siteConfig.regNo.split(' ')[0] || '130/2025'}`}
              </span>
            </div>

            <h1 className="hero-headline">
              {isHindi ? (
                <>
                  विपत्ति में लाखों हाथों का संबल, <br />
                  <span className="highlight-gold">कोई परिवार अब बेसहारा नहीं</span>
                </>
              ) : (
                <>
                  United Support in Times of Adversity, <br />
                  <span className="highlight-gold">No Family Left Helpless</span>
                </>
              )}
            </h1>

            <p className="hero-subheadline">
              {isHindi 
                ? `${siteConfig.hindiName} (${siteConfig.name}) उत्तर प्रदेश के समस्त 75 जनपदों एवं देश भर के कर्मचारियों, प्राइवेट कर्मियों, पेशेवरों एवं आम जनमानस का एक पारदर्शी, गैर-राजनीतिक एवं पारस्परिक सामाजिक सुरक्षा महा-अभियान है।`
                : `National Self Care Team (NAK Trust ORG) is a transparent, non-political mutual welfare ecosystem for government staff, private employees, professionals, and general citizens across UP's 75 districts and Pan-India.`}
            </p>

            <div className="hero-motto-strip">
              <span>
                {isHindi 
                  ? '★ हमारा संकल्प: "सेवा परमो धर्मः • हम सबका, हम सबके लिए, हम सबके द्वारा"'
                  : '★ Our Ethos: "Service is the Highest Duty • Of Everyone, For Everyone, By Everyone"'}
              </span>
            </div>

            <div className="hero-actions">
              <Link to={routes.registration} className="button button-gold button-large">
                <UserPlus size={18} /> {isHindi ? 'नया सदस्य पंजीकरण (Register)' : 'Register As Member'} <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className="button button-outline button-large"
                style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)' }}
                onClick={() => triggerDonateFlow(navigate, isAuthenticated, primaryCampaign)}
              >
                <HeartHandshake size={18} /> {isHindi ? 'सीधे सहयोग करें (Contribute)' : 'Contribute Now (सहयोग करें)'}
              </button>
            </div>

            <div className="hero-trust-badges">
              <span className="hero-trust-badge">
                <ShieldCheck size={16} /> {isHindi ? '100% प्रत्यक्ष DBT अंतरण' : '100% Direct DBT Transfer'}
              </span>
              <span className="hero-trust-badge">
                <Lock size={16} /> {isHindi ? 'शून्य (0%) बिचौलिया कटौती' : 'Zero (0%) Intermediary Cut'}
              </span>
              <span className="hero-trust-badge">
                <Building2 size={16} /> {isHindi ? '75 जनपदों में सक्रिय कमेटियां' : '75 Districts Active Committees'}
              </span>
            </div>
          </div>

          {/* Hero Right: Community Banner Image (Direct <img> with no wrapping div) */}
          <img
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&auto=format&fit=crop&q=80"
            alt={isHindi ? 'राष्ट्रीय स्व-देखभाल टीम कल्याण सहयोग' : 'National Self Care Team Welfare & Support'}
            className="hero-image"
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '440px',
              objectFit: 'cover',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'block'
            }}
          />
        </div>
      </section>

      {/* ========================================================
          2. CORE SERVICES BAR (EXACT 4 SERVICES OF NSCT)
          ======================================================== */}
      <section className="container no-print">
        <div className="quick-services-bar" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: 14 }}>
            <Link to={routes.registration} className="quick-service-card">
              <div className="quick-service-icon blue">
                <UserPlus size={22} />
              </div>
              <div>
                <span className="quick-service-title" style={{ display: 'block' }}>
                  {isHindi ? 'सदस्य ऑनलाइन पंजीकरण' : 'Member Registration'}
                </span>
                <small style={{ color: '#64748b', fontSize: '11px' }}>
                  संवर्ग A, B, C, D (Category A, B, C, D)
                </small>
              </div>
            </Link>

            <Link to={routes.cooperation} className="quick-service-card">
              <div className="quick-service-icon red">
                <HeartHandshake size={22} />
              </div>
              <div>
                <span className="quick-service-title" style={{ display: 'block' }}>
                  {isHindi ? 'दिवंगत आश्रित सहयोग' : 'Untimely Demise Aid'}
                </span>
                <small style={{ color: '#64748b', fontSize: '11px' }}>
                  {isHindi ? 'आकस्मिक परिवार संबल' : 'Family Emergency Relief'}
                </small>
              </div>
            </Link>

            <Link to={`${routes.applications}?scheme=kanyadaan`} className="quick-service-card">
              <div className="quick-service-icon gold">
                <Gift size={22} />
              </div>
              <div>
                <span className="quick-service-title" style={{ display: 'block' }}>
                  {isHindi ? 'कन्यादान महाभियान' : 'Kanyadaan Scheme'}
                </span>
                <small style={{ color: '#64748b', fontSize: '11px' }}>
                  {isHindi ? 'सुपुत्री विवाह सहायता' : 'Daughter Marriage Grant'}
                </small>
              </div>
            </Link>

            <Link to={`${routes.applications}?scheme=medical`} className="quick-service-card">
              <div className="quick-service-icon green">
                <Stethoscope size={22} />
              </div>
              <div>
                <span className="quick-service-title" style={{ display: 'block' }}>
                  {isHindi ? 'संजीवनी चिकित्सा सहायता' : 'Medical Assistance'}
                </span>
                <small style={{ color: '#64748b', fontSize: '11px' }}>
                  {isHindi ? 'गंभीर बीमारी उपचार राहत' : 'Critical Illness Treatment'}
                </small>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. ACTIVE WELFARE CAMPAIGNS (COMMENTED OUT TEMPORARILY)
          ======================================================== */}
      {/* 
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">
              <Flame size={16} /> {isHindi ? 'सक्रिय एवं तात्कालिक जनसहयोग' : 'Urgent Public Mutual Aid'}
            </span>
            <h2 className="section-title">
              {isHindi ? 'वर्तमान सक्रिय सहयोग महा-अभियान' : 'Active Public Welfare Appeals'}
            </h2>
            <p className="section-subtitle">
              {isHindi 
                ? 'संस्था के पंजीकृत सदस्य के असमय निधन या सुपुत्री विवाह पर प्रदेश भर के साथी सीधे उनके परिवार के बैंक खाते में स्वैच्छिक सहयोग भेजते हैं।'
                : 'Upon untimely demise of a member or daughter marriage, members across UP directly send voluntary assistance to the nominee bank account.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {activeCampaigns.map((camp) => (
              <div key={camp.id} className="category-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="category-badge-pill" style={{ background: camp.type === 'death' ? '#fee2e2' : '#fef3c7', color: camp.type === 'death' ? '#991b1b' : '#92400e' }}>
                    {camp.type === 'death' 
                      ? (isHindi ? 'दिवंगत साथी सहयोग (Demise Aid)' : 'Demise Relief Appeal') 
                      : (isHindi ? 'कन्यादान महाभियान (Kanyadaan)' : 'Kanyadaan Scheme')}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                    Appeal: {camp.appealLetterNo}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0c2340', marginBottom: '8px', lineHeight: 1.35 }}>
                  {camp.title}
                </h3>

                <p style={{ fontSize: '12.5px', color: '#475569', marginBottom: '14px', lineHeight: 1.6 }}>
                  {camp.note}
                </p>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>{isHindi ? 'जनपद व ब्लॉक:' : 'District & Block:'}</span>
                    <strong>{camp.district} ({camp.block})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>{isHindi ? 'नामांकित आश्रित:' : 'Nominee Dependent:'}</span>
                    <strong>{camp.nomineeName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>{isHindi ? 'नामिनी खाता (DBT):' : 'Nominee Bank A/C:'}</span>
                    <strong style={{ color: '#047857', fontFamily: 'monospace' }}>{camp.nomineeAccount}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: '16px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>{isHindi ? 'प्रगति:' : 'Progress:'}</span>
                    <strong style={{ color: '#047857' }}>
                      ₹{(camp.collectedAmount / 100000).toFixed(2)}L / ₹{(camp.targetAmount / 100000).toFixed(0)}L
                    </strong>
                  </div>
                  <div className="progress-track" style={{ background: '#e2e8f0' }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${(camp.collectedAmount / camp.targetAmount) * 100}%` }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="button button-gold button-small"
                    style={{ flexGrow: 1 }}
                    onClick={() => setDonateCampaign(camp)}
                  >
                    <HeartHandshake size={15} /> {isHindi ? 'सीधे सहयोग करें' : 'Contribute Now'}
                  </button>
                  <Link to={routes.cooperation} className="button button-outline button-small">
                    {isHindi ? 'रिपोर्ट' : 'Report'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* ========================================================
          5. FOUR MEMBERSHIP CATEGORIES (A, B, C, D)
          ======================================================== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">
              <Users size={16} /> Four Membership Pillars
            </span>
            <h2 className="section-title">
              {isHindi ? 'चार सदस्यता संवर्ग (Categories A, B, C, D)' : 'Four Membership Categories (A, B, C, D)'}
            </h2>
            <p className="section-subtitle">
              {isHindi 
                ? 'समाज के प्रत्येक वर्ग की सहभागिता सुनिश्चित करने हेतु 4 पारदर्शी संवर्ग।'
                : 'Four inclusive categories ensuring socio-economic security for every section of our society.'}
            </p>
          </div>

          <div className="categories-grid">
            {siteConfig.memberCategories.map((cat) => (
              <div key={cat.id} className={`category-card cat-${cat.id.toLowerCase()}`}>
                <span className="category-badge-pill">{cat.name.split(' ')[0]} {cat.name.split(' ')[1]}</span>
                <h3 className="category-title">{cat.name}</h3>
                <p className="category-desc">{isHindi ? cat.hindiDesc : cat.enName}</p>

                <ul className="category-features-list">
                  {cat.features.map((feat, i) => (
                    <li key={i} className="category-feature-item">
                      <CheckCircle2 size={16} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`${routes.registration}?category=${cat.id}`}
                  className="button button-outline"
                  style={{ width: '100%', marginTop: 'auto', textAlign: 'center' }}
                >
                  {isHindi ? 'इस संवर्ग में जुड़ें' : 'Join This Category'} <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. CORE 3 WELFARE SCHEMES OF NSCT (CLEAN & EXACT)
          ======================================================== */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">
              <HandHeart size={16} /> Dedicated Welfare Schemes
            </span>
            <h2 className="section-title">
              {isHindi ? 'संस्था की प्रमुख 3 जनकल्याणकारी योजनाएं' : 'Core 3 Welfare Schemes of NSCT'}
            </h2>
            <p className="section-subtitle">
              {isHindi 
                ? 'पारस्परिक सहयोग एवं मानवीय संबल के आधार पर संचालित प्राथमिक योजनाएं।'
                : 'Primary schemes operated on the principles of mutual brotherhood and direct socio-economic aid.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: 24 }}>
            <div className="scheme-card">
              <div className="scheme-icon-box" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                <ShieldAlert size={28} />
              </div>
              <h3 className="scheme-title">
                {isHindi ? '1. दिवंगत सदस्य आश्रित सहायता' : '1. Untimely Demise Dependent Relief'}
              </h3>
              <span className="scheme-amount-badge">
                {isHindi ? 'लक्ष्य: ₹50 लाख से ₹1 करोड़' : 'Target: ₹50 Lakh - ₹1 Crore'}
              </span>
              <p className="scheme-desc">
                {isHindi 
                  ? 'पंजीकृत सदस्य के असमय निधन पर उनके अधिकृत नॉमिनी के खाते में प्रदेश के लाखों सदस्यों द्वारा सीधे सहायता राशि भेजी जाती है।'
                  : 'Upon untimely demise of a registered member, members across UP directly send financial relief straight to the nominee bank account.'}
              </p>
              <Link to={`${routes.applications}?scheme=death`} className="scheme-link">
                {isHindi ? 'आश्रित सहायता आवेदन करें' : 'Apply for Demise Aid'} <ArrowRight size={15} />
              </Link>
            </div>

            <div className="scheme-card">
              <div className="scheme-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Gift size={28} />
              </div>
              <h3 className="scheme-title">
                {isHindi ? '2. कन्यादान महाभियान योजना' : '2. Kanyadaan Mahabhiyan Scheme'}
              </h3>
              <span className="scheme-amount-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                {isHindi ? 'विवाह उपहार एवं आर्थिक संबल' : 'Marriage Blessing & Financial Grant'}
              </span>
              <p className="scheme-desc">
                {isHindi 
                  ? 'सक्रिय सदस्यों की सुपुत्री के विवाह अवसर पर जिला टीम के स्थलीय सत्यापन उपरांत कन्यादान स्वरूप उपहार राशि अंतरित की जाती है।'
                  : 'On the wedding of an active member\'s daughter, after verification by the district team, wedding gifts and financial grant are transferred.'}
              </p>
              <Link to={`${routes.applications}?scheme=kanyadaan`} className="scheme-link">
                {isHindi ? 'कन्यादान आवेदन करें' : 'Apply for Kanyadaan'} <ArrowRight size={15} />
              </Link>
            </div>

            <div className="scheme-card">
              <div className="scheme-icon-box" style={{ background: '#ecfdf5', color: '#047857' }}>
                <Stethoscope size={28} />
              </div>
              <h3 className="scheme-title">
                {isHindi ? '3. गंभीर बीमारी चिकित्सा सहायता' : '3. Critical Illness Medical Relief'}
              </h3>
              <span className="scheme-amount-badge" style={{ background: '#ecfdf5', color: '#047857' }}>
                {isHindi ? 'संजीवनी उपचार संबल' : 'Life-saving Medical Support'}
              </span>
              <p className="scheme-desc">
                {isHindi 
                  ? 'कैंसर, किडनी विफलता, ओपन हार्ट सर्जरी अथवा गंभीर दुर्घटना की दशा में जीवन रक्षा हेतु अस्पताल के बिलों सहित चिकित्सा सहायता।'
                  : 'Emergency treatment assistance for cancer, kidney failure, open heart surgeries, or critical trauma with hospital bill verification.'}
              </p>
              <Link to={`${routes.applications}?scheme=medical`} className="scheme-link">
                {isHindi ? 'चिकित्सा सहायता आवेदन' : 'Apply for Medical Aid'} <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. LATEST NEWS & PRESS RELEASES (NEW PORTION)
          ======================================================== */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <span className="section-eyebrow">
                <Newspaper size={16} /> Latest News & Announcements
              </span>
              <h2 className="section-title" style={{ margin: '6px 0 0' }}>
                {isHindi ? 'नवीनतम समाचार एवं प्रेस विज्ञप्ति' : 'Latest News & Media Bulletins'}
              </h2>
            </div>
            <Link to={routes.news} className="button button-gold button-small">
              {isHindi ? 'सभी समाचार देखें →' : 'View All News →'}
            </Link>
          </div>

          {isLoadingNews ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
              <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 10px', color: '#b45309' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                {isHindi ? 'समाचार लोड हो रहे हैं...' : 'Loading latest news...'}
              </p>
            </div>
          ) : newsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fafc', borderRadius: 16, border: '1px dashed #cbd5e1', color: '#64748b' }}>
              <Newspaper size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                {isHindi ? 'अभी कोई समाचार या प्रेस विज्ञप्ति उपलब्ध नहीं है।' : 'No news or announcements published yet.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: 24 }}>
              {newsList.map((article) => {
                const coverImg = article.cover_image_url ? getMediaUrl(article.cover_image_url) : ''
                const displayDate = article.published_at 
                  ? new Date(article.published_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                  : ''

                return (
                  <div key={article.id} className="category-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 190, width: '100%', overflow: 'hidden', background: '#f1f5f9' }}>
                      {coverImg ? (
                        <img src={coverImg} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#94a3b8' }}>
                          <Newspaper size={36} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', marginBottom: 8 }}>
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '1px 7px', borderRadius: 4, fontWeight: 700 }}>
                          {article.category || 'News'}
                        </span>
                        {displayDate && <span>{displayDate}</span>}
                      </div>
                      <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0c2340', marginBottom: 8, lineHeight: 1.4 }}>
                        {article.title}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.6, marginBottom: 14 }}>
                        {article.excerpt || article.summary || ''}
                      </p>
                      <Link to={routes.news} style={{ marginTop: 'auto', fontSize: '12.5px', color: '#b45309', fontWeight: 800 }}>
                        {isHindi ? 'पूरी खबर पढ़ें →' : 'Read Full Story →'}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          8. 100% DIRECT DBT TRANSPARENCY MODEL
          ======================================================== */}
      <section className="section section-navy">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">
              <CheckCircle2 size={16} /> 100% Direct & Transparent
            </span>
            <h2 className="section-title">
              {isHindi ? 'शून्य कमीशन • सीधे पीड़ित परिवार के खाते में सहयोग' : 'Zero Commission • 100% Direct to Nominee Account'}
            </h2>
            <p className="section-subtitle">
              {isHindi 
                ? 'संस्था किसी भी प्रकार की मध्यस्थ कटौती नहीं करती। प्रत्येक साथी द्वारा भेजा गया सहयोग सीधे पीड़ित परिवार के अधिकृत बैंक खाते में पहुंचता है।'
                : 'Zero commission deductions. Every single rupee contributed by members goes straight to the verified nominee bank account via Direct Bank Transfer (DBT).'}
            </p>
          </div>

          <div className="transparency-flow">
            <div className="flow-step-card">
              <div className="flow-step-number">1</div>
              <h4 className="flow-step-title">{isHindi ? 'ऑनलाइन पंजीकरण' : 'Online Registration'}</h4>
              <p className="flow-step-desc">
                {isHindi 
                  ? 'सदस्य पोर्टल पर आधार व विवरण देकर संवर्ग अनुसार पंजीकरण करते हैं।'
                  : 'Members register online by selecting Category A, B, C or D with Aadhaar.'}
              </p>
            </div>

            <div className="flow-step-card">
              <div className="flow-step-number">2</div>
              <h4 className="flow-step-title">{isHindi ? 'जिला स्थलीय जांच' : 'District Field Verification'}</h4>
              <p className="flow-step-desc">
                {isHindi 
                  ? 'आकस्मिक घटना पर जिला कार्यकारिणी 48 घंटे में घर जाकर भौतिक सत्यापन करती है।'
                  : 'District committee conducts physical field verification of records within 48 hours.'}
              </p>
            </div>

            <div className="flow-step-card">
              <div className="flow-step-number">3</div>
              <h4 className="flow-step-title">{isHindi ? 'राज्यव्यापी अपील' : 'Statewide Appeal'}</h4>
              <p className="flow-step-desc">
                {isHindi 
                  ? 'सत्यापन उपरांत प्रदेश स्तर पर सीधे नॉमिनी का बैंक खाता व विवरण प्रकाशित होता है।'
                  : 'Verified appeal published statewide with direct nominee account details.'}
              </p>
            </div>

            <div className="flow-step-card">
              <div className="flow-step-number">4</div>
              <h4 className="flow-step-title">{isHindi ? 'सीधा बैंक अंतरण' : 'Direct Bank Transfer'}</h4>
              <p className="flow-step-desc">
                {isHindi 
                  ? 'लाखों सदस्य सीधे ₹50 से ₹500 भेजते हैं और राशि सीधे ₹50L-₹1Cr का संबल बनती है।'
                  : 'Lakhs of members send ₹50-₹500 directly, generating ₹50L-₹1Cr relief.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          9. REAL-TIME SAHYOG TRANSPARENCY FEED
          ======================================================== */}
      <section className="section">
        <div className="container">
          <div className="table-card">
            <div className="table-header-bar">
              <div className="table-title">
                <CreditCard size={20} style={{ color: '#b45309' }} />
                <span>
                  {isHindi ? 'हाल ही में प्राप्त सहयोग (लाइव पारदर्शिता सूची)' : 'Live Sahyog Transparency Feed'}
                </span>
                <span className="live-indicator">
                  <span className="pulse-dot" /> Live Updates
                </span>
              </div>
              <Link to={routes.cooperation} className="button button-outline button-small">
                {isHindi ? 'सम्पूर्ण सहयोग सूची देखें →' : 'View Full Sahyog List →'}
              </Link>
            </div>

            <div className="responsive-table-wrap">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>{isHindi ? 'सहयोगी सदस्य' : 'Donor Full Name'}</th>
                    <th>{isHindi ? 'संवर्ग (Category)' : 'Category'}</th>
                    <th>{isHindi ? 'जनपद (District)' : 'District'}</th>
                    <th>{isHindi ? 'स्वीकृत राशि' : 'Approved Amount'}</th>
                    <th>{isHindi ? 'सत्यापन स्थिति' : 'Verification Status'}</th>
                    <th>{isHindi ? 'स्वीकृति समय' : 'Verified Date & Time'}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingDonors ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                        <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#b45309' }} />
                        <span style={{ fontSize: '13px' }}>
                          {isHindi ? 'लाइव सहयोग सूची लोड हो रही है...' : 'Loading live transparency feed...'}
                        </span>
                      </td>
                    </tr>
                  ) : liveDonors.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b', fontSize: '13.5px' }}>
                        {isHindi ? 'वर्तमान में कोई स्वीकृत सहयोग प्रविष्टि उपलब्ध नहीं है।' : 'No approved contributions recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    liveDonors.map((item) => (
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
                            <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {formatCategory(item.category, isHindi)}
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
                          <span style={{ color: '#047857', fontWeight: 800, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={13} /> {isHindi ? 'सत्यापित (Approved)' : 'Approved'}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '12px' }}>
                          {item.verified_at
                            ? new Date(item.verified_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          10. DIGITAL ID CARD SEARCH WIDGET
          ======================================================== */}
      <section className="section section-alt">
        <div className="container">
          <div className="verify-widget-box">
            <div>
              <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {isHindi ? 'डिजिटल पहचान पत्र सत्यापन' : 'Digital Identity Card Verification'}
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: '8px 0 10px', lineHeight: 1.25 }}>
                {isHindi ? 'सदस्यता आईडी से डिजिटल पहचान पत्र प्राप्त करें' : 'Verify Membership & Download Digital ID Card'}
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                {isHindi 
                  ? 'अपनी आधिकारिक सदस्यता आईडी (Member ID) दर्ज करके सदस्यता स्थिति सत्यापित करें और डिजिटल स्मार्ट पहचान पत्र प्राप्त करें।'
                  : 'Enter your official Member ID (e.g. NSCT-2026-I9Q8150) to verify membership status and download your Digital Smart ID card.'}
              </p>
            </div>

            <div>
              <form onSubmit={handleSearchVerify}>
                <div className="verify-input-group">
                  <input
                    type="text"
                    placeholder={isHindi ? "सदस्यता आईडी दर्ज करें (उदा. NSCT-2026-I9Q8150)" : "Enter Member ID (e.g. NSCT-2026-I9Q8150)"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="button button-gold" style={{ padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={isSearching}>
                    {isSearching ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
                    {isHindi ? (isSearching ? 'सत्यापित हो रहा है...' : 'सत्यापित करें') : (isSearching ? 'Verifying...' : 'Verify')}
                  </button>
                </div>
                {searchError && (
                  <p style={{ color: '#fca5a5', fontSize: '12px', marginTop: 6 }}>{searchError}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          11. EXECUTIVE LEADERSHIP
          ======================================================== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">
              <Award size={16} /> Governing Council
            </span>
            <h2 className="section-title">
              {isHindi ? 'संरक्षक मंडल एवं राष्ट्रीय नेतृत्व' : 'Governing Patron Council & Leadership'}
            </h2>
            <p className="section-subtitle">
              {isHindi 
                ? 'निष्काम सेवा, उच्च विधिक दक्षता और पारदर्शी सामाजिक नेतृत्व के साथ संगठन का मार्गदर्शन कर रहे हमारे संरक्षक एवं पदाधिकारी।'
                : 'Distinguished patrons and legal advisors guiding our organization with integrity and transparent leadership.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '24px' }}>
            {patronLeadership.map((leader) => (
              <div key={leader.id} className="category-card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 14px', border: '3px solid #b45309' }}>
                  <img src={leader.image} alt={leader.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0c2340', marginBottom: 2 }}>{leader.name}</h3>
                <span style={{ fontSize: '11.5px', color: '#b45309', fontWeight: 800, display: 'block', marginBottom: 6 }}>
                  {leader.title}
                </span>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: 8 }}>{leader.qualification}</p>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          12. FEATURED VERIFIED MEMBERS DIRECTORY (BELOW GOVERNING COUNCIL)
          ======================================================== */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">
              <Users size={16} /> {isHindi ? 'सत्यापित सदस्य निर्देशिका' : 'Verified Member Directory'}
            </span>
            <h2 className="section-title">
              {isHindi ? 'हमारे समर्पित एवं पंजीकृत सदस्य' : 'Our Verified & Dedicated Members'}
            </h2>
            <p className="section-subtitle">
              {isHindi 
                ? 'उत्तर प्रदेश के 75 जनपदों से संगठन से जुड़े समर्पित समाजसेवियों, शिक्षकों, पेशेवरों एवं जागरूक नागरिकों की संक्षिप्त झलक।'
                : 'A showcase of dedicated educators, professionals, social workers, and citizens powering our statewide mutual welfare trust.'}
            </p>
          </div>

          {isLoadingMembers ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <Loader2 size={30} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px', color: '#b45309' }} />
              <p style={{ fontSize: '13px' }}>{isHindi ? 'सदस्य सूची लोड हो रही है...' : 'Loading verified members...'}</p>
            </div>
          ) : featuredMembers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: 12, border: '1px dashed #cbd5e1', color: '#64748b', marginBottom: '32px' }}>
              <Users size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                {isHindi ? 'अभी कोई सत्यापित सदस्य उपलब्ध नहीं है।' : 'No verified members available yet.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 155px), 1fr))', gap: '16px', marginBottom: '32px' }}>
              {featuredMembers.slice(0, 6).map((member) => {
                const categoryLabel = formatCategory(member.category, isHindi)
                const avatar = member.image_url ? getMediaUrl(member.image_url) : null
                return (
                  <div 
                    key={member.id || member.member_code} 
                    className="category-card" 
                    style={{ 
                      padding: '18px 14px', 
                      textAlign: 'center', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      borderRadius: '12px'
                    }}
                  >
                    {/* Member Image Centered in Middle */}
                    <div style={{ 
                      width: 72, 
                      height: 72, 
                      borderRadius: '50%', 
                      overflow: 'hidden', 
                      border: '2.5px solid #b45309', 
                      background: '#f1f5f9', 
                      margin: '0 auto 10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      boxShadow: '0 3px 10px rgba(0,0,0,0.1)' 
                    }}>
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={member.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => {
                            e.target.style.display = 'none'
                            if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div style={{ display: avatar ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#94a3b8' }}>
                        <User size={30} />
                      </div>
                    </div>

                    {/* Category & Verified Badges Below Image */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '2px 7px', borderRadius: 4, fontWeight: 800 }}>
                        {categoryLabel}
                      </span>
                      <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 7px', borderRadius: 4, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <CheckCircle2 size={11} /> {isHindi ? 'सत्यापित' : 'Verified'}
                      </span>
                    </div>

                    {/* Member Name */}
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0c2340', margin: '0 0 4px', lineHeight: 1.3 }}>
                      {member.name}
                    </h3>

                    {/* Occupation */}
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px', lineHeight: 1.3, fontWeight: 500 }}>
                      {member.occupation || member.designation || (isHindi ? 'सत्यापित सदस्य' : 'Verified Member')}
                    </p>

                    {/* Location */}
                    <span style={{ fontSize: '11.5px', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, marginTop: 'auto' }}>
                      <MapPin size={12} style={{ color: '#b45309' }} />
                      {member.district || (isHindi ? 'उत्तर प्रदेश' : 'Uttar Pradesh')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link to={routes.members} className="button button-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>{isHindi ? 'समस्त 75 जनपदों की सदस्य सूची देखें' : 'View Complete 75 Districts Member Directory'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          13. FIELD RELIEF & EVENTS PHOTO GALLERY
          ======================================================== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">
              <Camera size={16} /> {isHindi ? 'चित्र दीर्घा एवं गतिविधियां' : 'Photo Gallery & Field Events'}
            </span>
            <h2 className="section-title">
              {isHindi ? 'सेवा गतिविधियों एवं सम्मान समारोहों की झलकियां' : 'Relief Operations & Event Highlights'}
            </h2>
            <p className="section-subtitle">
              {isHindi 
                ? 'प्रदेश भर में संचालित सहायता वितरण, कन्यादान आशीर्वाद, चिकित्सा संबल एवं जनसेवा शिविरों के छायाचित्र।'
                : 'Photographic documentation of relief disbursements, marriage blessings, and community welfare programs across Uttar Pradesh.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '20px', marginBottom: '32px' }}>
            {staticGalleryItems.map((item) => (
              <div 
                key={item.id}
                style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  height: '240px',
                  background: '#0f172a'
                }}
                onClick={() => setSelectedGalleryImg(item)}
              >
                <img 
                  src={item.image} 
                  alt="Gallery" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                />
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to={routes.gallery} className="button button-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Camera size={16} />
              <span>{isHindi ? 'सम्पूर्ण छायाचित्र गैलरी देखें' : 'Explore Complete Photo Gallery'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          14. FREQUENTLY ASKED QUESTIONS (FAQ)
          ======================================================== */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="section-header">
            <span className="section-eyebrow">
              <HelpCircle size={16} /> FAQ & Guidelines
            </span>
            <h2 className="section-title">
              {isHindi ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)'}
            </h2>
            <p className="section-subtitle">
              {isHindi 
                ? 'संस्था की कार्यप्रणाली, नियम, सदस्यता एवं सहायता प्रक्रिया से जुड़े मुख्य प्रश्न।'
                : 'Answers to common questions about membership, rules, verification, and mutual aid.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqList.slice(0, 5).map((faq, index) => (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === index ? -1 : index)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#0c2340',
                    background: expandedFaq === index ? '#f8fafc' : '#ffffff'
                  }}
                >
                  <span>{faq.q}</span>
                  {expandedFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedFaq === index && (
                  <div style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', lineHeight: 1.7, borderTop: '1px solid #f1f5f9' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Render Digital ID Card Modal if member selected */}
      {selectedMember && (
        <DigitalIdCard
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Render Static Gallery Lightbox Preview Modal (Image Only) */}
      {selectedGalleryImg && (
        <div className="modal-overlay" onClick={() => setSelectedGalleryImg(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', padding: 0, overflow: 'hidden', background: '#000000', borderRadius: '12px', border: 'none' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={selectedGalleryImg.image} 
                alt="Gallery Preview" 
                style={{ width: '100%', maxHeight: '82vh', objectFit: 'contain', display: 'block' }} 
              />
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedGalleryImg(null)} 
                aria-label="Close"
                style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
