import { useEffect, useRef, type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { AuthDashboardShell } from "../AuthDashboardShell"
import { LEARNER_NAV, LearnerNavIcon } from "../learner/learner-nav"
import { CAREER_OS_NAV } from "../../lib/product-manifest"

/** Page-level order. Labels and routes stay on CAREER_OS_NAV. */
const PAGE_ORDER = [
  "overview",
  "profile",
  "projects",
  "jobs",
  "applications",
  "interviews",
  "support",
] as const

function careerPageId(pathname: string): string {
  const match = CAREER_OS_NAV.find(
    (item) =>
      item.id !== "overview" &&
      (pathname === item.route || pathname.startsWith(`${item.route}/`)),
  )
  return match?.id ?? "overview"
}

function CareerOSPageNav({ pathname }: { pathname: string }) {
  const current = careerPageId(pathname)
  const navRef = useRef<HTMLElement>(null)
  const items = PAGE_ORDER.flatMap((id) => {
    const item = CAREER_OS_NAV.find((entry) => entry.id === id)
    return item ? [item] : []
  })

  useEffect(() => {
    const list = navRef.current?.querySelector("ul")
    const active = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!list || !active) return
    const left = active.offsetLeft
    const right = left + active.offsetWidth
    if (left < list.scrollLeft) list.scrollLeft = left
    else if (right > list.scrollLeft + list.clientWidth) list.scrollLeft = right - list.clientWidth
  }, [pathname])

  return (
    <nav className="cos-pagenav" aria-label="Career OS" ref={navRef}>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={item.route}
              aria-current={current === item.id ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function CareerOSShell({
  children,
  header,
}: {
  children: ReactNode
  header?: ReactNode
}) {
  const { pathname } = useLocation()

  return (
    <AuthDashboardShell
      themeId="data-science"
      workspaceLabel="My Courses"
      roleLabel="Learner"
      navItems={LEARNER_NAV}
      bottomNavItems={LEARNER_NAV}
      activeNav="career-os"
      onNavChange={() => undefined}
      renderNavIcon={(id) => <LearnerNavIcon id={id} />}
      header={header}
    >
      <div className="cos-scope">
        <CareerOSPageNav pathname={pathname} />
        {children}
      </div>
    </AuthDashboardShell>
  )
}
