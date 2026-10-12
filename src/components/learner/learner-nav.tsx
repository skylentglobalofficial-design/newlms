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
    id: "explore-courses",
    label: "Explore Courses",
    short: "Explore",
    href: "/courses",
  },
  { id: "career-os", label: "Career OS", short: "Career", href: "/career-os" },
]

export function learnerNavId(pathname: string, hash: string): string {
  if (pathname === "/career-os" || pathname.startsWith("/career-os/"))
    return "career-os"
  if (hash === "#sh-my-learning") return "my-courses"
  if (hash === "#student-projects") return "projects"
  return "dashboard"
}

export function LearnerNavIcon({ id }: { id: string }): ReactNode {
  const s = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": true as const,
  }
  if (id === "dashboard" || id === "my-courses") {
    return (
      <svg {...s}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
  }
  if (id === "explore-courses") {
    return (
      <svg {...s}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    )
  }
  if (id === "projects") {
    return (
      <svg {...s}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  }
  if (id === "career-os") {
    return (
      <svg {...s}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    )
  }
  return (
    <svg {...s}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}
