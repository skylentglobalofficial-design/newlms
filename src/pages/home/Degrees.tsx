/**
 * Degrees: one online and one on-campus sample route from src/data/education.ts.
 * Degrees are not in the backend, so every tile carries the truth chip for "degrees"
 * and nothing about an institution, duration or campus is stated.
 */
import { Action, SectionIndex, SpecSheet, TruthChip } from "@/components/skylent/primitives"
import { DEGREE_ROUTES, DEGREE_SAMPLE_NOTE, type DegreeRoute } from "@/data/education"
import { degreeImage } from "@/data/educationImages"
import { Reveal } from "@/components/skylent/Reveal"
import { truthOf } from "@/lib/truth"

const NOT_PUBLISHED = "Not yet published"

/** The design leads with a postgraduate online route; fall back to any online route. */
function pickRoutes(): { online?: DegreeRoute; campus?: DegreeRoute } {
  const online = DEGREE_ROUTES.filter((route) => route.studyMode === "online")
  return {
    online: online.find((route) => route.level === "PG") ?? online[0],
    campus: DEGREE_ROUTES.find((route) => route.studyMode === "offline"),
  }
}

/** Illustrative: the shape of a week of online study. Not a timetable. */
function LearningWeek() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const kind: Record<string, string> = { Mon: "recorded", Wed: "live", Fri: "due" }
  const rows = [
    ["Mon", "recorded", "Recorded lecture", "Any time"],
    ["Wed", "live", "Live session", "Set time"],
    ["Fri", "due", "Assessment due", "Deadline"],
  ] as const
  return (
    <div className="hm-card hm-week">
      <div className="hm-week__head">
        <span className="sky-label">Learning week</span>
        <TruthChip state="illustrative" />
      </div>
      <div className="hm-week__grid" aria-hidden="true">
        {days.map((day) => (
          <span key={day} className={kind[day] ? "hm-week__day hm-week__day--on" : "hm-week__day"}>{day}</span>
        ))}
        {days.map((day) => (
          <span key={day} className={`hm-week__cell${kind[day] ? ` hm-week__cell--${kind[day]}` : ""}`} />
        ))}
      </div>
      <ul className="hm-week__rows">
        {rows.map(([day, type, label, when]) => (
          <li key={day} className={type === "live" ? "hm-week__row hm-week__row--on" : "hm-week__row"}>
            <span className={`hm-week__key hm-week__key--${type}`} aria-hidden="true" />
            <span className="hm-week__when">{day}</span>
            <span className="hm-week__what">{label}</span>
            <span className="hm-week__time">{when}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DegreeBody({ route, mode, rows }: { route: DegreeRoute; mode: string; rows: { label: string; value: string }[] }) {
  return (
    <div className="hm-degree__body">
      <div className="hm-degree__top">
        <span className="sky-label hm-degree__mode">{mode}</span>
        {route.sample ? <TruthChip state={truthOf("degrees")} /> : null}
      </div>
      <h3 className="hm-degree__title">{route.title}</h3>
      <SpecSheet className="hm-degree__spec" rows={rows} />
      <Action to={`/education/degrees/${route.slug}`} kind="quiet">
        View pathway<span className="hm-sr">: {route.title}</span>
      </Action>
    </div>
  )
}

export function Degrees() {
  const { online, campus } = pickRoutes()
  if (!online && !campus) return null
  const campusImage = campus ? degreeImage(campus.slug) : null
  return (
    <section id="degrees" className="hm-study sky-band-proof" aria-labelledby="hm-degrees-title">
      <div className="sky-container">
        <Reveal className="hm-head">
          <div className="hm-head__main">
            <SectionIndex n="05" label="Study" />
            <h2 id="hm-degrees-title" className="sky-display sky-display--md">
              Study online <em>or on campus.</em>
            </h2>
          </div>
          <div className="hm-head__aside">
            <p>Two different ways to take a degree, kept apart: a week you arrange yourself, or a place you go to.</p>
            <Action to="/education" kind="quiet">Explore degrees</Action>
          </div>
        </Reveal>

        <div className="hm-degrees">
          {online ? (
            <Reveal as="article" className="hm-degree">
              <figure className="hm-degree__media">
                <div className="hm-degree__box hm-degree__box--mat">
                  <LearningWeek />
                </div>
                <figcaption className="hm-degree__caption">
                  <span>FIG. 03 · A week of online study</span>
                  <span>Not a real timetable</span>
                </figcaption>
              </figure>
              <DegreeBody
                route={online}
                mode="Online"
                rows={[
                  { label: "Institution", value: NOT_PUBLISHED },
                  { label: "Duration", value: NOT_PUBLISHED },
                ]}
              />
            </Reveal>
          ) : null}

          {campus ? (
            <Reveal as="article" className="hm-degree" delay={100}>
              {campusImage ? (
                <figure className="hm-degree__media">
                  <div className="hm-degree__box">
                    <img className="hm-degree__photo" src={campusImage.src} alt={campusImage.alt} decoding="async" />
                  </div>
                  <figcaption className="hm-degree__caption">
                    <span>FIG. 04 · A campus computer lab</span>
                    <span>Stand-in photograph</span>
                  </figcaption>
                </figure>
              ) : null}
              <DegreeBody
                route={campus}
                mode="On campus"
                rows={[
                  { label: "Institution", value: NOT_PUBLISHED },
                  { label: "Campus", value: NOT_PUBLISHED },
                ]}
              />
            </Reveal>
          ) : null}
        </div>
        <p className="hm-note hm-note--wide">{DEGREE_SAMPLE_NOTE}</p>
      </div>
    </section>
  )
}
