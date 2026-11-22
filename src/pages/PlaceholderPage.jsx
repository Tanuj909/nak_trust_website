import { useLocation } from 'react-router-dom'

export default function PlaceholderPage() {
  const location = useLocation()
  const page = location.pathname.split('/').filter(Boolean).pop()?.replaceAll('-', ' ') || 'Page'
  return (
    <section className="placeholder-section">
      <div className="container placeholder-card">
        <span className="section-kicker">NAK TRUST ORG</span>
        <h1>{page.replace(/\b\w/g, (letter) => letter.toUpperCase())}</h1>
        <p>यह पेज अगले development phase में तैयार किया जाएगा। / This page will be developed in the next phase.</p>
        <span className="coming-soon">Coming in next phase</span>
      </div>
    </section>
  )
}
