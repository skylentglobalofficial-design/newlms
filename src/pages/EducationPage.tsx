/**
 * Education landing (repolish): degrees only, organised the way learners choose.
 *
 *   Level   → Undergraduate (UG) and Postgraduate (PG)
 *   Mode    → Online and On campus, inside each level
 *
 *   /education                      → both levels, both modes
 *   /education?level=ug|pg          → one level
 *   /education?mode=online|campus   → one mode (old links keep working)
 *
 * Cards come only from listDegrees() (src/lib/degrees.ts, backed by src/data/education.ts).
 * Degrees are not in the backend and no institution is confirmed yet, so every listing says
 * "Not open yet" and offers an enquiry instead of an application. Nothing names a
 * university, fee, date or campus. Schooling and exam preparation are not foregrounded here.
 */
import { useEffect } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ArrowRight } from "../components/skylent/primitives"
import { openSkylentAi } from "../components/skylent/ai-events"
import { degreePath, deliveryModeFromParam, listDegrees, type Degree, type DeliveryMode } from "../lib/degrees"
import { EDUCATION_HASH_REDIRECTS } from "../lib/product-architecture"
import photoOnlineUg from "@/assets/site/degree-computing.jpg"
import photoCampusUg from "@/assets/site/hero-classroom.jpg"
import photoOnlinePg from "@/assets/site/degree-business.jpg"
import photoCampusPg from "@/assets/site/degree-management.jpg"
import "./EducationRepolish.css"

type Level = "UNDERGRADUATE" | "POSTGRADUATE"

const LEVELS: { id: Level; param: "ug" | "pg"; title: string; short: string; lead: string }[] = [
  { id: "UNDERGRADUATE", param: "ug", title: "Undergraduate degrees", short: "UG", lead: "Your first degree after school, studied over several years." },
  { id: "POSTGRADUATE", param: "pg", title: "Postgraduate degrees", short: "PG", lead: "A specialised degree after graduation, often alongside work." },
]

const MODE_COPY: Record<DeliveryMode, { label: string; line: string; photos: Record<Level, { src: string; alt: string }> }> = {
  ONLINE: {
    label: "Online",
    line: "Learn on screen: recorded lectures, live sessions and assessed work, on a weekly rhythm you can fit around life.",
    photos: {
      UNDERGRADUATE: { src: photoOnlineUg, alt: "A student in a video lesson on a laptop at home." },
      POSTGRADUATE: { src: photoOnlinePg, alt: "A learner taking notes beside a laptop." },
    },
  },
  CAMPUS: {
    label: "On campus",
    line: "Attend in person: lectures, labs and tutorials on a timetable, at the institution that awards the degree.",
    photos: {
      UNDERGRADUATE: { src: photoCampusUg, alt: "Students at long benches in a lecture hall." },
      POSTGRADUATE: { src: photoCampusPg, alt: "Two students studying together outdoors on a campus lawn." },
    },
  },
}

const COMPARE = [
  { label: "Where you study", online: "Anywhere, on screen", campus: "At the institution" },
  { label: "Timetable", online: "Weekly, mostly flexible", campus: "Fixed lectures and labs" },
  { label: "Teaching", online: "Recorded and live sessions", campus: "Face to face" },
  { label: "Best for", online: "Learners who work or live far away", campus: "Full-time study in person" },
]

function levelFromParam(value: string | null): Level | null {
  if (value === "ug") return "UNDERGRADUATE"
  if (value === "pg") return "POSTGRADUATE"
  return null
}

function DegreeRow({ degree }: { degree: Degree }) {
  return (
    <li>
      <Link to={degreePath(degree)} className="edx-degree">
        <span className="edx-degree__title">{degree.title}</span>
        <span className="edx-degree__meta">
          <span className="edx-soon">Not open yet</span>
          <span>{degree.discipline}</span>
        </span>
        <span className="edx-degree__go">
          View degree
          <ArrowRight />
        </span>
      </Link>
    </li>
  )
}

