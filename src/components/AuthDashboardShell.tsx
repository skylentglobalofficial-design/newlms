import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { AuroraThemeId } from '../aurora-themes'
import { useAuth } from '../context/AuthContext'
import './AuthDashboardShell.css'

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
  /**
   * Kept for call-site compatibility. The shell no longer takes a per-role colour:
   * every signed-in surface uses the same navy rail and cobalt current marker.
   */
  themeId: AuroraThemeId
  /** Mono label beside the wordmark, e.g. "My learning" */
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
  /** Optional slim white bar above the content: breadcrumb on the left, product slice on the right. */
  bar?: ReactNode
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function AuthDashboardShell({
  workspaceLabel,
  roleLabel,
  navItems,
  bottomNavItems,
  activeNav,
  onNavChange,
  renderNavIcon,
  children,
  header,
  bar,
}: AuthDashboardShellProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerId = useId()
  const menuRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  const mobileNav = bottomNavItems ?? navItems.slice(0, 5)

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMobileOpen(false)
      menuRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    drawerRef.current?.querySelector<HTMLElement>('button, a')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  function handleNav(item: AuthNavItem) {
    onNavChange(item.id)
    setMobileOpen(false)
    if (item.href) {
      navigate(item.href)
      return
    }
    if (item.sectionId) {
      document
        .getElementById(item.sectionId)
        ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const railContent = (
    <>
      <Link to="/" className="auth-shell-brand">
        <span className="auth-shell-wordmark">Skylent</span>
        <span className="auth-shell-workspace">{workspaceLabel}</span>
      </Link>

      <nav className="auth-shell-nav" aria-label={`${workspaceLabel} sections`}>
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <button
                type="button"
                className="auth-shell-nav-item"
                aria-current={activeNav === item.id ? 'page' : undefined}
                onClick={() => handleNav(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="auth-shell-user">
        <div className="auth-shell-user-row">
          <span className="auth-shell-avatar" aria-hidden="true">{user?.avatar || '··'}</span>
          <div style={{ minWidth: 0 }}>
            <div className="auth-shell-user-name">{user?.name || 'Signed in'}</div>
            <div className="auth-shell-user-role">{roleLabel}</div>
          </div>
        </div>
        <button type="button" className="auth-shell-signout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="auth-shell">
      <aside className="auth-shell-rail auth-shell-rail--desktop" aria-label={workspaceLabel}>
        {railContent}
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="auth-shell-overlay"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        ref={drawerRef}
        id={drawerId}
        className={`auth-shell-rail auth-shell-rail--drawer${mobileOpen ? ' is-open' : ''}`}
        aria-label={workspaceLabel}
        aria-hidden={!mobileOpen}
        {...(!mobileOpen ? { inert: true } : {})}
      >
        {railContent}
      </aside>

      <div className="auth-shell-main">
        <header className="auth-shell-topbar">
          <button
            ref={menuRef}
            type="button"
            className="auth-shell-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls={drawerId}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="auth-shell-wordmark">Skylent</span>
          <span className="auth-shell-workspace">{workspaceLabel}</span>
        </header>

        {bar ? <div className="auth-shell-bar">{bar}</div> : null}

        <div className="auth-shell-content">
          {header}
          {children}
        </div>
      </div>

      <nav className="auth-shell-bottom-nav" aria-label={`${workspaceLabel} quick navigation`}>
        {mobileNav.map(item => (
          <button
            key={item.id}
            type="button"
            aria-current={activeNav === item.id ? 'page' : undefined}
            onClick={() => handleNav(item)}
          >
            {renderNavIcon(item.id)}
            <span>{item.short ?? item.label}</span>
          </button>
        ))}
      </nav>
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
    <div className={`auth-dashboard-layout${className ? ` ${className}` : ''}`}>
      <div className="auth-dashboard-primary">{primary}</div>
      <aside className="auth-dashboard-rail">{rail}</aside>
    </div>
  )
}
