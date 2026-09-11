import { type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { AuthDashboardShell, type AuthNavItem } from "../AuthDashboardShell"
import { AuroraBand } from "../foundation"

const NAV_ITEMS: AuthNavItem[] = [
  { id: "overview", label: "Overview", short: "Home", href: "/career-os" },
  { id: "profile", label: "Profile", short: "Profile", href: "/career-os/profile" },
  { id: "jobs", label: "Jobs", short: "Jobs", href: "/career-os/jobs" },
  { id: "applications", label: "Applications", short: "Apps", href: "/career-os/applications" },
  { id: "interviews", label: "Interviews", short: "Prep", href: "/career-os/interviews" },
  { id: "support", label: "Support", short: "Help", href: "/career-os/support" },
]

const BOTTOM_NAV = NAV_ITEMS.filter(n => ["overview", "profile", "jobs", "applications", "support"].includes(n.id))

function navIdFromPath(pathname: string): string {
  if (pathname.startsWith("/career-os/profile")) return "profile"
  if (pathname.startsWith("/career-os/jobs")) return "jobs"
  if (pathname.startsWith("/career-os/applications")) return "applications"
  if (pathname.startsWith("/career-os/interviews")) return "interviews"
  if (pathname.startsWith("/career-os/support")) return "support"
  return "overview"
}

function NavIcon({ id }: { id: string }) {
  const stroke = "currentColor"
  const s = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.8 }
  if (id === "overview") return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
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
    <div className="career-os-workspace" style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <AuroraBand themeId="career" />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
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
          {children}
        </AuthDashboardShell>
      </div>
    </div>
  )
}
