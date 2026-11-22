import { FileText, Lock, Shield, ShieldCheck } from 'lucide-react'
import { siteConfig } from '../../config/site'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Legal() {
  const { isHindi } = useLanguage()

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="section-eyebrow">
            <ShieldCheck size={16} /> {isHindi ? 'वैधानिक एवं प्राइवेसी नीतियां' : 'Statutory & Privacy Policies'}
          </span>
          <h1 className="section-title">
            {isHindi ? 'नियम, शर्तें एवं प्राइवेसी पॉलिसी' : 'Terms, Conditions & Privacy Policy'}
          </h1>
          <p className="section-subtitle">
            {isHindi 
              ? `${siteConfig.hindiName} (पंजीकरण सं. ${siteConfig.regNo.split(' ')[0] || '130/2025'}) की विधिक दिशा-निर्देशिका।`
              : `Statutory guidelines and data privacy principles of ${siteConfig.name} (Reg. No. 130/2025).`}
          </p>
        </div>

        <div className="form-card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', marginBottom: 12 }}>
            {isHindi ? '1. गैर-व्यावसायिक एवं गैर-बीमा वैधानिक घोषणा' : '1. Non-Commercial & Non-Insurance Legal Declaration'}
          </h2>
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>
            {isHindi 
              ? `${siteConfig.hindiName} भारतीय ट्रस्ट अधिनियम के अधीन एक पंजीकृत सामाजिक व पारमार्थिक ट्रस्ट है। यह कोई बीमा (Insurance) कंपनी, चिटफंड या बैंकिंग संस्थान नहीं है। यहाँ होने वाला समस्त सहयोग सदस्यों का पारस्परिक, स्वैच्छिक और निस्वार्थ भावनात्मक संबल है।`
              : `${siteConfig.name} is a mutual philanthropic public welfare trust registered under the Indian Trusts Act. It is not an insurance provider, chit-fund, or banking institution. All contributions represent voluntary mutual solidarity among members.`}
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', marginBottom: 12 }}>
            {isHindi ? '2. 100% प्रत्यक्ष DBT एवं शून्य बिचौलिया नीति' : '2. 100% Direct DBT & Zero Intermediary Policy'}
          </h2>
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>
            {isHindi 
              ? 'सहयोग अभियानों में दी जाने वाली समस्त धनराशि सीधे दानदाता द्वारा पीड़ित सदस्य अथवा उनके पंजीकृत नॉमिनी के बैंक खाते में UPI अथवा बैंक ट्रांसफर द्वारा जाती है। संस्था किसी भी प्रकार का मध्यस्थ कमीशन या प्रशासनिक कटौती नहीं करती।'
              : 'All financial assistance raised in relief appeals is transferred directly by donor members into the verified bank account of the beneficiary member or nominee. The Trust applies a strict 0% commission policy.'}
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', marginBottom: 12 }}>
            {isHindi ? '3. गोपनीयता एवं डेटा सुरक्षा नीति (Privacy Policy)' : '3. Confidentiality & Data Privacy Policy'}
          </h2>
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>
            {isHindi 
              ? 'सदस्यों द्वारा पंजीकरण के समय उपलब्ध कराए गए आधार नंबर एवं बैंक खाते की जानकारी पूर्णतः एन्क्रिप्टेड एवं सुरक्षित रहती है। आधार के केवल अंतिम 4 अंक सार्वजनिक पहचान पत्र पर सत्यापन हेतु प्रदर्शित किए जाते हैं। कोई भी व्यक्तिगत डेटा किसी तीसरे पक्ष को व्यावसायिक लाभ हेतु नहीं बेचा जाता।'
              : 'Aadhaar credentials and banking details entered by members are encrypted and securely stored. Only the last 4 digits of Aadhaar are shown for identity verification on Digital Smart Cards. No personal data is commercialized or sold to third parties.'}
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0c2340', marginBottom: 12 }}>
            {isHindi ? '4. विवाद निवारण एवं क्षेत्राधिकार' : '4. Dispute Resolution & Legal Jurisdiction'}
          </h2>
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.8 }}>
            {isHindi 
              ? 'संस्था के किसी भी नियम, सदस्यता अथवा सहयोग प्रक्रिया से संबंधित किसी भी विवाद का अंतिम निर्णय संस्था के लखनऊ स्थित संरक्षक मंडल एवं विधिक सलाहकार समिति द्वारा मान्य होगा। समस्त विधिक मामलों का न्यायिक क्षेत्राधिकार केवल लखनऊ न्यायालय रहेगा।'
              : 'Any disputes arising out of membership, by-laws, or relief appeals are subject to the final decision of the Patron Board and Legal Cell in Lucknow. The judicial jurisdiction for all matters is exclusively Lucknow Courts.'}
          </p>
        </div>
      </div>
    </div>
  )
}
