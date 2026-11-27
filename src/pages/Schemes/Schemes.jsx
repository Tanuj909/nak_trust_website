import { ArrowRight, CheckCircle2, Gift, GraduationCap, HandHeart, Heart, ShieldAlert, Stethoscope, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { routes } from '../../config/routes'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Schemes() {
  const { isHindi } = useLanguage()

  const schemesList = [
    {
      id: 'death',
      title: isHindi ? 'दिवंगत सदस्य आश्रित सहायता योजना' : 'Untimely Demise Bereavement Relief Scheme',
      subtitle: isHindi ? 'आकस्मिक निधन पर आश्रितों को ₹50 लाख से ₹1 करोड़ तक का प्रत्यक्ष आर्थिक संबल' : 'Direct economic relief of ₹50 Lakhs to ₹1 Crore to dependents upon untimely demise',
      icon: ShieldAlert,
      color: '#b91c1c',
      bg: '#fee2e2',
      details: isHindi ? [
        'सदस्यता ग्रहण करने के न्यूनतम 90 दिन पूर्ण होने के उपरांत यह सहायता अनुमन्य होती है।',
        'आकस्मिक निधन पर परिवार/नॉमिनी को किसी कार्यालय के चक्कर नहीं काटने पड़ते; जिला टीम स्वयं घर जाकर सत्यापन करती है।',
        'प्रदेश भर के लाखों सदस्य सीधे नॉमिनी के अधिकृत बैंक खाते में ₹50 से ₹1000 तक की सहयोग राशि भेजते हैं।',
        '100% पारदर्शी प्रत्यक्ष DBT प्रणाली, जिसमें 0% कमीशन नीति लागू है।'
      ] : [
        'Assistance matures after a 90-day cooling period post verified registration.',
        'No bureaucracy: local district squad visits nominee\'s home for inquiry and documentation within 48 hours.',
        'Lakhs of active members transfer direct aid of ₹50 to ₹1000 directly into nominee\'s verified bank account.',
        '100% Direct Bank Transfer (DBT) model operating on strict 0% intermediary fee.'
      ],
      actionText: isHindi ? 'आश्रित सहायता आवेदन करें' : 'Apply for Demise Relief',
      actionLink: `${routes.applications}?scheme=death`
    },
    {
      id: 'kanyadaan',
      title: isHindi ? 'कन्यादान महाभियान योजना' : 'Kanyadaan Daughter Marriage Grant Scheme',
      subtitle: isHindi ? 'सक्रिय सदस्यों की सुपुत्रियों के शुभ विवाह पर सम्मानजनक उपहार व आर्थिक सहयोग' : 'Respectful wedding grant and mutual blessing on marriage of member daughters',
      icon: Gift,
      color: '#b45309',
      bg: '#fef3c7',
      details: isHindi ? [
        'न्यूनतम 1 वर्ष की सक्रिय सदस्यता पूर्ण करने वाले सदस्य अपनी पुत्री के विवाह हेतु पात्र हैं।',
        'विवाह से न्यूनतम 30 दिन पूर्व ऑनलाइन पोर्टल पर शादी का कार्ड व विवरण अपलोड करना आवश्यक है।',
        'विवाह में स्थानीय जिला कार्यकारिणी को औपचारिक निमंत्रण देना अनिवार्य है; जिला टीम विवाह में पहुंचकर शुभकामनाएं व उपहार सौंपती है।',
        'लाखों साथियों द्वारा कन्यादान स्वरूप मंगल आशीर्वाद और आर्थिक संबल सीधे सदस्य के खाते में भेजा जाता है।'
      ] : [
        'Members with at least 1 year of continuous active membership are eligible.',
        'Application with wedding card must be submitted on the portal at least 30 days prior.',
        'Official invitation to local district squad is mandatory; officers attend in person to convey wishes.',
        'Mutual gifts and wedding grants from statewide brethren are transferred directly to member bank account.'
      ],
      actionText: isHindi ? 'कन्यादान सहायता आवेदन करें' : 'Apply for Kanyadaan Aid',
      actionLink: `${routes.applications}?scheme=kanyadaan`
    },
    {
      id: 'medical',
      title: isHindi ? 'संजीवनी गंभीर बीमारी चिकित्सा सहायता' : 'Sanjeevani Critical Medical Treatment Aid',
      subtitle: isHindi ? 'कैंसर, किडनी प्रत्यारोपण, ओपन हार्ट सर्जरी एवं गंभीर दुर्घटनाओं में जीवन रक्षक सहयोग' : 'Lifesaving financial aid for cancer, organ transplants, cardiac surgeries & trauma',
      icon: Stethoscope,
      color: '#047857',
      bg: '#ecfdf5',
      details: isHindi ? [
        'जानलेवा बीमारियों एवं आकस्मिक दुर्घटनाओं में त्वरित चिकित्सीय राहत उपलब्ध कराई जाती है।',
        'अस्पताल के वरिष्ठ चिकित्सक का प्रमाण पत्र एवं अनुमानित बिलों का सत्यापन जिला मेडिकल कमेटी द्वारा किया जाता है।',
        'प्राप्त सहायता सीधे अस्पताल अथवा सदस्य के खाते में जीवन रक्षक उपचार हेतु प्रेषित की जाती है।'
      ] : [
        'Emergency relief provided for life-threatening medical conditions and trauma accidents.',
        'Medical credentials and estimates verified on-site by district medical advisory committee.',
        'Direct disbursement made to the hospital or member for immediate lifesaving interventions.'
      ],
      actionText: isHindi ? 'चिकित्सा सहायता आवेदन करें' : 'Apply for Medical Aid',
      actionLink: `${routes.applications}?scheme=medical`
    }
  ]

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="section-eyebrow">
            <HandHeart size={16} /> {isHindi ? 'जनकल्याणकारी महा-अभियान' : 'Core Welfare Schemes'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'संस्था की प्रमुख योजनाएं एवं दिशा-निर्देश' : 'Official Welfare Schemes & Guidelines'}
          </h1>
          <p className="section-subtitle">
            {isHindi 
              ? 'विपत्ति में कोई परिवार अकेला न रहे, इसी उद्देश्य से संचालित संस्था की सभी प्रमुख कल्याणकारी योजनाएं।'
              : 'Empowering families with unconditional solidarity: explore our core mutual protection schemes.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {schemesList.map((scheme) => {
            const Icon = scheme.icon
            return (
              <div key={scheme.id} className="category-card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: scheme.bg, color: scheme.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon size={28} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0c2340', marginBottom: 4 }}>
                      {scheme.title}
                    </h2>
                    <p style={{ fontSize: '13.5px', color: '#b45309', fontWeight: 700 }}>
                      {scheme.subtitle}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0 24px' }}>
                  {scheme.details.map((detail, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: '#047857', marginTop: 3 }}>
                        <CheckCircle2 size={16} />
                      </span>
                      <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
                  <Link to={scheme.actionLink} className="button button-gold">
                    {scheme.actionText} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
