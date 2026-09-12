import { Link } from 'react-router-dom'
import { S } from './tokens'

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Learn',
    links: [
      { label: 'Programmes', to: '/programs' },
      { label: 'Courses', to: '/courses' },
      { label: 'Webinars', to: '/workshops' },
      { label: 'Skills', to: '/skills' },
    ],
  },
  {
    title: 'Education',
    links: [
      { label: 'Schooling', to: '/education#schooling' },
      { label: 'Undergraduate', to: '/education#undergraduate' },
      { label: 'Postgraduate', to: '/education#postgraduate' },
      { label: 'Competitive exams', to: '/education#competitive-exams' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Stories', to: '/stories' },
      { label: 'Blog', to: '/blog' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="sk-footer">
      <div className="sk-footer-inner">
        <div className="sk-footer-grid">
          <div>
            <Link to="/" className="sk-wordmark" style={{ fontSize: 20 }}>
              Skylent<span aria-hidden style={{ color: '#F36B21' }}>.</span>
            </Link>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: S.inkSecondary, margin: '12px 0 0', maxWidth: 300 }}>
              Learning, academic pathways and career workflows in one platform. We publish what is actually
              available — and say so plainly when something is not ready yet.
            </p>
          </div>
          {COLUMNS.map(column => (
            <div key={column.title}>
              <div className="sk-footer-col-title">{column.title}</div>
              {column.links.map(link => (
                <Link key={link.to + link.label} to={link.to} className="sk-footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="sk-footer-bottom">
          <span>© {new Date().getFullYear()} Skylent. All rights reserved.</span>
          <span>Built in India</span>
        </div>
      </div>
    </footer>
  )
}
