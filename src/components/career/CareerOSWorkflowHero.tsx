import { useNavigate } from "react-router-dom"
import { C, FadeIn } from "../shared"
import { Button, Eyebrow, Heading, Section, T } from "../ui"
import { Aurora, GlassSurface } from "../foundation"
import { getDomainAccent } from "../../aurora-themes"
import { useAuth } from "../../context/AuthContext"

const accent = getDomainAccent("career")

const WORKFLOW_STEPS = [
  { id: "profile", label: "Profile", desc: "Structured professional identity" },
  { id: "skills", label: "Skills", desc: "Proof from programs and projects" },
  { id: "opportunities", label: "Opportunities", desc: "Curated job board" },
  { id: "applications", label: "Applications", desc: "Submit and track status" },
  { id: "interviews", label: "Interviews", desc: "Prep rounds and mocks" },
  { id: "support", label: "Career Support", desc: "Guidance through the process" },
]

export default function CareerOSWorkflowHero() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const workspacePath = user ? "/career-os/app" : "/login"
  const workspaceState = user ? undefined : { returnTo: "/career-os/app" }

  return (
    <Section tone="canvas" style={{ paddingTop: "clamp(88px, 12vw, 120px)", paddingBottom: T.sectionTight }}>
      <div className="career-workflow-hero">
      <Aurora themeId="career" />
      <FadeIn>
        <div className="career-workflow-hero-grid">
          <div>
            <Eyebrow tone="dark">Career OS</Eyebrow>
            <Heading tone="dark" size="lg" style={{ margin: "16px 0 12px" }}>
              A career workspace — not a landing page.
            </Heading>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.75, margin: "0 0 28px", maxWidth: 520 }}>
              Profile, skills proof, opportunities, applications, interviews, and support — one workflow you can enter after qualifying programs.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(workspacePath, { state: workspaceState })}
              >
                Open Career OS workspace
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const el = document.getElementById("jobs")
                  if (el) el.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Browse jobs
              </Button>
            </div>
          </div>

          <GlassSurface level={2} padding="24px 24px 20px" className="career-workflow-preview">
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 16 }}>Product workflow</div>
            <div className="career-workflow-steps">
              {WORKFLOW_STEPS.map((step, index) => (
                <div key={step.id} className="career-workflow-step">
                  <div className="career-workflow-step-index">{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="career-workflow-step-label">{step.label}</div>
                    <div className="career-workflow-step-desc">{step.desc}</div>
                  </div>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div className="career-workflow-step-arrow" aria-hidden>→</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.lineDark}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px 14px" }}>
                  <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 6 }}>Profile</div>
                  <div style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>Headline & skills</div>
                </div>
                <div style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 8, padding: "12px 14px" }}>
                  <div className="skylent-label" style={{ color: accent.textMuted, marginBottom: 6 }}>Applications</div>
                  <div style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>Track pipeline</div>
                </div>
              </div>
            </div>
          </GlassSurface>
        </div>
      </FadeIn>
      </div>
    </Section>
  )
}
