/**
 * HomePage - Proof-First Skylent Homepage (v143.2)
 * 1. Pure-White Centered Hero (Clarity Proof + 3-Stage Pipeline)
 * 2. Career Tracks & Transparent Paths (What you can learn + Pricing)
 * 3. Inside the Learning Workspace (How you learn + Login Gate)
 * 4. Clean CTA + Legit Footer
 */
import { useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { PageShell } from "@/components/shared"
import { homeCataloguePhase } from "@/lib/catalogue-availability"
import { useCatalogPrograms } from "@/hooks/useCatalog"
import {
  confirmedOpenTitles,
  HomeClosing,
  HomeHero,
  HomeProgrammes,
  InsideProgramme,
} from "./home/Repolish"
import "./HomePage.v2.css"
import "./HomeRepolish.css"
import degreeUgImg from "@/assets/site/home/hero-classroom-960.webp"
import degreePgImg from "@/assets/site/home/degree-management-960.webp"

export default function HomePage() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    if (!ready || !user) return
    if (params.get("public") === "1" || params.get("home") === "1") return
    const target =
      user.role === "admin" || user.role === "superadmin"
        ? "/dashboard/admin"
        : user.role === "faculty"
          ? "/dashboard/faculty"
          : user.role === "college"
            ? "/dashboard/college"
            : user.role === "recruiter"
              ? "/dashboard/recruiter"
              : user.role === "organisation"
                ? "/dashboard/organisation"
                : "/dashboard/student"
    navigate(target, { replace: true })
  }, [ready, user, params, navigate])

  const catalog = useCatalogPrograms()
  const catalogue = homeCataloguePhase(catalog.loading, catalog.offline)

  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page hx-page--home" style={{ background: "#ffffff" }}>
        {/* Section 1: Pure-White Centered Hero */}
        <HomeHero
          catalogue={catalogue}
          openTitles={catalogue === "confirmed" ? confirmedOpenTitles(catalog.data ?? []) : []}
        />

        {/* Section 2: Transparent Paths + Career Track Cards (FIRST, so users see what they can learn) */}
        <section
          style={{
            background: "#fafaf8",
            borderTop: "1px solid #e2e8f0",
            borderBottom: "1px solid #e2e8f0",
            paddingTop: "clamp(20px, 2.5vw, 28px)",
            paddingBottom: "clamp(20px, 3vw, 32px)",
          }}
        >
          <div className="sky-container" style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 14,
                marginBottom: 24,
              }}
            >
              <Link
                to="/programmes?type=certification"
                style={{
                  padding: "18px 20px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  textDecoration: "none",
                  color: "#0f172a",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Skill Courses &middot; 6–8 Weeks
                </div>
                <div style={{ fontSize: 14, color: "#475569", marginTop: 4 }}>
                  Recorded concept lessons + live SkyLab case studies.
                </div>
              </Link>
              <Link
                to="/programmes?type=professional"
                style={{
                  padding: "18px 20px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  borderTop: "3px solid #5142b5",
                  background: "#ffffff",
                  textDecoration: "none",
                  color: "#0f172a",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Pro Programs &middot; 4–6 Months
                </div>
                <div style={{ fontSize: 14, color: "#475569", marginTop: 4 }}>
                  Mentor reviews, 2-month internship letter &amp; job assistance.
                </div>
              </Link>
              <Link
                to="/education"
                style={{
                  padding: "18px 20px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  textDecoration: "none",
                  color: "#0f172a",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Degrees &middot; UG &amp; PG
                </div>
                <div style={{ fontSize: 14, color: "#475569", marginTop: 4 }}>
                  Sem 1–8 &middot; Structured online and campus university degree pathways.
                </div>
              </Link>
            </div>
          </div>

          <HomeProgrammes
            programmes={catalog.data ?? []}
            loading={catalogue === "loading"}
            confirmed={true}
            onRetry={() => void catalog.reload()}
          />
        </section>

        {/* Visual Degree Pathways Band (UG & PG) */}
        <section
          aria-label="Degree pathways"
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            padding: "clamp(40px, 5vw, 64px) 0",
          }}
        >
          <div className="sky-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                  UNIVERSITY DEGREE PATHWAYS
                </div>
                <h2 style={{ margin: 0, fontFamily: "var(--font-display, inherit)", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
                  Online &amp; Campus Degrees (Sem 1–8)
                </h2>
              </div>
              <Link to="/education" style={{ fontSize: 14, fontWeight: 600, color: "#5142b5", textDecoration: "none" }}>
                Explore all degrees →
              </Link>
            </div>
            <div className="hx-deg-grid">
              <Link to="/education?level=ug" className="hx-deg-card">
                <div className="hx-deg-card__media">
                  <img src={degreeUgImg} alt="Undergraduate degree pathways" loading="lazy" />
                  <span className="hx-deg-card__pill">BCA &middot; BBA &middot; B.Sc &middot; B.Tech</span>
                </div>
                <div className="hx-deg-card__body">
                  <div className="hx-deg-card__eyebrow">UNDERGRADUATE (UG) &middot; 3–4 YEARS</div>
                  <h3>Undergraduate Degree Pathways</h3>
                  <p>Semester-wise university curriculum paired with practical SkyLab projects &amp; verified portfolio tracking.</p>
                  <span className="hx-deg-card__cta">Explore UG degrees →</span>
                </div>
              </Link>
              <Link to="/education?level=pg" className="hx-deg-card">
                <div className="hx-deg-card__media">
                  <img src={degreePgImg} alt="Postgraduate degree pathways" loading="lazy" />
                  <span className="hx-deg-card__pill">MCA &middot; MBA &middot; M.Sc</span>
                </div>
                <div className="hx-deg-card__body">
                  <div className="hx-deg-card__eyebrow">POSTGRADUATE (PG) &middot; 2 YEARS</div>
                  <h3>Postgraduate Specialisations</h3>
                  <p>Designed for graduates and working professionals with applied capstones and executive case studies.</p>
                  <span className="hx-deg-card__cta">Explore PG degrees →</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 3: Product Proof - Inside the Learning Workspace (AFTER Courses, with Login Gate) */}
        <section
          className="hx-platform-hub"
          aria-label="Inside the Skylent learning workspace"
          style={{
            background: "#ffffff",
            padding: "clamp(32px, 4vw, 48px) 0 clamp(36px, 4vw, 48px)",
          }}
        >
          <InsideProgramme />
          <div className="sky-container" style={{ marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 14,
                padding: "16px 22px",
                borderRadius: 14,
                background: "#fafaf8",
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: 14.5, color: "#0f172a" }}>
                  Interactive preview mode &mdash; full SkyLab workspaces require a free account
                </strong>
                <span style={{ fontSize: 13.5, color: "#475569" }}>
                  Sign in to write queries, submit business case studies, and publish verified /verify portfolio links.
                </span>
              </div>
              <Link
                to="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  borderRadius: 999,
                  background: "#5142b5",
                  color: "#ffffff",
                  fontSize: 13.5,
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Sign in free to unlock SkyLab →
              </Link>
            </div>
          </div>
        </section>

        {/* Section 4: Clean Final CTA */}
        <HomeClosing />
      </div>
    </PageShell>
  )
}
