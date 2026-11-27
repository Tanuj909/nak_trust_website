import { Award, CheckCircle, Download, Loader2, Printer, QrCode, Shield, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { siteConfig } from '../../config/site'
import { useLanguage } from '../../i18n/LanguageContext'

const categoryMap = {
  A: 'संवर्ग A (Government)',
  B: 'संवर्ग B (Private)',
  C: 'संवर्ग C (Professional)',
  D: 'संवर्ग D (Others)',
}

function drawDefaultAvatar(ctx, x, y, w, h, r = 8) {
  ctx.save()
  ctx.beginPath()
  roundRect(ctx, x, y, w, h, r)
  ctx.clip()

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(x, y, w, h)
  const cx = x + w / 2
  // head
  ctx.fillStyle = '#94a3b8'
  ctx.beginPath()
  ctx.arc(cx, y + h * 0.38, w * 0.24, 0, Math.PI * 2)
  ctx.fill()
  // shoulders
  ctx.beginPath()
  ctx.arc(cx, y + h * 0.98, w * 0.46, Math.PI, 0)
  ctx.fill()
  ctx.restore()
}

function drawImageCover(ctx, img, x, y, w, h, r = 8) {
  ctx.save()
  ctx.beginPath()
  roundRect(ctx, x, y, w, h, r)
  ctx.clip()

  const imgRatio = img.width / img.height
  const boxRatio = w / h
  let sx, sy, sw, sh
  if (imgRatio > boxRatio) {
    sh = img.height
    sw = img.height * boxRatio
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = img.width / boxRatio
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  ctx.restore()
}

function drawBarcode(ctx, x, y, w, h, text) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)

  const seed = (text || 'NSCT2026').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const barCount = 38
  const barStep = (w - 16) / barCount
  let curX = x + 8

  ctx.fillStyle = '#0c2340'
  for (let i = 0; i < barCount; i++) {
    const val = (seed * (i + 1) * 37) % 11
    if (val > 2) {
      const barW = val > 8 ? 3.5 : val > 5 ? 2.2 : 1.2
      ctx.fillRect(curX, y + 4, barW, h - 8)
    }
    curX += barStep
  }
}

function fitText(ctx, text, maxWidth) {
  if (!text) return ''
  if (ctx.measureText(text).width <= maxWidth) return text
  let truncated = text
  while (truncated.length > 3 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1)
  }
  return truncated + '...'
}

function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
  }
}

