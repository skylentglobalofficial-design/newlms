import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../context/AuthContext'
import { C, T } from '../tokens'
import { PublicCanvas, useAuroraTheme } from './foundation'
import { getDomainAccent, type AuroraThemeId } from '../aurora-themes'

const navAccent = getDomainAccent('general')

export { C } from '../tokens'

// ─── PRODUCT VISUAL REFS (no remote URLs) ─────────────────────────────────────
export const IMG = {
  studentsLecture: 'skylent:schooling-classroom',
  groupTech: 'skylent:fullstack-workspace',
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────
export function useFadeIn(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reveal = () => setVisible(true)
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.98 && rect.bottom > 0) {
      reveal()
      return
    }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { reveal(); obs.disconnect() } }, { threshold, rootMargin: '80px 0px' })
    obs.observe(el)
    const fallback = window.setTimeout(reveal, 700)
    return () => { obs.disconnect(); window.clearTimeout(fallback) }
  }, [threshold])
  return { ref, visible }
}

export function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

export function useCountUp(target: number, inView: boolean, duration = 1600) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start: number | null = null
    let raf: number
    const tick = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round(p * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])
  return val
}

// ─── FADE IN COMPONENT ────────────────────────────────────────────────────────
export function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div className={className} style={{ animation: `fadeIn 0.3s ${delay}ms ease both` }}>
      {children}
    </div>
  )
}

// ─── NAV (with mega menu) ─────────────────────────────────────────────────────
const megaMenu = [
  {
    label: 'Learn',
    to: '/skills',
    tagline: 'Skills you can show',
    items: [
      { label: 'Professional programmes', sub: 'Projects, practice, evidence', to: '/skills?view=professional' },
      { label: 'Certificates', sub: 'A credential you can finish', to: '/skills?view=certificates' },
      { label: 'Short courses', sub: 'LMS course catalogue', to: '/courses' },
      { label: 'Workshops', sub: 'Dated sessions', to: '/workshops' },
      { label: 'Catalogue', sub: 'What is actually published', to: '/programs?type=PROFESSIONAL' },
    ],
  },
  {
    label: 'Exams',
    to: '/exams',
    tagline: 'The paper you are taking',
    items: [
      { label: 'JEE', sub: 'Published programme', to: '/exams?exam=jee' },
      { label: 'CAT', sub: 'Published programme', to: '/exams?exam=cat' },
      { label: 'NEET', sub: 'Unpublished · coming soon', to: '/exams?exam=neet' },
    ],
  },
  {
    label: 'Schooling',
    to: '/junior',
    tagline: 'Classes 1–12',
    items: [
      { label: 'Classes 1–5', sub: 'Foundational', to: '/junior?band=foundational' },
      { label: 'Classes 6–8', sub: 'Middle school', to: '/junior?band=middle' },
      { label: 'Classes 9–10', sub: 'Secondary', to: '/junior?band=secondary' },
      { label: 'Classes 11–12', sub: 'Senior secondary', to: '/junior?band=senior' },
      { label: 'Experiments', sub: 'Labs and making', to: '/labs' },
    ],
  },
  {
    label: 'University',
    to: '/degrees',
    tagline: 'Undergraduate and postgraduate',
    items: [
      { label: 'Undergraduate', sub: 'Degrees, labs, projects', to: '/degrees?level=ug' },
      { label: 'Postgraduate', sub: 'Research and specialisation', to: '/degrees?level=pg' },
    ],
  },
  {
    label: 'Career',
    to: '/career',
    tagline: 'What can I do next?',
    items: [
      { label: 'Career hub', sub: 'Jobs, interviews, evidence', to: '/career' },
      { label: 'CareerOS', sub: 'Signed-in workspace', to: '/career-os' },
    ],
  },
  {
    label: 'Institutions',
    to: '/institutions',
    tagline: 'Operations, not a campus tour',
    items: [
      { label: 'Schools', sub: 'Class delivery and records', to: '/institutions?audience=schools' },
      { label: 'Colleges', sub: 'Programmes and LMS', to: '/institutions?audience=colleges' },
      { label: 'Universities', sub: 'Curriculum and lifecycle', to: '/institutions?audience=universities' },
      { label: 'Training organisations', sub: 'Batches and certification', to: '/institutions?audience=training' },
      { label: 'Skylent OS demo', sub: 'Illustrative, not live operations', to: '/os' },
    ],
  },
]

