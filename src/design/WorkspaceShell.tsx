import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSurfaceAccent } from './accent'
import type { AuroraThemeId } from '../aurora-themes'
import { S } from './tokens'
import './product.css'
import './workspace.css'

export type WorkspaceNavItem = {
  id: string
  label: string
  /** Shorter label for the mobile bottom bar. */
  short?: string
  /** In-page section to scroll to. */
  sectionId?: string
  /** Route to navigate to instead of scrolling. */
  href?: string
  /** Real count only — never render a fabricated badge. */
  count?: number
  group?: string
}

function NavGlyph({ id }: { id: string }) {
  const p = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (id) {
    case 'overview':
      return <svg {...p}><rect x="3" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" /></svg>
    case 'learning':
      return <svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
    case 'courses':
      return <svg {...p}><path d="M12 3 2 8l10 5 10-5-10-5z" /><path d="m2 16 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>
    case 'tasks':
      return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="m9 15 2 2 4-4" /></svg>
    case 'progress':
      return <svg {...p}><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></svg>
    case 'certificate':
      return <svg {...p}><circle cx="12" cy="9" r="6" /><path d="m8.2 13.8-1.2 8 5-2.8 5 2.8-1.2-8" /></svg>
    case 'career':
      return <svg {...p}><rect x="2.5" y="7" width="19" height="13" rx="2" /><path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" /><path d="M2.5 12h19" /></svg>
    case 'catalog':
      return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" /></svg>
    default:
      return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>
  }
}

/**
 * Signed-in chrome for the light design system.
 *
 * Deliberately separate from AuthDashboardShell (the near-black chrome the
 * faculty/institution/recruiter workspaces still use) so this migration is
 * page-by-page rather than a big-bang rewrite of every role at once.
 */
export default function WorkspaceShell({
  themeId = 'general',
  workspaceLabel,
  roleLabel,
  navItems,
  bottomNavItems,
  activeNav,
  onNavChange,
  title,
  actions,
  children,
}: {
  themeId?: AuroraThemeId
  workspaceLabel: string
  roleLabel: string
  navItems: WorkspaceNavItem[]
  bottomNavItems?: WorkspaceNavItem[]
  activeNav: string
  onNavChange: (id: string) => void
  title?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  const accent = getSurfaceAccent(themeId)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const mobileNav = bottomNavItems ?? navItems.slice(0, 5)

  useEffect(() => {
    if (!drawerOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const handleNav = useCallback(
    (item: WorkspaceNavItem) => {
      setDrawerOpen(false)
      onNavChange(item.id)
      if (item.href) {
        navigate(item.href)
        return
      }
      if (item.sectionId) {
        const el = document.getElementById(item.sectionId)
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 88
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }
    },
    [navigate, onNavChange],
  )

  async function handleSignOut() {
    await logout()
    navigate('/login')
  }

  let lastGroup: string | undefined

  return (
    <div className="sk-surface">
      <div className="sk-workspace">
        <div
          className={`sk-ws-scrim${drawerOpen ? ' is-open' : ''}`}
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />

        <aside className={`sk-ws-sidebar${drawerOpen ? ' is-open' : ''}`}>
          <Link to="/" className="sk-ws-brand">
            <span>
              <span className="sk-ws-brand-mark">
                Skylent<span style={{ color: accent.solid }}>.</span>
              </span>
              <span className="sk-ws-brand-label" style={{ display: 'block' }}>{workspaceLabel}</span>
            </span>
          </Link>

          <nav className="sk-ws-nav" aria-label="Workspace">
            {navItems.map(item => {
              const isActive = activeNav === item.id
              const showGroup = item.group && item.group !== lastGroup
              if (item.group) lastGroup = item.group
              return (
                <div key={item.id}>
                  {showGroup && <div className="sk-ws-nav-group">{item.group}</div>}
                  <button
                    type="button"
                    onClick={() => handleNav(item)}
                    className={`sk-ws-nav-item${isActive ? ' is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    style={isActive ? { background: accent.soft, color: accent.text } : undefined}
                  >
                    <span className="sk-ws-nav-icon" style={{ color: isActive ? accent.solid : S.inkMuted }}>
                      <NavGlyph id={item.id} />
                    </span>
                    <span className="sk-ws-nav-label">{item.label}</span>
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span
                        className="sk-ws-nav-tail"
                        style={{
                          background: isActive ? accent.softStrong : S.surfaceMuted,
                          color: isActive ? accent.text : S.inkMuted,
                        }}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                </div>
              )
            })}
          </nav>

          <div className="sk-ws-account">
            <div className="sk-ws-account-row">
              <div
                className="sk-ws-avatar"
                style={{ background: `linear-gradient(135deg, ${accent.solid}, ${accent.glowSecondary})` }}
                aria-hidden
              >
                {user?.avatar || '—'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="sk-ws-account-name">{user?.name || 'Signed in'}</div>
                <div className="sk-ws-account-role">{roleLabel}</div>
              </div>
            </div>
            <button type="button" className="sk-ws-signout" onClick={() => void handleSignOut()}>
              Sign out
            </button>
          </div>
        </aside>

        <div className="sk-ws-main">
          <header className="sk-ws-topbar">
            <button
              type="button"
              className="sk-ws-burger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open workspace menu"
              aria-expanded={drawerOpen}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            {title && <div className="sk-ws-topbar-title">{title}</div>}
            <div className="sk-ws-topbar-actions">{actions}</div>
          </header>

          <main className="sk-ws-body" id="main-content">
            <div className="sk-ws-body-rail">{children}</div>
          </main>
        </div>

        <nav className="sk-ws-bottomnav" aria-label="Workspace sections">
          {mobileNav.map(item => {
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                type="button"
                className="sk-ws-bottomnav-item"
                onClick={() => handleNav(item)}
                aria-current={isActive ? 'page' : undefined}
                style={{ color: isActive ? accent.text : S.inkMuted }}
              >
                <NavGlyph id={item.id} />
                <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.short ?? item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
