import { useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { PageShell } from "../components/shared"
import { AcademicSubnav, AcademicLineIndex, LiveCoreRail, MaturityMark } from "../components/product/Architecture"
import { EDUCATION_HASH_REDIRECTS } from "../lib/product-architecture"
import { C, T } from "../tokens"

export default function EducationPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const id = location.hash.replace("#", "")
    const target = EDUCATION_HASH_REDIRECTS[id]
    if (target) navigate(target, { replace: true })
  }, [location.hash, navigate])

  return (
    <PageShell aurora={false}>
      <div className="arch-academic-shell" style={{ paddingTop: T.navH + 28 }}>
        <div className="arch-academic-inner">
          <AcademicSubnav />
          <header className="arch-line-header" style={{ marginBottom: 36 }}>
            <div className="skylent-label" style={{ color: C.indigo, marginBottom: 14 }}>Education</div>
            <h1 className="skylent-display-md" style={{ color: C.ink, margin: "0 0 14px", maxWidth: 740 }}>
              Academic product lines.<br />Not a live course catalogue.
            </h1>
            <p className="skylent-body-lg" style={{ color: C.slate, margin: 0, maxWidth: 560 }}>
              Schooling, undergraduate, postgraduate, and exams are how Skylent will serve institutions and academic learners. They are in design. They are not enrollable catalogues today.
            </p>
          </header>

          <AcademicLineIndex />

          <section className="arch-section" style={{ paddingTop: 48 }}>
            <LiveCoreRail lead="If you want to start now, open a live course or programme. Skylent OS and Career OS follow after enrol." />
            <div className="edu-start-row">
              <Link to="/courses/data-analytics">
                <strong>Start Data Analytics</strong>
                <span>Ready written course</span>
              </Link>
              <Link to="/courses/product-management">
                <strong>Start Product Management</strong>
                <span>Ready written course</span>
              </Link>
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 16 }}>
              <Link to="/programs" style={{ color: C.indigo, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Open programmes →</Link>
              <Link to="/courses" style={{ color: C.slate, fontSize: 14, textDecoration: "none" }}>Open courses</Link>
            </div>
          </section>

          <section className="arch-section">
            <div className="skylent-label" style={{ color: C.slate, marginBottom: 12 }}>How to read this area</div>
            <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, maxWidth: 640, margin: 0 }}>
              Each line has a distinct academic model. Postgraduate is not undergraduate with a different heading. Exams are a performance system, not a degree. Nothing here fabricates classes, faculty, or results.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <MaturityMark maturity="coming_soon" />
              <span style={{ color: C.slate, fontSize: 13 }}>means the product model is specified, not shipping as a catalogue.</span>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  )
}