function dashRoute(role: UserRole): string {
  switch (role) {
    case 'student': return '/dashboard/student'
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'recruiter': return '/dashboard/recruiter'
    case 'superadmin': return '/dashboard/admin'
  }
}

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchOpen(false)
    setSearchQuery('')
    navigate(`/programs?q=${encodeURIComponent(q)}`)
  }
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!menuOpen && !activeMenu && !searchOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      setActiveMenu(null)
      setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, activeMenu, searchOpen])

  useEffect(() => {
    if (!activeMenu) return
    const h = () => { setActiveMenu(null) }
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [activeMenu])

  useEffect(() => { setMenuOpen(false); setActiveMenu(null) }, [location.pathname])

  const navBg = '#fff'
  const navBorder = '1px solid rgba(8,9,9,0.08)'

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  const handleMenuEnter = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveMenu(label)
  }, [])

  const handleMenuLeave = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120)
  }, [])

  return (
    <nav className="skylent-site-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: navBg, borderBottom: navBorder }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto', padding: `0 ${T.gutter}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: T.navH }}>
        {/* Logo */}
        <button type="button" onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: C.ink, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '-0.02em', padding: 0, flexShrink: 0 }}>
          Skylent<span style={{ color: C.orange }}>.</span>
        </button>

        <div className="nav-mega" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {megaMenu.map(group => (
            <div key={group.label} style={{ position: 'relative' }} onMouseEnter={() => handleMenuEnter(group.label)} onMouseLeave={handleMenuLeave}>
              <button
                type="button"
                aria-expanded={activeMenu === group.label}
                aria-haspopup="true"
                onClick={() => navigate(group.to)}
                style={{ background: 'none', border: 'none', color: activeMenu === group.label ? C.ink : C.slate, fontSize: 13.5, cursor: 'pointer', padding: '8px 13px', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', transition: 'color 0.2s', letterSpacing: '-0.01em' }}
              >
                {group.label}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" aria-hidden="true" style={{ opacity: 0.5, transform: activeMenu === group.label ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M0 0l5 6 5-6z"/></svg>
              </button>
              {activeMenu === group.label && (
                <div className="nav-mega-dropdown" onMouseEnter={() => handleMenuEnter(group.label)} onMouseLeave={handleMenuLeave} style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: '#fff', border: '1px solid var(--glass-01-border)', borderRadius: 12, padding: 6, minWidth: 260, maxWidth: 300, boxShadow: '0 18px 48px rgba(8,9,9,0.12)', zIndex: 300 }}>
                  <Link to={group.to} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px 12px', borderRadius: 8, textDecoration: 'none', marginBottom: 2, borderBottom: '1px solid rgba(8,9,9,0.08)' }}>
                    <div>
                      <div style={{ color: C.ink, fontSize: 14, fontWeight: 600 }}>{group.label}</div>
                      <div style={{ color: C.slate, fontSize: 11, marginTop: 2 }}>{group.tagline}</div>
                    </div>
                    <span style={{ color: navAccent.text, fontSize: 15 }} aria-hidden="true">→</span>
                  </Link>
                  {group.items.map(item => (
                    <Link key={item.to + item.label} to={item.to} style={{ display: 'block', padding: '8px 12px', borderRadius: 8, textDecoration: 'none' }}>
                      <div style={{ color: C.ink, fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                      <div style={{ color: C.slate, fontSize: 11, marginTop: 1 }}>{item.sub}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <nav className="nav-compact" aria-label="Skylent destinations">
          {megaMenu.map(group => (
            <Link
              key={group.label}
              to={group.to}
              aria-current={location.pathname === group.to ? 'page' : undefined}
            >
              {group.label}
            </Link>
          ))}
        </nav>

        <div className="nav-search" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid rgba(8,9,9,0.16)', borderRadius: 7, overflow: 'hidden' }}>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search programmes"
                aria-label="Search programmes"
                onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: C.ink, fontSize: 13, padding: '7px 12px', width: 200, fontFamily: 'var(--font-body)' }}
              />
              <button type="submit" style={{ background: 'none', border: 'none', color: C.ink, padding: '7px 10px', cursor: 'pointer' }} aria-label="Submit search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', color: C.slate, padding: '7px 10px', cursor: 'pointer', fontSize: 13 }} aria-label="Close search">✕</button>
            </form>
          ) : (
            <button type="button" onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', color: C.slate, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: 7 }}
              aria-label="Search"
              title="Search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          )}
        </div>

        <div className="nav-cta" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {user ? (
            <>
              <Link to={dashRoute(user.role)} className="nav-cta-link" style={{ background: 'transparent', border: '1px solid rgba(8,9,9,0.16)', color: C.ink, borderRadius: 7, padding: '7px 14px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>Dashboard</Link>
              <button type="button" className="nav-cta-link" onClick={() => { logout(); navigate('/') }} style={{ background: '#fff', border: '1px solid rgba(8,9,9,0.16)', color: C.ink, borderRadius: 7, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-cta-link" style={{ background: 'transparent', border: '1px solid rgba(8,9,9,0.16)', color: C.ink, borderRadius: 7, padding: '7px 14px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>Sign In</Link>
              <Link to="/programs" className="nav-cta-link" style={{ background: navAccent.primary, border: 'none', color: C.white, borderRadius: 7, padding: '8px 14px', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>Explore programmes</Link>
            </>
          )}
          <button
            type="button"
            className="show-mobile"
            aria-expanded={menuOpen}
            aria-controls="skylent-mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: C.ink, cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{ display: 'block', width: 20, height: 2, background: C.ink, borderRadius: 1 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: C.ink, borderRadius: 1 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: C.ink, borderRadius: 1 }} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="skylent-mobile-nav"
          className="mobile-nav-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          style={{
            position: 'fixed',
            inset: `${T.navH}px 0 0 0`,
            zIndex: 250,
            background: '#f6f4ee',
            borderTop: '1px solid rgba(8,9,9,0.08)',
            padding: '8px 24px 28px',
            overflowY: 'auto',
          }}
        >
          {megaMenu.map(group => (
            <div key={group.label} style={{ marginBottom: 8 }}>
              <Link to={group.to} onClick={() => setMenuOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.ink, fontSize: 15, fontWeight: 650, padding: '14px 0 8px', textDecoration: 'none' }}>{group.label}<span aria-hidden="true">→</span></Link>
              {group.items.map(item => (
                <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: C.slate, fontSize: 14, textDecoration: 'none', borderBottom: '1px solid rgba(8,9,9,0.08)', minHeight: 40 }}>{item.label}</Link>
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            {user ? (
              <button type="button" onClick={() => { logout(); navigate('/'); setMenuOpen(false) }} style={{ flex: 1, textAlign: 'center', padding: '11px', border: '1px solid rgba(8,9,9,0.16)', borderRadius: 7, color: C.ink, background: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', minHeight: 44 }}>Sign Out</button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '11px', border: '1px solid rgba(8,9,9,0.16)', borderRadius: 7, color: C.ink, background: '#fff', textDecoration: 'none', fontSize: 13, minHeight: 44 }}>Sign In</Link>
            )}
            <Link to="/programs" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '11px', background: navAccent.primary, borderRadius: 7, color: C.white, textDecoration: 'none', fontSize: 13, fontWeight: 600, minHeight: 44 }}>Explore programmes</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export function Footer() {
  const cols = [
    { heading: 'Worlds', links: [['Learn', '/skills'], ['Exams', '/exams'], ['Schooling', '/junior'], ['University', '/degrees']] },
    { heading: 'Work', links: [['Career', '/career'], ['CareerOS', '/career-os'], ['Programmes', '/programs'], ['OS demo', '/os']] },
    { heading: 'Institutions', links: [['Overview', '/institutions'], ['Contact', '/contact']] },
    { heading: 'Company', links: [['About', '/about'], ['Stories', '/stories'], ['Blog', '/blog']] },
  ]
  return (
    <footer className="skylent-site-footer" style={{ background: C.warmWhite, padding: `28px ${T.gutter} 24px`, position: 'relative', borderTop: `1px solid ${T.lineLight}` }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr repeat(4, 1fr)', gap: 28, marginBottom: 28 }} className="footer-grid">
          <div>
            <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: C.ink, letterSpacing: '-0.02em', textDecoration: 'none', display: 'block', marginBottom: 16 }}>Skylent<span style={{ color: C.orange }}>.</span></Link>
            <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.75, maxWidth: 240, margin: '0 0 22px' }}>One platform. Six working experiences — Learn, Exams, Schooling, University, Career, Institutions.</p>
          </div>
          {cols.map(col => (
            <div key={col.heading}>
              <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>{col.heading.toUpperCase()}</div>
              {col.links.map(([label, to]) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <Link to={to} style={{ color: C.slate, fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
                  >{label}</Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.lineLight}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ color: C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>© 2026 Skylent Global. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            {([['Privacy', '/privacy'], ['Terms', '/terms'], ['Cookies', '/cookies']] as const).map(([label, to]) => (
              <Link key={to} to={to} style={{ color: C.slate, fontSize: 12, fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── PAGE SHELL ───────────────────────────────────────────────────────────────
export function PageShell({
  children,
  aurora,
  auroraTheme,
}: {
  children: React.ReactNode
  aurora?: boolean
  auroraTheme?: AuroraThemeId
}) {
  const location = useLocation()
  const autoTheme = useAuroraTheme()
  const theme = auroraTheme ?? autoTheme
  const showAurora = aurora ?? false

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - (T.navH + 8)
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.hash])

  return (
    <PublicCanvas themeId={theme} aurora={showAurora}>
      <div style={{ paddingTop: T.navH }}>
        <Nav />
        <main>{children}</main>
        <Footer />
      </div>
    </PublicCanvas>
  )
}
