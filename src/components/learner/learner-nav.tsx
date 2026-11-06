import type { ReactNode } from "react"
import type { AuthNavItem } from "../AuthDashboardShell"

/** One learner application. The same items stay in the sidebar on My Courses and Career OS. */
export const LEARNER_NAV: AuthNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    short: "Home",
    href: "/dashboard/student",
  },
  {
    id: "my-courses",
    label: "My Courses",
    short: "Courses",
    href: "/dashboard/student#sh-my-learning",
  },
  {
    id: "projects",
    label: "Projects",
    short: "Projects",
    href: "/dashboard/student#student-projects",
  },
  {
    id: "explore-programmes",
    label: "Explore Programmes",
    short: "Explore",
    href: "/dashboard/student#explore-programmes",
  },
  { id: "career-os", label: "Career OS", short: "Career", href: "/career-os" },
]

export function learnerNavId(pathname: string, hash: string): string {
  if (pathname === "/career-os" || pathname.startsWith("/career-os/"))
    return "career-os"
  if (hash === "#sh-my-learning") return "my-courses"
  if (hash === "#student-projects") return "projects"
  if (hash === "#explore-programmes") return "explore-programmes"
  return "dashboard"
}

export function LearnerNavIcon({ id }: { id: string }): ReactNode {
  const s = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  }
  if (id === "dashboard") {
    return (
      <svg {...s}>
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    )
  }
  if (id === "my-courses") {
    return (
      <svg {...s}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
  }
  if (id === "explore-programmes") {
    return (
      <svg {...s}>
        <circle cx="12" cy="12" r="9" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    )
  }
  if (id === "projects") {
    return (
      <svg {...s}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )
  }
  if (id === "career-os") {
    return (
      <svg {...s}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    )
  }
  return (
    <svg {...s}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}
