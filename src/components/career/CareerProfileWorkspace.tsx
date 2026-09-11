import { useEffect, useState } from "react"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { ContextualNavBar, ContextualNavPanel, type ContextualNavItem } from "../foundation"
import { useCareerProfile } from "../../hooks/useCareerProfile"
import ProfileOverview from "./ProfileOverview"
import EducationSection from "./EducationSection"
import ExperienceSection from "./ExperienceSection"
import SkillsSection from "./SkillsSection"
import ProjectsSection from "./ProjectsSection"
import LinksSection from "./LinksSection"
import { LoadingBlock, FeedbackBanner } from "./section-ui"

const accent = getDomainAccent("career")

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
      setActiveSection(prev => prev === current ? prev : current)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [profile])

  if (loading) {
    return <LoadingBlock label="Loading your career profile…" />
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: 520 }}>
        <FeedbackBanner tone="error" message={error ?? "Profile unavailable"} />
        <button type="button" onClick={() => void reload()} style={{ marginTop: 12, padding: "10px 16px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "transparent", color: accent.text, cursor: "pointer" }}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", minWidth: 0 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 700, color: C.white }}>
          Career profile
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.48)", fontSize: 14, lineHeight: 1.6 }}>
          Build the profile employers see when you apply through Career OS.
        </p>
      </div>

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
