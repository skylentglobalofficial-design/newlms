import { useEffect, useState } from "react"
import { ContextualNavBar, ContextualNavPanel, type ContextualNavItem } from "../foundation"
import { useCareerProfile } from "../../hooks/useCareerProfile"
import ProfileOverview from "./ProfileOverview"
import EducationSection from "./EducationSection"
import ExperienceSection from "./ExperienceSection"
import SkillsSection from "./SkillsSection"
import ProjectsSection from "./ProjectsSection"
import LinksSection from "./LinksSection"
import { LoadingBlock, FeedbackBanner } from "./section-ui"

const PROFILE_NAV: ContextualNavItem[] = [
  { id: "profile-basics", label: "Basics", sub: "Headline & summary" },
  { id: "profile-education", label: "Education", sub: "Degrees & schools" },
  { id: "profile-experience", label: "Experience", sub: "Roles & companies" },
  { id: "profile-skills", label: "Skills", sub: "What you bring" },
  { id: "profile-projects", label: "Projects", sub: "Portfolio proof" },
  { id: "profile-links", label: "Links", sub: "Professional URLs" },
  { id: "profile-resumes", label: "Resumes", sub: "Version metadata" },
]

export default function CareerProfileWorkspace() {
  const { profile, setProfile, loading, error, reload } = useCareerProfile()
  const [activeSection, setActiveSection] = useState("profile-basics")

  useEffect(() => {
    const sections = PROFILE_NAV.map(item => item.id)
    function onScroll() {
      let current = sections[0]
      for (const id of sections) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= 140) current = id
      }
      setActiveSection(current)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [profile])

  const hasProfile = Boolean(profile)
  useEffect(() => {
    if (!hasProfile) return
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView({ block: "start" })
  }, [hasProfile])

  if (loading) {
    return <LoadingBlock label="Loading your career profile…" />
  }

  if (error || !profile) {
    return (
      <div className="cos-profile" style={{ maxWidth: 1100, margin: "0 auto", minWidth: 0 }}>
        <header className="cos-head">
          <span className="cos-eyebrow">Career OS · Profile</span>
          <h1>Career profile</h1>
        </header>
        <div className="cos-state">
          <FeedbackBanner tone="error" message={error ?? "Profile unavailable"} />
          <button type="button" onClick={() => void reload()}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cos-profile" style={{ maxWidth: 1100, margin: "0 auto", minWidth: 0 }}>
      <header className="cos-head">
        <span className="cos-eyebrow">Career OS · Profile</span>
        <h1>Career profile</h1>
        <p>Build the profile employers see when you apply through Career OS.</p>
      </header>

      <div className="career-profile-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(200px, 240px)", gap: 24, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div className="career-profile-context-bar" style={{ display: "none", marginBottom: 16 }}>
            <ContextualNavBar items={PROFILE_NAV} themeId="career" activeId={activeSection} />
          </div>
          <ProfileOverview profile={profile} onProfileUpdate={setProfile} />
          <EducationSection profile={profile} onProfileUpdate={setProfile} />
          <ExperienceSection profile={profile} onProfileUpdate={setProfile} />
          <SkillsSection profile={profile} onProfileUpdate={setProfile} />
          <ProjectsSection profile={profile} onProfileUpdate={setProfile} />
          <LinksSection profile={profile} onProfileUpdate={setProfile} />
        </div>
        <aside className="career-profile-rail" style={{ position: "sticky", top: 24, minWidth: 0 }}>
          <ContextualNavPanel items={PROFILE_NAV} themeId="career" title="Profile sections" activeId={activeSection} />
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .career-profile-layout { grid-template-columns: 1fr !important; }
          .career-profile-rail { display: none !important; }
          .career-profile-context-bar { display: block !important; }
        }
      `}</style>
    </div>
  )
}
