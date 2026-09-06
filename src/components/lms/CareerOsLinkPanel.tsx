import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { useCareerProfile } from "../../hooks/useCareerProfile"

type Accent = { text: string; border: string; subtle: string }

export default function CareerOsLinkPanel({ accent }: { accent: Accent }) {
  const { profile, loading } = useCareerProfile()

  const headline = profile?.headline?.trim()
  const skillCount = profile?.skills?.length ?? 0
  const hasProfile = Boolean(headline || skillCount > 0)

  return (
    <div className="lms-career-link-panel" style={{ borderColor: accent.border, background: accent.subtle }}>
      <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Career OS</div>
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0 }}>Loading profile…</p>
      ) : hasProfile ? (
        <>
          <div style={{ color: C.white, fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
            {headline ?? "Your career profile"}
          </div>
          <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, lineHeight: 1.55, margin: "0 0 12px" }}>
            {skillCount > 0 ? `${skillCount} skills on your profile` : "Profile started"} — learning progress is separate from Career OS until skills sync is implemented.
          </p>
        </>
      ) : (
        <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, lineHeight: 1.55, margin: "0 0 12px" }}>
          Build your career profile, track applications, and practice interviews. Course completion does not auto-sync to Career OS yet.
        </p>
      )}
      <Link to="/career-os/app" style={{ color: accent.text, fontSize: 12, textDecoration: "none", fontWeight: 600 }}>
        Open Career OS →
      </Link>
    </div>
  )
}
