import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { AuroraThemeId } from '../aurora-themes'
import { useAuth } from '../context/AuthContext'
import { HeaderWalletAndNotifications } from './learner/HeaderWalletAndNotifications'
import { InstallAppPrompt } from './skylent/InstallAppPrompt'
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
  themeId: AuroraThemeId
  workspaceLabel: string
  roleLabel: string
  navItems: AuthNavItem[]
  bottomNavItems?: AuthNavItem[]
  activeNav: string
  onNavChange: (id: string) =>void
  renderNavIcon: (id: string) =>ReactNode
  children: ReactNode
  header?: ReactNode
  bar?: ReactNode
  workspace?: 'learning' | 'career'
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const SUPERADMIN_DASHBOARDS = [
  { label: 'Student', href: '/dashboard/student' },
  { label: 'Faculty TA', href: '/dashboard/faculty' },
  { label: 'College', href: '/dashboard/college' },
  { label: 'Recruiter', href: '/dashboard/recruiter' },
  { label: 'Org L&D', href: '/dashboard/organisation' },
  { label: 'Admin OS', href: '/dashboard/admin' },
] as const

function homeDashboardForRole(role?: string): string {
  switch (role) {
    case 'superadmin':
    case 'admin':
      return '/dashboard/admin'
    case 'faculty':
      return '/dashboard/faculty'
    case 'college':
      return '/dashboard/college'
    case 'recruiter':
      return '/dashboard/recruiter'
    case 'organisation':
      return '/dashboard/organisation'
    default:
      return '/dashboard/student'
  }
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
  bar,
  workspace,
}: AuthDashboardShellProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerId = useId()
  const menuRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  const mobileNav = bottomNavItems ?? navItems.slice(0, 5)
  const isSuperOrAdmin =
    user?.role === 'superadmin' ||
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'tariniprasadtripathy17@gmail.com'

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMobileOpen(false)
      menuRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    drawerRef.current?.querySelector<HTMLElement>('button, a')?.focus()
    return () =>window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  function handleNav(item: AuthNavItem) {
    onNavChange(item.id)
    setMobileOpen(false)
    if (item.href) {
      // Avoid piling up multiple hash history entries when switching between dashboard tabs
      const targetPathname = item.href.split("#")[0] || location.pathname
      const samePageTabSwitch =
        targetPathname === location.pathname && Boolean(location.hash) && item.href.includes("#")
      navigate(item.href, { replace: samePageTabSwitch })
      return
    }
    requestAnimationFrame(() => {
      if (item.sectionId) {
        const el = document.getElementById(item.sectionId)
        if (el) {
          el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
          return
        }
      }
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    })
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const activeItem = navItems.find(n =>n.id === activeNav)
  const brandHref = user ? homeDashboardForRole(user.role) : '/'

  const railContent = (
    <>
      <Link to={brandHref} className="auth-shell-brand" onClick={() =>setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: "#ffffff", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.22)", flexShrink: 0 }}><img src="/skylent-ribbon-mark.png" alt="" aria-hidden="true" width={22} height={22} style={{ width: 22, height: 22, objectFit: "contain", display: "block" }} /></span>
        <span className="auth-shell-wordmark">Skylent</span>
      </Link>

      <nav className="auth-shell-nav" aria-label={`${workspaceLabel} sections`}>
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <button
                type="button"
                className="auth-shell-nav-item"
                aria-current={activeNav === item.id ? 'page' : undefined}
                onClick={() =>handleNav(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {isSuperOrAdmin ? (
        <div className="auth-shell-switcher" aria-label="Superadmin Dashboard Switcher">
          <span className="auth-shell-switcher__label">★ SUPERADMIN · SWITCH VIEW</span>
          <div className="auth-shell-switcher__grid">
            {SUPERADMIN_DASHBOARDS.map((d) => {
              const active = location.pathname.startsWith(d.href)
              return (
                <Link
                  key={d.href}
                  to={d.href}
                  className={active ? 'auth-shell-switcher__pill is-active' : 'auth-shell-switcher__pill'}
                  onClick={() =>setMobileOpen(false)}
                >
                  {d.label}
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="auth-shell-user">
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false)
            navigate('/dashboard/student#profile-settings')
          }}
          title="Open My Profile, Professional Details & Password Settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            width: '100%',
            padding: '8px 10px',
            margin: '-4px -6px 8px',
            borderRadius: 10,
            border: location.hash === '#profile-settings' ? '1px solid #8b5cf6' : '1px solid rgba(196, 184, 255, 0.18)',
            background: location.hash === '#profile-settings' ? 'rgba(139, 92, 246, 0.22)' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div className="auth-shell-user-row" style={{ flex: 1, minWidth: 0 }}>
            <span className="auth-shell-avatar" aria-hidden="true">{user?.avatar || '··'}</span>
            <div style={{ minWidth: 0 }}>
              <div className="auth-shell-user-name">{user?.name || 'Signed in'}</div>
              <div className="auth-shell-user-role">{isSuperOrAdmin ? 'SUPERADMIN · PROFILE' : `${roleLabel} · VIEW PROFILE`}</div>
            </div>
          </div>
          <span aria-hidden="true" style={{ fontSize: 13, color: '#c4b8ff', fontWeight: 700 }}>•</span>
        </button>
        <button type="button" className="auth-shell-signout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="auth-shell" data-product={themeId} data-workspace={workspace}>
      <aside className="auth-shell-rail auth-shell-rail--desktop" aria-label={workspaceLabel}>
        {railContent}
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="auth-shell-overlay"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() =>setMobileOpen(false)}
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
            onClick={() =>setMobileOpen(true)}
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
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: 7, background: "#ffffff", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 3, boxShadow: "0 2px 6px rgba(0,0,0,0.2)", flexShrink: 0 }}><img src="/skylent-ribbon-mark.png" alt="" aria-hidden="true" width={20} height={20} style={{ width: 20, height: 20, objectFit: "contain", display: "block" }} /></span>
            <span className="auth-shell-wordmark">Skylent</span>
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <HeaderWalletAndNotifications variant="dashboard" />
          </div>
        </header>

        <div
          className="auth-shell-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '10px clamp(18px, 3vw, 32px)',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexWrap: 'wrap' }}>
            {bar ?? (
              activeItem ? (
                <strong style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{activeItem.label}</strong>
              ) : null
            )}
          </div>
          <div className="auth-shell-bar__desktop-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <InstallAppPrompt variant="dashboard" />
            <HeaderWalletAndNotifications variant="dashboard" />
          </div>
        </div>

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
            onClick={() =>handleNav(item)}
          >
            {renderNavIcon(item.id)}
            <span>{item.short ?? item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

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
