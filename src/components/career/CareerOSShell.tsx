import { type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { AuthDashboardShell, type AuthNavItem } from "../AuthDashboardShell"
import { CAREER_OS_NAV } from "../../lib/product-manifest"

/** Names and order from src/lib/product-manifest.ts, shared with the public Career OS pages. */
const NAV_ITEMS: AuthNavItem[] = CAREER_OS_NAV.map((item) => ({ id: item.id, label: item.label, short: item.short, href: item.route }))

const BOTTOM_NAV = NAV_ITEMS.filter(n => ["overview", "projects", "profile", "applications", "support"].includes(n.id))

function navIdFromPath(pathname: string): string {
  const match = CAREER_OS_NAV.find((item) => item.id !== "overview" && (pathname === item.route || pathname.startsWith(`${item.route}/`)))
  return match?.id ?? "overview"
}

function NavIcon({ id }: { id: string }) {
  const stroke = "currentColor"
  const s = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.8 }
  if (id === "overview") return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === "projects") return <svg {...s}><path d="M4 7h16v12H4z"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
  if (id === "profile") return <svg {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  if (id === "jobs") return <svg {...s}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
  if (id === "applications") return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  if (id === "interviews") return <svg {...s}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
  if (id === "support") return <svg {...s}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="3"/></svg>
}

export default function CareerOSShell({ children, header }: { children: ReactNode; header?: ReactNode }) {
  const { pathname } = useLocation()
  const activeNav = navIdFromPath(pathname)

  return (
    <AuthDashboardShell
      themeId="career"
      workspaceLabel="Career OS"
      roleLabel="Career workspace"
      navItems={NAV_ITEMS}
      bottomNavItems={BOTTOM_NAV}
      activeNav={activeNav}
      onNavChange={() => undefined}
      renderNavIcon={id => <NavIcon id={id} />}
      header={header}
    >
      <div className="cos-scope">{children}</div>
    </AuthDashboardShell>
  )
}
