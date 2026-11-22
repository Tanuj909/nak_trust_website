import { Award, Building, CheckCircle2, Globe, HeartHandshake, Landmark, Lock, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { routes } from '../../config/routes'
import { siteConfig } from '../../config/site'
import { useLanguage } from '../../i18n/LanguageContext'

export default function About() {
  const { isHindi } = useLanguage()

  return (
    <div className="section section-alt" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="section-eyebrow">
            <Landmark size={16} /> {isHindi ? 'संस्था परिचय एवं ध्येय' : 'About Organization & Vision'}
          </span>
          <h1 className="section-title">
            {isHindi ? `${siteConfig.hindiName} के बारे में` : `About ${siteConfig.name}`}
          </h1>
          <p className="section-subtitle">
            {isHindi 
              ? `उत्तर प्रदेश शासन में पंजीकृत एक स्वायत्त, गैर-राजनीतिक एवं पारदर्शी सामाजिक कल्याण ट्रस्ट (पंजीकरण सं. ${siteConfig.regNo.split(' ')[0] || '130/2025'})।`
              : `An autonomous, non-political, transparent social welfare trust registered under Indian Trusts Act (Reg. No. 130/2025).`}
          </p>
        </div>

        <div className="form-card" style={{ padding: '36px', marginBottom: 28 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0c2340', marginBottom: 14 }}>
            {isHindi ? 'हमारा वैधानिक स्वरूप एवं उत्पत्ति' : 'Our Statutory Identity & Origin'}
          </h2>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.8, marginBottom: 16 }}>
            {isHindi
              ? `${siteConfig.hindiName} (NAK Trust ORG / National Self Care Team) की स्थापना उत्तर प्रदेश एवं भारत भर के कर्मचारियों, शिक्षकों, संविदाकर्मियों, प्राइवेट कर्मियों और आम नागरिकों को आकस्मिक विपत्ति में गरिमापूर्ण सामाजिक व आर्थिक सुरक्षा प्रदान करने के उद्देश्य से की गई है।`
              : `${siteConfig.name} (NAK Trust ORG) was established to provide dignified economic and social security to teachers, employees, contractual staff, private professionals, and citizens of Uttar Pradesh and across India during unforeseen life tragedies.`}
          </p>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>
            {isHindi
              ? 'प्रायः देखा जाता है कि जब किसी परिवार के एकमात्र कमाऊ सदस्य का असमय निधन हो जाता है, तो परिवार आर्थिक रूप से टूट जाता है और बच्चों का भविष्य अंधकारमय हो जाता है। संस्था ने एक ऐसा अभूतपूर्व पारस्परिक संबल मंच तैयार किया है, जहाँ लाखों साथी मिलकर मात्र ₹50 या ₹100 का प्रत्यक्ष सहयोग भेजकर पीड़ित परिवार को ₹50 लाख से ₹1 करोड़ तक की आर्थिक ताकत प्रदान करते हैं।'
              : 'Often when the sole breadwinner of a family passes away prematurely, the family faces immense financial vulnerability. Our organization pioneered an extraordinary mutual solidarity platform where hundreds of thousands of members contribute ₹50 to ₹100 directly to the nominee, empowering the bereaved family with ₹50 Lakhs to ₹1 Crore in direct economic protection.'}
          </p>

          <div style={{ background: '#fef3c7', borderLeft: '4px solid #b45309', padding: '16px 20px', borderRadius: '0 8px 8px 0', fontSize: '14px', color: '#92400e', fontWeight: 700, margin: '20px 0' }}>
            "{isHindi ? 'सेवा परमो धर्मः • हम सबका, हम सबके लिए, हम सबके द्वारा' : 'Service is Supreme Virtue • Of All, For All, By All'}"
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 36 }}>
          <div className="category-card" style={{ padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ecfdf5', color: '#047857', display: 'grid', placeItems: 'center', marginBottom: 12 }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0c2340', marginBottom: 6 }}>
              {isHindi ? '100% प्रत्यक्ष DBT अंतरण' : '100% Direct DBT Transfers'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              {isHindi
                ? 'संस्था किसी भी प्रकार का मध्यस्थता खाता नहीं रखती। सहयोग राशि सीधे दानदाता के खाते से पीड़ित परिवार के नॉमिनी के खाते में अंतरित होती है।'
                : 'The Trust maintains 0% intermediary commission. Relief amounts transfer directly from donor bank accounts to nominee accounts.'}
            </p>
          </div>

          <div className="category-card" style={{ padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#dbeafe', color: '#1e40af', display: 'grid', placeItems: 'center', marginBottom: 12 }}>
              <Globe size={24} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0c2340', marginBottom: 6 }}>
              {isHindi ? 'समस्त 75 जिलों में संगठनात्मक तंत्र' : 'Network Across All 75 Districts'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              {isHindi
                ? 'उत्तर प्रदेश के प्रत्येक जनपद और ब्लॉक स्तर पर समर्पित पदाधिकारियों की टीम है, जो 48 घंटे में स्थलीय जांच और सहायता सत्यापन का कार्य करती है।'
                : 'Active district squads and block coordinators in all 75 UP districts complete physical field inquiries within 48 hours.'}
            </p>
          </div>

          <div className="category-card" style={{ padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', marginBottom: 12 }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0c2340', marginBottom: 6 }}>
              {isHindi ? 'समावेशी चार संवर्ग (A, B, C, D)' : 'Four Inclusive Categories (A, B, C, D)'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              {isHindi
                ? 'सरकारी, प्राइवेट, पेशेवर और आम नागरिक—समाज के सभी वर्गों को बिना किसी भेदभाव के एक सूत्र में बांधने वाला निष्पक्ष सामाजिक संबल मंच।'
                : 'Uniting government employees, private staff, professionals, and citizens into one seamless community of mutual assistance.'}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to={routes.registration} className="button button-gold button-large">
            {isHindi ? 'आज ही सदस्यता ग्रहण करें →' : 'Join Membership Today →'}
          </Link>
        </div>
      </div>
    </div>
  )
}
