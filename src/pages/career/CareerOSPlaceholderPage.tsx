import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { GlassSurface } from "../../components/foundation"

const accent = getDomainAccent("career")

const COPY: Record<string, { title: string; description: string }> = {
  jobs: {
    title: "Jobs",
    description: "The job board will list open roles you can save and apply to. Phase A focuses on your profile — job browsing is coming next.",
  },
  applications: {
    title: "Applications",
    description: "Track applications you submit through Career OS. This workspace will connect to your application history in a later phase.",
  },
  interviews: {
    title: "Interviews",
    description: "Interview preparation and practice sessions will live here. For now, build your profile so you are ready when prep opens.",
  },
  support: {
    title: "Support",
    description: "Career support tasks and guidance will appear here. Use your profile workspace to prepare in the meantime.",
  },
}

export default function CareerOSPlaceholderPage({ area }: { area: keyof typeof COPY }) {
  const content = COPY[area]

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", minWidth: 0 }}>
      <GlassSurface level={2} padding="28px">
        <div style={{ fontSize: 12, color: accent.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
          Coming next
        </div>
        <h1 style={{ margin: "0 0 10px", fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 30px)", fontWeight: 700, color: C.white }}>
          {content.title}
        </h1>
        <p style={{ margin: "0 0 20px", color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7 }}>
          {content.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link to="/career-os/profile" style={{ padding: "10px 16px", borderRadius: T.rControl, background: accent.primary, color: C.white, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Work on profile
          </Link>
          <Link to="/career-os" style={{ padding: "10px 16px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, color: accent.text, fontSize: 13, textDecoration: "none" }}>
            Back to overview
          </Link>
        </div>
      </GlassSurface>
    </div>
  )
}
