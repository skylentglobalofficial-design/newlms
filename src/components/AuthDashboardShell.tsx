import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { AuroraThemeId } from '../aurora-themes'
import { useAuth } from '../context/AuthContext'
import { HeaderWalletAndNotifications } from './learner/HeaderWalletAndNotifications'
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
  onNavChange: (id: string) => void
  renderNavIcon: (id: string) => ReactNode
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

  const isProfileOpen = location.pathname === '/dashboard/student' && location.hash === '#profile-settings'

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

  function openProfileAndSettings() {
    setMobileOpen(false)
    navigate('/dashboard/student#profile-settings')
    requestAnimationFrame(() => {
      const el = document.getElementById('profile-settings')
      if (el) {
        el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      }
    })
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const activeItem = navItems.find(n => n.id === activeNav)

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
                aria-current={activeNav === item.id && !isProfileOpen ? 'page' : undefined}
                onClick={() => handleNav(item)}
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
                  onClick={() => setMobileOpen(false)}
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
          onClick={openProfileAndSettings}
          title="Open My Profile, Professional Details & Password Settings"
          aria-label="Open My Profile & Settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            width: '100%',
            padding: '8px 10px',
            margin: '-4px -6px 8px',
            borderRadius: 10,
            border: isProfileOpen ? '1px solid #8b5cf6' : '1px solid rgba(196, 184, 255, 0.18)',
            background: isProfileOpen ? 'rgba(139, 92, 246, 0.22)' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background 150ms ease, border-color 150ms ease',
          }}
        >
          <div className="auth-shell-user-row" style={{ flex: 1, minWidth: 0 }}>
            <span className="auth-shell-avatar" aria-hidden="true">{user?.avatar || '··'}</span>
            <div style={{ minWidth: 0 }}>
              <div className="auth-shell-user-name">{user?.name || 'Signed in'}</div>
              <div className="auth-shell-user-role">
                {isSuperOrAdmin ? 'SUPERADMIN · PROFILE' : `${roleLabel} · VIEW PROFILE`}
              </div>
            </div>
          </div>
          <span
            aria-hidden="true"
            style={{
              fontSize: 13,
              color: '#c4b8ff',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            ⚙️
          </span>
        </button>

        <button
          type="button"
          onClick={openProfileAndSettings}
          style={{
            width: '100%',
            minHeight: 38,
            marginTop: 4,
            border: isProfileOpen ? '1px solid #a78bfa' : '1px solid rgba(196, 184, 255, 0.26)',
            borderRadius: 8,
            background: isProfileOpen ? '#5142b5' : 'rgba(81, 66, 181, 0.25)',
            color: '#ffffff',
            font: '600 12.5px/1 var(--font-body)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span>⚙️ Profile &amp; Settings</span>
          {user?.passwordRotation?.rotationDue ? (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: '#f59e0b',
                display: 'inline-block',
              }}
              title="3-month password update due"
            />
          ) : null}
        </button>

        <button type="button" className="auth-shell-signout" onClick={handleLogout} style={{ marginTop: 8 }}>
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
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={openProfileAndSettings}
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid rgba(196, 184, 255, 0.35)',
                background: 'rgba(81, 66, 181, 0.35)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ⚙️ Profile
            </button>
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
              <>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#5142b5',
                    background: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  {workspaceLabel} OS
                </span>
                {isProfileOpen ? (
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                    Active Tab: <strong style={{ color: '#0f172a' }}>My Profile &amp; Settings</strong>
                  </span>
                ) : activeItem ? (
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                    Active Tab: <strong style={{ color: '#0f172a' }}>{activeItem.label}</strong>
                  </span>
                ) : null}
              </>
            )}
          </div>
          <div className="auth-shell-bar__desktop-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={openProfileAndSettings}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 999,
                border: isProfileOpen ? '1px solid #5142b5' : '1px solid #cbd5e1',
                background: isProfileOpen ? '#5142b5' : '#f8fafc',
                color: isProfileOpen ? '#ffffff' : '#0f172a',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>⚙️ {user?.name?.split(' ')[0] || 'My'} Profile &amp; Settings</span>
            </button>
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