function ModeCard({ level, mode, degrees }: { level: (typeof LEVELS)[number]; mode: DeliveryMode; degrees: Degree[] }) {
  const copy = MODE_COPY[mode]
  const photo = copy.photos[level.id]
  const modeParam = mode === "ONLINE" ? "online" : "campus"
  return (
    <article className={`edx-mode edx-mode--${modeParam}`} aria-labelledby={`edx-${level.param}-${modeParam}`}>
      <div className="edx-mode__media">
        <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
        <span className="edx-mode__tag">{copy.label}</span>
      </div>
      <div className="edx-mode__body">
        <h3 id={`edx-${level.param}-${modeParam}`} className="edx-mode__title">
          {level.short} {copy.label.toLowerCase()}
        </h3>
        <p className="edx-mode__line">{copy.line}</p>
        {degrees.length ? (
          <ul className="edx-degrees">
            {degrees.map((degree) => (
              <DegreeRow key={degree.slug} degree={degree} />
            ))}
          </ul>
        ) : (
          <div className="edx-none">
            <p>
              {level.short} {copy.label.toLowerCase()} degrees will be listed here once an institution is confirmed.
            </p>
            <Link className="edx-link" to="/contact">
              Register your interest
              <ArrowRight />
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}

export default function EducationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const mode = deliveryModeFromParam(params.get("mode"))
  const level = levelFromParam(params.get("level"))

  useEffect(() => {
    const id = location.hash.replace("#", "")
    const target = EDUCATION_HASH_REDIRECTS[id]
    if (target) navigate(target, { replace: true })
  }, [location.hash, navigate])

  const all = listDegrees()
  const levels = level ? LEVELS.filter((item) => item.id === level) : LEVELS
  const modes: DeliveryMode[] = mode ? [mode] : ["ONLINE", "CAMPUS"]
  const href = (next: { level?: string | null; mode?: string | null }) => {
    const query = new URLSearchParams()
    const l = next.level === undefined ? params.get("level") : next.level
    const m = next.mode === undefined ? params.get("mode") : next.mode
    if (l) query.set("level", l)
    if (m) query.set("mode", m)
    const qs = query.toString()
    return qs ? `/education?${qs}` : "/education"
  }

  return (
    <PageShell aurora={false}>
      <div className="site-light edx">
        <section className="edx-hero" aria-labelledby="edx-title">
          <div className="sky-container edx-hero__inner">
            <div>
              <p className="edx-eyebrow">Degrees</p>
              <h1 id="edx-title" className="edx-h1">
                UG and PG degrees, <em>online or on campus.</em>
              </h1>
              <p className="edx-lede">Choose your level, then how you want to study. These are planned degree areas: no institution is confirmed yet, so you can register interest but not apply.</p>
            </div>
            <nav className="edx-filters" aria-label="Filter degrees">
              <div className="edx-filter" role="group" aria-label="Level">
                <span className="edx-filter__label">Level</span>
                {[
                  { label: "All", value: null },
                  { label: "UG", value: "ug" },
                  { label: "PG", value: "pg" },
                ].map((item) => (
                  <Link key={item.label} to={href({ level: item.value })} aria-current={(params.get("level") ?? null) === item.value ? "true" : undefined}>
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="edx-filter" role="group" aria-label="Study mode">
                <span className="edx-filter__label">Mode</span>
                {[
                  { label: "All", value: null },
                  { label: "Online", value: "online" },
                  { label: "On campus", value: "campus" },
                ].map((item) => (
                  <Link key={item.label} to={href({ mode: item.value })} aria-current={(params.get("mode") ?? null) === item.value ? "true" : undefined}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </section>

        {/* Target of the "Degrees" breadcrumb on degree pages (/education#degrees). */}
        <span id="degrees" aria-hidden="true" />
        {levels.map((item) => (
          <section key={item.id} id={item.param} className="edx-level" aria-labelledby={`edx-level-${item.param}`}>
            <div className="sky-container">
              <header className="edx-level__head">
                <h2 id={`edx-level-${item.param}`}>
                  {item.title} <span>({item.short})</span>
                </h2>
                <p>{item.lead}</p>
              </header>
              <div className={modes.length === 1 ? "edx-modes edx-modes--one" : "edx-modes"}>
                {modes.map((m) => (
                  <ModeCard key={m} level={item} mode={m} degrees={all.filter((degree) => degree.level === item.id && degree.deliveryMode === m)} />
                ))}
              </div>
            </div>
          </section>
        ))}

        {!mode ? (
          <section className="edx-compare" aria-labelledby="edx-compare-title">
            <div className="sky-container">
              <h2 id="edx-compare-title" className="edx-h2">Online or on campus?</h2>
              <div className="edx-table" role="table" aria-label="Online and on-campus study compared">
                <div className="edx-table__row edx-table__row--head" role="row">
                  <span role="columnheader" />
                  <span role="columnheader">Online</span>
                  <span role="columnheader">On campus</span>
                </div>
                {COMPARE.map((row) => (
                  <div key={row.label} className="edx-table__row" role="row">
                    <span role="rowheader">{row.label}</span>
                    <span role="cell">{row.online}</span>
                    <span role="cell">{row.campus}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="edx-help" aria-labelledby="edx-help-title">
          <div className="sky-container edx-help__inner">
            <div>
              <h2 id="edx-help-title">Not sure which degree fits?</h2>
              <p>Answer a few questions with Skylent AI, or ask the Skylent team directly.</p>
            </div>
            <div className="edx-help__actions">
              <button type="button" className="sk-btn sk-btn-primary" onClick={() => openSkylentAi("finder")}>
                Ask Skylent AI
                <ArrowRight />
              </button>
              <Link className="sk-btn sk-btn-secondary" to="/contact">
                Talk to the team
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
