import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth, type UserRole } from '../context/AuthContext'
import { NAV_GROUPS } from './destinations'
import { S } from './tokens'
import './site-header.css'

function dashboardRoute(role: UserRole): string {
  switch (role) {
    case 'student': return '/dashboard/student'
    case 'faculty': return '/dashboard/faculty'
    case 'organisation': return '/dashboard/organisation'
    case 'recruiter': return '/dashboard/recruiter'
    case 'superadmin': return '/dashboard/admin'
  }
}

export default function SiteHeader() {
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    setOpenGroup(null)
    setMobileOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!openGroup && !mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGroup(null)
        if (mobileOpen) {
          setMobileOpen(false)
          burgerRef.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openGroup, mobileOpen])

  useEffect(() => {
    if (!openGroup) return
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (target && headerRef.current?.contains(target)) return
      setOpenGroup(null)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [openGroup])

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = menuRef.current?.querySelector<HTMLElement>('a, button')
    first?.focus()
    return () => { document.body.style.overflow = previous }
  }, [mobileOpen])

  const openMenu = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenGroup(label)
  }, [])

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenGroup(null), 130)
  }, [])

  const isGroupActive = (match: string[]) =>
    match.some(path => location.pathname === path || location.pathname.startsWith(`${path}/`))

  return (
    <header className="sk-header" ref={headerRef}>
      <a href="#main-content" className="sk-skip-link">Skip to content</a>
      <div className="sk-header-inner">
        <Link to="/" className="sk-wordmark" aria-label="Skylent home">
          Skylent<span aria-hidden style={{ color: '#F97316' }}>.</span>
        </Link>

        <nav className="sk-header-nav" aria-label="Main navigation">
          {NAV_GROUPS.map(group => (
            <div
              key={group.label}
              className="sk-navgroup"
              onMouseEnter={() => openMenu(group.label)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className={`sk-navlink${isGroupActive(group.match) ? ' is-active' : ''}`}
                aria-expanded={openGroup === group.label}
                aria-haspopup="true"
                onClick={() => setOpenGroup(current => current === group.label ? null : group.label)}
                onFocus={() => openMenu(group.label)}
                onBlur={event => {
                  if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node)) {
                    setOpenGroup(null)
                  }
                }}
              >
                {group.label}
                <svg width="9" height="6" viewBox="0 0 10 6" fill="currentColor" aria-hidden
                  style={{ opacity: 0.55, transform: openGroup === group.label ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
                  <path d="M0 0l5 6 5-6z" />
                </svg>
              </button>

              {openGroup === group.label && (
                <div className="sk-dropdown" onMouseEnter={() => openMenu(group.label)} onMouseLeave={scheduleClose}>
                  <Link to={group.to} className="sk-dropdown-lead">
                    <span>
                      <span className="sk-dropdown-lead-title">{group.label}</span>
                      <span className="sk-dropdown-sub">{group.tagline}</span>
                    </span>
                    <span aria-hidden className="sk-dropdown-arrow">→</span>
                  </Link>
                  {group.items.map(item => (
                    <Link key={item.to + item.label} to={item.to} className="sk-dropdown-item">
                      <span className="sk-dropdown-item-title">{item.label}</span>
                      <span className="sk-dropdown-sub">{item.sub}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sk-header-actions">
            {user ? (
            <Link to={dashboardRoute(user.role)} className="sk-header-cta">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="sk-header-signin">Sign in</Link>
              <Link to="/skills" className="sk-header-cta sk-header-browse">Find a course</Link>
            </>
          )}
          <button
            type="button"
            ref={burgerRef}
            className="sk-header-burger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="sk-mobile-menu"
            onClick={() => setMobileOpen(v => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {mobileOpen
                ? <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>
                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="sk-mobile-menu"
          className="sk-mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          {NAV_GROUPS.map(group => (
            <section key={group.label} className="sk-mobile-group">
              <Link to={group.to} className="sk-mobile-group-title">{group.label}</Link>
              {group.items.map(item => (
                <Link key={item.to + item.label} to={item.to} className="sk-mobile-item">
                  <span style={{ color: S.ink, fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: S.inkMuted, fontSize: 12.5 }}>{item.sub}</span>
                </Link>
              ))}
            </section>
          ))}
          <div className="sk-mobile-footer">
            {user ? (
              <Link to={dashboardRoute(user.role)} className="sk-header-cta" style={{ width: '100%' }}>Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="sk-header-signin">Sign in</Link>
                <Link to="/skills" className="sk-header-cta" style={{ flex: 1 }}>Find a course</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
