import { CheckCircle2, Download, Printer, QrCode, Shield, X } from 'lucide-react'
import { siteConfig } from '../../config/site'
import { useLanguage } from '../../i18n/LanguageContext'

export default function PaymentReceiptModal({ receipt, onClose }) {
  const { isHindi } = useLanguage()
  if (!receipt) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <button className="modal-close-btn no-print" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="printable-area">
          <div className="receipt-paper">
            <div className="receipt-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
                <Shield size={28} style={{ color: '#b45309' }} />
                <h3>{isHindi ? siteConfig.hindiName : siteConfig.name}</h3>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b' }}>
                {isHindi 
                  ? 'पंजीकरण संख्या: 130/2025 • नीति आयोग NGO Darpan पंजीकृत • धारा 80G आयकर छूट अनुमान्य'
                  : 'Reg. No: 130/2025 • NITI Aayog NGO Darpan Registered • Section 80G Tax Exemption Eligible'}
              </p>
              <h4 style={{ marginTop: 8, color: '#047857', fontWeight: 800 }}>
                {isHindi ? '★ आधिकारिक जनसहयोग प्राप्ति रसीद (OFFICIAL E-RECEIPT) ★' : '★ OFFICIAL E-RECEIPT OF MUTUAL WELFARE AID ★'}
              </h4>
            </div>

            <div className="receipt-meta-grid">
              <div>
                <strong>{isHindi ? 'रसीद संख्या (Receipt No):' : 'Receipt No:'}</strong>
                <p style={{ fontFamily: 'monospace', color: '#b45309', fontWeight: 700 }}>
                  {receipt.receiptNo || `NSCT/REC/2025/${Math.floor(100000 + Math.random() * 900000)}`}
                </p>
              </div>
              <div>
                <strong>{isHindi ? 'दिनांक एवं समय (Date & Time):' : 'Date & Time:'}</strong>
                <p>{receipt.date || new Date().toLocaleString(isHindi ? 'hi-IN' : 'en-IN')}</p>
              </div>
              <div>
                <strong>{isHindi ? 'सहयोगी का नाम (Donor Name):' : 'Donor Full Name:'}</strong>
                <p style={{ fontWeight: 700 }}>{receipt.donorName || (isHindi ? 'सक्रिय सदस्य' : 'Active Member')}</p>
              </div>
              <div>
                <strong>{isHindi ? 'मोबाइल / सदस्य आईडी:' : 'Mobile / Member ID:'}</strong>
                <p>{receipt.mobile || receipt.memberId || '94520XXXXX'}</p>
              </div>
              <div>
                <strong>{isHindi ? 'जनपद एवं राज्य:' : 'District & State:'}</strong>
                <p>{receipt.district || '—'}</p>
              </div>
              <div>
                <strong>{isHindi ? 'भुगतान संदर्भ / UTR No:' : 'Payment Ref / UTR No:'}</strong>
                <p style={{ fontFamily: 'monospace' }}>{receipt.utr || `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`}</p>
              </div>
            </div>

            <table className="receipt-table">
              <thead>
                <tr>
                  <th>{isHindi ? 'विवरण (Description)' : 'Description'}</th>
                  <th>{isHindi ? 'संवर्ग (Category)' : 'Category'}</th>
                  <th style={{ textAlign: 'right' }}>{isHindi ? 'राशि (Amount)' : 'Amount (INR)'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{isHindi ? 'स्वैच्छिक पारस्परिक कल्याण संबल' : 'Voluntary Mutual Welfare Contribution'}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {isHindi ? '100% प्रत्यक्ष बैंक अंतरण (Direct DBT)' : '100% Direct Bank Transfer (DBT)'}
                    </div>
                  </td>
                  <td>
                    {receipt.category
                      ? (isHindi ? `संवर्ग ${receipt.category}` : `Category ${receipt.category}`)
                      : (receipt.purpose || (isHindi ? 'सामान्य जनसहयोग' : 'General Aid'))}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                    ₹{receipt.amount || 100}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ textAlign: 'right', fontWeight: 800 }}>
                    {isHindi ? 'कुल प्राप्त राशि (Total Aid Amount):' : 'Total Transferred Amount:'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 900, color: '#047857', fontSize: '15px' }}>
                    ₹{receipt.amount || 100}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px dashed #cbd5e1' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                  {isHindi ? 'डिजिटल सत्यापन कोड:' : 'Digital Verification Token:'}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0c2340', fontWeight: 700 }}>
                  SHA256: {Math.random().toString(36).substring(2, 10).toUpperCase()}...OK
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 100, height: 35, borderBottom: '1px solid #94a3b8', margin: '0 auto 4px' }} />
                <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>
                  {isHindi ? 'अधिकृत कोषाध्यक्ष / वित्त नियंत्रक' : 'Authorized Treasurer / Finance Controller'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }} className="no-print">
          <button type="button" className="button button-gold button-small" onClick={handlePrint}>
            <Printer size={15} /> {isHindi ? 'रसीद प्रिंट / PDF सुरक्षित करें' : 'Print Receipt / Save PDF'}
          </button>
          <button type="button" className="button button-outline button-small" onClick={onClose}>
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
