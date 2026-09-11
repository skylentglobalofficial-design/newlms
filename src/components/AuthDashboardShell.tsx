import { useState, useEffect, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { getDomainAccent, type AuroraThemeId } from '../aurora-themes'
import { useAuth } from '../context/AuthContext'

export type AuthNavItem = {
  id: string
  label: string
  short?: string
  /** DOM id to scroll into view when selected */
  sectionId?: string
  /** Optional route navigation */
  href?: string
}

export type AuthDashboardShellProps = {
  themeId: AuroraThemeId
  /** Subtitle under Skylent logo, e.g. "Learning" */
  workspaceLabel: string
  roleLabel: string
  navItems: AuthNavItem[]
  bottomNavItems?: AuthNavItem[]
  activeNav: string
  onNavChange: (id: string) => void
  renderNavIcon: (id: string) => ReactNode
  children: ReactNode
  /** Optional compact page header above main layout */
  header?: ReactNode
}

export function AuthDashboardShell({
  themeId,
  workspaceLabel,
  roleLabel,
  navItems,
  bottomNavItems,
  activeNav,
  onNavChange,
  renderNavIcon,
  children,
  header,
}: AuthDashboardShellProps) {
  const accent = getDomainAccent(themeId)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const mobileNav = bottomNavItems ?? navItems.slice(0, 5)

  function handleNav(item: AuthNavItem) {
    onNavChange(item.id)
    setMobileOpen(false)
    if (item.href) {
      navigate(item.href)
      return
    }
    if (item.sectionId) {
      document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const sidebarContent = (
    <>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${T.lineLight}` }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em' }}>
            Skylent<span style={{ color: accent.primary }}>.</span>
          </div>
        </Link>
        <div style={{ color: C.slate, fontSize: 11, marginTop: 4, letterSpacing: '0.04em' }}>{workspaceLabel}</div>
      </div>

      <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const isActive = activeNav === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                textAlign: 'left',
                padding: '11px 12px',
                marginBottom: 2,
                borderRadius: T.rControl,
                border: 'none',
                background: isActive ? accent.subtle : 'transparent',
                borderLeft: isActive ? `2px solid ${accent.primary}` : '2px solid transparent',
                color: isActive ? C.ink : C.slate,
                fontSize: 13.5,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span style={{ color: isActive ? accent.text : C.slate, display: 'flex' }}>
                {renderNavIcon(item.id)}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: `1px solid ${T.lineLight}` }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
          padding: '10px 12px', background: C.white,
          borderRadius: T.rControl, border: `1px solid ${T.lineLight}`,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: C.white, flexShrink: 0,
          }}>
            {user?.avatar || '??'}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div style={{ color: C.ink, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ color: C.slate, fontSize: 11 }}>{roleLabel}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%', padding: '9px', background: 'transparent',
            border: `1px solid ${T.lineLight}`, borderRadius: T.rControl,
            color: C.slate, fontSize: 12, cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="auth-shell" style={{ minHeight: '100vh', background: C.canvas, fontFamily: 'var(--font-body)', position: 'relative' }}>
      {/* Level 1 — desktop sidebar chrome */}
      <aside className="auth-shell-sidebar-desktop" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 236,
        background: C.warmWhite, borderRight: `1px solid ${T.lineLight}`,
        display: 'flex', flexDirection: 'column', zIndex: 120,
      }}>
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          className="auth-shell-overlay"
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, backdropFilter: 'blur(4px)' }}
        />
      )}
      <aside
        className={`auth-shell-sidebar-mobile${mobileOpen ? ' open' : ''}`}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
          background: C.warmWhite, borderRight: `1px solid ${T.lineLight}`,
          display: 'flex', flexDirection: 'column', zIndex: 210,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        {sidebarContent}
      </aside>

      <div className="auth-shell-main" style={{ position: 'relative', zIndex: 1, marginLeft: 236, minHeight: '100vh' }}>
        {/* Level 1 — mobile header chrome */}
        <header className="auth-shell-mobile-header" style={{
          display: 'none', position: 'sticky', top: 0, zIndex: 90,
          padding: '12px 16px', background: 'rgba(246,244,238,0.92)', borderBottom: `1px solid ${T.lineLight}`,
          backdropFilter: 'blur(16px)', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" style={{ background: 'none', border: 'none', color: C.ink, padding: 8, cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.ink }}>
            Skylent<span style={{ color: accent.primary }}>.</span>
          </span>
          <div style={{ width: 36 }} />
        </header>

        <div className="auth-shell-content" style={{ padding: 'clamp(20px, 3vw, 36px) clamp(16px, 3vw, 36px) 96px', minWidth: 0 }}>
          {header}
          {children}
        </div>
      </div>

      {/* Level 1 — mobile bottom nav */}
      <nav className="auth-shell-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(246,244,238,0.94)', borderTop: `1px solid ${T.lineLight}`,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        display: 'none', justifyContent: 'space-around',
        padding: '8px 4px max(8px, env(safe-area-inset-bottom))',
      }}>
        {mobileNav.map(item => {
          const isActive = activeNav === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px',
                color: isActive ? accent.text : C.slate,
              }}
            >
              {renderNavIcon(item.id)}
              <span style={{ fontSize: 9, fontWeight: isActive ? 600 : 400 }}>{item.short ?? item.label}</span>
            </button>
          )
        })}
      </nav>

      <style>{`
        .auth-shell-sidebar-mobile { display: none; }
        .auth-shell-main { overflow-x: hidden; }
        @media (max-width: 900px) {
          .auth-shell-sidebar-desktop { display: none !important; }
          .auth-shell-sidebar-mobile { display: flex !important; }
          .auth-shell-main { margin-left: 0 !important; }
          .auth-shell-mobile-header { display: flex !important; }
        }
        @media (max-width: 600px) {
          .auth-shell-bottom-nav { display: flex !important; }
          .auth-shell-content { padding-bottom: 88px !important; }
        }
      `}</style>
    </div>
  )
}

/** Shared layout: primary column + contextual rail */
export function AuthDashboardLayout({
  primary,
  rail,
  className,
}: {
  primary: ReactNode
  rail: ReactNode
  className?: string
}) {
  return (
    <div className={`auth-dashboard-layout${className ? ` ${className}` : ''}`} style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(240px, 300px)',
      gap: 'clamp(20px, 2.5vw, 32px)',
      alignItems: 'start',
    }}>
      <div className="auth-dashboard-primary" style={{ minWidth: 0 }}>{primary}</div>
      <aside className="auth-dashboard-rail" style={{ minWidth: 0 }}>{rail}</aside>
      <style>{`
        @media (max-width: 900px) {
          .auth-dashboard-layout { grid-template-columns: 1fr !important; }
          .auth-dashboard-rail { order: 2; }
        }
      `}</style>
    </div>
  )
}