function generateCardCanvas(member, isHindi) {
  return new Promise((resolve) => {
    // Standard ISO/IEC 7810 ID-1 (CR80) ratio: 85.60mm x 53.98mm = 1.58577
    const width = 856
    const height = 540
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    // 1. Transparent background: clear canvas for alpha outside rounded corners
    ctx.clearRect(0, 0, width, height)

    // 2. Card Outer Rounded Rectangle
    const cardRadius = 20
    const cardW = width
    const cardH = height
    const x = 0
    const y = 0

    ctx.save()
    ctx.beginPath()
    roundRect(ctx, x, y, cardW, cardH, cardRadius)
    ctx.closePath()

    // Clip so all drawing stays cleanly inside the card's rounded borders
    ctx.clip()

    // Card background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, cardW, cardH)
    bgGrad.addColorStop(0, '#ffffff')
    bgGrad.addColorStop(0.55, '#f8fafc')
    bgGrad.addColorStop(1, '#f1f5f9')
    ctx.fillStyle = bgGrad
    ctx.fill()

    // 3. Top Tricolor Strip
    const stripH = 6
    const stripW = cardW / 3
    ctx.fillStyle = '#ff9933'
    ctx.fillRect(0, 0, stripW, stripH)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(stripW, 0, stripW, stripH)
    ctx.fillStyle = '#138808'
    ctx.fillRect(stripW * 2, 0, stripW, stripH)

    // 4. Header Bar
    const headerH = 68
    const headerY = stripH
    const headerGrad = ctx.createLinearGradient(0, headerY, cardW, headerY + headerH)
    headerGrad.addColorStop(0, '#0c2340')
    headerGrad.addColorStop(1, '#1e3a8a')
    ctx.fillStyle = headerGrad
    ctx.fillRect(0, headerY, cardW, headerH)

    // Header Emblem
    const emblemCx = 46
    const emblemCy = headerY + headerH / 2
    ctx.beginPath()
    ctx.arc(emblemCx, emblemCy, 22, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.strokeStyle = '#b45309'
    ctx.lineWidth = 2
    ctx.stroke()

    // Shield graphic in emblem
    ctx.fillStyle = '#0c2340'
    ctx.beginPath()
    ctx.moveTo(emblemCx, emblemCy - 13)
    ctx.lineTo(emblemCx + 12, emblemCy - 6)
    ctx.lineTo(emblemCx + 12, emblemCy + 5)
    ctx.quadraticCurveTo(emblemCx, emblemCy + 14, emblemCx, emblemCy + 14)
    ctx.quadraticCurveTo(emblemCx, emblemCy + 14, emblemCx - 12, emblemCy + 5)
    ctx.lineTo(emblemCx - 12, emblemCy - 6)
    ctx.closePath()
    ctx.fill()

    // Header Titles
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 21px "Noto Sans", "Segoe UI", Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('राष्ट्रीय समाज कल्याण ट्रस्ट (NSCT)', emblemCx + 34, headerY + 24)

    ctx.fillStyle = '#fde68a'
    ctx.font = 'bold 13.5px monospace'
    ctx.fillText(`सदस्य आईडी: ${member.id || 'NSCT'} • डिजिटल स्मार्ट पहचान पत्र`, emblemCx + 34, headerY + 48)

    // 5. Body: Left Column (Photo & Security Barcode)
    const photoX = 26
    const photoY = headerY + headerH + 14
    const photoW = 192
    const photoH = 246

    const finishCardDrawing = () => {
      // Photo rounded border
      ctx.save()
      ctx.beginPath()
      roundRect(ctx, photoX, photoY, photoW, photoH, 8)
      ctx.strokeStyle = '#0c2340'
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.restore()

      // Security / Barcode Box below photo
      const secY = photoY + photoH + 12
      const secW = photoW
      const secH = 120

      // Barcode container box
      ctx.save()
      ctx.beginPath()
      roundRect(ctx, photoX, secY, secW, secH, 8)
      ctx.fillStyle = '#f8fafc'
      ctx.fill()
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      // Draw simulated Barcode
      drawBarcode(ctx, photoX + 6, secY + 8, secW - 12, 36, member.id)

      // Member ID text under barcode
      ctx.fillStyle = '#0c2340'
      ctx.font = 'bold 12.5px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(member.id || 'NSCT-MEMBER', photoX + secW / 2, secY + 58)

      // Security Pill under Member ID
      const pillW = secW - 20
      const pillH = 28
      const pillX = photoX + 10
      const pillY = secY + 76
      ctx.save()
      ctx.beginPath()
      roundRect(ctx, pillX, pillY, pillW, pillH, 6)
      ctx.fillStyle = '#ecfdf5'
      ctx.fill()
      ctx.strokeStyle = '#a7f3d0'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      ctx.fillStyle = '#047857'
      ctx.font = 'bold 11px "Noto Sans", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(isHindi ? '✓ NSCT सत्यापित सदस्य' : '✓ NSCT SECURE ID', photoX + secW / 2, pillY + pillH / 2)

      // 6. Right Column (Member Details) - Key-Value layout (No stretching!)
      const detailsX = photoX + photoW + 28
      const detailsW = cardW - detailsX - 26
      const labelColX = detailsX + 6
      const valColX = detailsX + 172
      const valMaxW = detailsW - 180
      const startY = headerY + headerH + 24
      const rowGap = 41

      const rows = [
        { label: isHindi ? 'सदस्य का नाम:' : 'Member Name:', val: member.name || (isHindi ? 'सत्यापित सदस्य' : 'Verified Member'), color: '#0c2340', isBold: true },
        { label: isHindi ? 'पिता/पति का नाम:' : 'Father/Husband:', val: member.fatherHusband || (isHindi ? 'उपलब्ध नहीं' : 'N/A'), color: '#1e293b' },
        { label: isHindi ? 'सदस्यता आईडी:' : 'Member ID:', val: member.id || 'NSCT-MEMBER', color: '#b45309', isMono: true, isBold: true },
        { label: isHindi ? 'सदस्यता संवर्ग:' : 'Category:', val: member.categoryName || categoryMap[String(member.category).toUpperCase()] || (isHindi ? `संवर्ग ${member.category || 'A'}` : `Category ${member.category || 'A'}`), color: '#1e40af', isBold: true },
        { label: isHindi ? 'जनपद / ब्लॉक:' : 'District / Block:', val: `${member.district || (isHindi ? 'उत्तर प्रदेश' : 'Uttar Pradesh')}${member.block ? ` (${member.block})` : ''}`, color: '#1e293b' },
        { label: isHindi ? 'रक्त समूह:' : 'Blood Group:', val: member.bloodGroup || 'O+', color: '#dc2626', isBold: true },
        { label: isHindi ? 'नामांकित नॉमिनी:' : 'Nominee:', val: `${member.nomineeName || '—'}${member.nomineeRelation ? ` (${member.nomineeRelation})` : ''}`, color: '#1e293b' },
        { label: isHindi ? 'सदस्यता स्थिति:' : 'Status:', val: `✓ ${member.status || (isHindi ? 'सत्यापित सदस्य (Active)' : 'Verified Active Member')}`, color: '#059669', isBold: true }
      ]

      rows.forEach((row, i) => {
        const curY = startY + i * rowGap

        // Label (left aligned in label column)
        ctx.fillStyle = '#475569'
        ctx.font = '600 14px "Noto Sans", "Segoe UI", Arial, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(row.label, labelColX, curY)

        // Value (left aligned starting right next to label column - NOT stretched across!)
        ctx.fillStyle = row.color || '#0f172a'
        ctx.font = `${row.isBold ? 'bold' : '600'} ${row.isMono ? '15.5px monospace' : '15px'} "Noto Sans", "Segoe UI", Arial, sans-serif`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        const fittedVal = fitText(ctx, row.val, valMaxW)
        ctx.fillText(fittedVal, valColX, curY)

        // Clean subtle dashed line connecting the row
        if (i < rows.length - 1) {
          ctx.beginPath()
          ctx.setLineDash([4, 4])
          ctx.strokeStyle = '#e2e8f0'
          ctx.lineWidth = 1
          ctx.moveTo(detailsX, curY + 16)
          ctx.lineTo(detailsX + detailsW, curY + 16)
          ctx.stroke()
          ctx.setLineDash([])
        }
      })

      // Verification Micro-Note below detail rows
      const noteY = startY + (rows.length - 1) * rowGap + 28
      ctx.fillStyle = '#64748b'
      ctx.font = 'italic 11px "Noto Sans", sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        isHindi 
          ? 'यह कार्ड राष्ट्रीय समाज कल्याण ट्रस्ट द्वारा अधिकृत डिजिटल पहचान पत्र है।' 
          : 'Authorized Digital Identity Card issued by National Self Care Team.',
        labelColX,
        noteY
      )

      // Validity / Trust tagline
      ctx.fillStyle = '#0c2340'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(
        isHindi 
          ? 'वैधता: आजीवन (Lifetime) • National Social Care Team & Welfare Trust' 
          : 'Validity: Lifetime • National Social Care Team & Welfare Trust',
        labelColX,
        noteY + 17
      )

      // 7. Footer Bar
      const footerH = 54
      const footerY = cardH - footerH
      ctx.fillStyle = '#f1f5f9'
      ctx.fillRect(0, footerY, cardW, footerH)
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, footerY)
      ctx.lineTo(cardW, footerY)
      ctx.stroke()

      // Footer QR box
      const qrX = 26
      const qrY = footerY + 9
      ctx.fillStyle = '#0c2340'
      ctx.fillRect(qrX, qrY, 36, 36)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX + 6, qrY + 6, 24, 24)
      ctx.fillStyle = '#0c2340'
      ctx.fillRect(qrX + 11, qrY + 11, 14, 14)

      // Footer Text on Left
      ctx.fillStyle = '#0c2340'
      ctx.font = 'bold 13px "Noto Sans", "Segoe UI", Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(isHindi ? 'डिजिटल सत्यापित पहचान पत्र' : 'Digitally Verified Smart ID', qrX + 46, footerY + 20)
      ctx.fillStyle = '#64748b'
      ctx.font = '11.5px monospace'
      ctx.fillText('nsctup.com/verify • ISO/IEC 7810 ID-1 Standard', qrX + 46, footerY + 38)

      // Hologram Seal on Right
      const badgeX = cardW - 38
      const badgeY = footerY + footerH / 2
      const badgeGrad = ctx.createRadialGradient(badgeX, badgeY, 2, badgeX, badgeY, 18)
      badgeGrad.addColorStop(0, '#fef3c7')
      badgeGrad.addColorStop(0.7, '#d97706')
      badgeGrad.addColorStop(1, '#92400e')
      ctx.beginPath()
      ctx.arc(badgeX, badgeY, 18, 0, Math.PI * 2)
      ctx.fillStyle = badgeGrad
      ctx.fill()
      ctx.strokeStyle = '#b45309'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('★ NSCT', badgeX, badgeY)

      // Verification label to left of seal
      ctx.fillStyle = '#0c2340'
      ctx.font = 'bold 11px "Noto Sans", sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(isHindi ? 'सत्यापित अभिलेख (Govt. Regd.)' : 'Govt. Registered Trust', badgeX - 26, footerY + 20)
      ctx.fillStyle = '#64748b'
      ctx.font = '10.5px "Noto Sans", sans-serif'
      ctx.fillText(isHindi ? 'उत्तर प्रदेश, भारत' : 'Uttar Pradesh, India', badgeX - 26, footerY + 38)

      // 8. Outer Gold Border around card perimeter
      ctx.restore() // restore clipping
      ctx.beginPath()
      roundRect(ctx, 0, 0, cardW, cardH, cardRadius)
      ctx.strokeStyle = '#b45309'
      ctx.lineWidth = 3
      ctx.stroke()

      resolve(canvas)
    }

    // Load member photo if available
    if (member.avatar) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          drawImageCover(ctx, img, photoX, photoY, photoW, photoH, 8)
        } catch {
          drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH, 8)
        }
        finishCardDrawing()
      }
      img.onerror = () => {
        drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH, 8)
        finishCardDrawing()
      }
      img.src = member.avatar
    } else {
      drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH, 8)
      finishCardDrawing()
    }
  })
}

let activePrintCardId = null
const printListeners = new Set()

function setActivePrintCard(id) {
  activePrintCardId = id
  printListeners.forEach((fn) => {
    try {
      fn(activePrintCardId)
    } catch {
      // ignore
    }
  })
}

export default function DigitalIdCard({ member, onClose, isInline = false }) {
  const { isHindi } = useLanguage()
  const [isDownloading, setIsDownloading] = useState(false)
  const [instanceId] = useState(() => Math.random().toString(36).substring(2, 9))
  const [activeId, setActiveId] = useState(activePrintCardId)

  useEffect(() => {
    const handleActiveChange = (newActiveId) => {
      setActiveId(newActiveId)
    }
    printListeners.add(handleActiveChange)

    // Modal instances ALWAYS take priority over inline cards
    if (!isInline) {
      setActivePrintCard(instanceId)
    } else {
      if (!activePrintCardId) {
        setActivePrintCard(instanceId)
      }
    }

    const handleBeforePrint = () => {
      document.body.classList.add('printing-id-card')
    }
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-id-card')
    }

    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)

    return () => {
      printListeners.delete(handleActiveChange)
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
      document.body.classList.remove('printing-id-card')
      if (activePrintCardId === instanceId) {
        setActivePrintCard(null)
      }
    }
  }, [instanceId, isInline])

  // Re-claim active status for inline card if modal is closed
  useEffect(() => {
    if (isInline && !activeId) {
      setActivePrintCard(instanceId)
    }
  }, [isInline, activeId, instanceId])

  if (!member) return null

  const handlePrint = () => {
    setActivePrintCard(instanceId)
    document.body.classList.add('printing-id-card')
    window.print()
  }

  const handleDownloadPng = async () => {
    setIsDownloading(true)
    try {
      const canvas = await generateCardCanvas(member, isHindi)
      canvas.toBlob((blob) => {
        if (!blob) {
          setIsDownloading(false)
          return
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const safeId = (member.id || 'Card').toString().replace(/[^a-zA-Z0-9_-]/g, '_')
        link.download = `Smart-ID-${safeId}.png`
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        setIsDownloading(false)
      }, 'image/png')
    } catch (err) {
      console.error('Failed to download ID card as PNG:', err)
      setIsDownloading(false)
    }
  }

  const cardInner = (
    <div className="digital-id-card">
      <div className="id-card-top-strip" />
      <div className="id-card-header">
        <div className="id-card-emblem">
          <Shield size={20} />
        </div>
        <div className="id-card-header-titles">
          <h4>{isHindi ? siteConfig.hindiName : siteConfig.name}</h4>
          <small style={{ color: '#fde68a', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.4px' }}>
            {isHindi 
              ? `सदस्य आईडी: ${member.id} • डिजिटल पहचान पत्र`
              : `Member ID: ${member.id} • Digital Smart ID Card`}
          </small>
        </div>
      </div>

      <div className="id-card-body">
        <div className="id-card-photo-box">
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} />
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#94a3b8' }}>
              <Shield size={36} />
            </div>
          )}
        </div>

        <div className="id-card-details">
          <div className="id-card-detail-row">
            <span>{isHindi ? 'सदस्य का नाम:' : 'Member Name:'}</span>
            <strong>{member.name}</strong>
          </div>
          <div className="id-card-detail-row">
            <span>{isHindi ? 'पिता/पति का नाम:' : 'Father/Husband:'}</span>
            <strong>{member.fatherHusband || (isHindi ? 'उपलब्ध नहीं' : 'N/A')}</strong>
          </div>
          <div className="id-card-detail-row">
            <span>{isHindi ? 'सदस्यता आईडी:' : 'Member ID:'}</span>
            <strong style={{ color: '#b45309', fontFamily: 'monospace' }}>{member.id}</strong>
          </div>
          <div className="id-card-detail-row">
            <span>{isHindi ? 'सदस्यता संवर्ग:' : 'Category:'}</span>
            <strong style={{ color: '#1e40af' }}>
              {member.categoryName || categoryMap[String(member.category).toUpperCase()] || `संवर्ग ${member.category}`}
            </strong>
          </div>
          <div className="id-card-detail-row">
            <span>{isHindi ? 'जनपद / ब्लॉक:' : 'District / Block:'}</span>
            <strong>{member.district} ({member.block || (isHindi ? 'सदर' : 'Sadar')})</strong>
          </div>
          <div className="id-card-detail-row">
            <span>{isHindi ? 'रक्त समूह:' : 'Blood Group:'}</span>
            <strong style={{ color: '#dc2626' }}>{member.bloodGroup || 'O+'}</strong>
          </div>
          <div className="id-card-detail-row">
            <span>{isHindi ? 'नामांकित नॉमिनी:' : 'Nominee:'}</span>
            <strong>{member.nomineeName} ({member.nomineeRelation || (isHindi ? 'पत्नी' : 'Wife')})</strong>
          </div>
          <div className="id-card-detail-row" style={{ border: 'none' }}>
            <span>{isHindi ? 'स्थिति:' : 'Status:'}</span>
            <span style={{ color: '#059669', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={13} /> {member.status || (isHindi ? 'सत्यापित सदस्य' : 'Verified Member')}
            </span>
          </div>
        </div>
      </div>

      <div className="id-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <QrCode size={24} style={{ color: '#0f172a' }} />
          <div>
            <span style={{ display: 'block', fontWeight: 700 }}>
              {isHindi ? 'डिजिटल सत्यापित' : 'Digitally Verified'}
            </span>
            <small style={{ color: '#64748b' }}>nsctup.com/verify</small>
          </div>
        </div>
        <div className="id-card-hologram">
          <Award size={15} />
        </div>
      </div>
    </div>
  )

  const isSelectedForPrint = (activeId === instanceId) || (!isInline && !activeId)
  const printMount = typeof document !== 'undefined' ? document.getElementById('print-root') : null
  const printPortal = (isSelectedForPrint && printMount) ? createPortal(
    <div className="printable-area-container">
      {cardInner}
    </div>,
    printMount
  ) : null

  if (isInline) {
    return (
      <div style={{ maxWidth: '460px', margin: '0 auto' }}>
        <div className="printable-area">
          {cardInner}
        </div>
        <div className="no-print" style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="button button-gold button-small" 
            onClick={handleDownloadPng}
            disabled={isDownloading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {isHindi ? 'पहचान पत्र डाउनलोड करें (PNG)' : 'Download Smart ID (PNG)'}
          </button>
          <button type="button" className="button button-outline button-small" onClick={handlePrint} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Printer size={15} /> {isHindi ? 'प्रिंट करें' : 'Print Card'}
          </button>
        </div>
        {printPortal}
      </div>
    )
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '20px 24px' }}>
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0c2340', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={16} style={{ color: '#b45309' }} />
              {isHindi ? 'डिजिटल पहचान पत्र (Smart E-Card)' : 'Digital Smart Member ID Card'}
            </span>
            <button 
              type="button" 
              className="no-print" 
              onClick={onClose} 
              aria-label="Close"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#fee2e2'
                e.currentTarget.style.color = '#dc2626'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f1f5f9'
                e.currentTarget.style.color = '#0f172a'
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="printable-area">
            {cardInner}
          </div>

          <div className="no-print" style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="button button-gold button-small" 
              onClick={handleDownloadPng}
              disabled={isDownloading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {isHindi ? 'डाउनलोड करें (PNG)' : 'Download ID Card (PNG)'}
            </button>
            <button type="button" className="button button-outline button-small" onClick={handlePrint} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Printer size={15} /> {isHindi ? 'प्रिंट करें (Print)' : 'Print Smart ID'}
            </button>
            <button type="button" className="button button-outline button-small" onClick={onClose}>
              {isHindi ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      </div>
      {printPortal}
    </>
  )
}
