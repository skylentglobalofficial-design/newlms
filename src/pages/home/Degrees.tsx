/**
 * Degrees: one online and one on-campus sample route from src/data/education.ts.
 * Degrees are not in the backend, so every tile carries the truth chip for "degrees"
 * and nothing about an institution, duration or campus is stated.
 */
import { Action, SectionIndex, SpecSheet, TruthChip } from "@/components/skylent/primitives"
import { DEGREE_ROUTES, DEGREE_SAMPLE_NOTE, type DegreeRoute } from "@/data/education"
import { degreeImage } from "@/data/educationImages"
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
    <section id="degrees" className="sky-container hm-section" aria-labelledby="hm-degrees-title">
      <div className="hm-head hm-head--row">
        <div className="hm-head__main hm-head__main--wide">
          <SectionIndex n="04" label="Degrees" />
          <h2 id="hm-degrees-title" className="hm-h2">Study online or on campus.</h2>
        </div>
        <Action to="/education" kind="quiet">Explore degrees</Action>
      </div>

      <div className="hm-degrees">
        {online ? (
          <article className="hm-degree">
            <div className="hm-degree__mat">
              <LearningWeek />
            </div>
            <div className="hm-degree__caption hm-degree__caption--mat">
              <span>FIG. 03 · A week of online study</span>
              <span>Not a real timetable</span>
            </div>
            <DegreeBody
              route={online}
              mode="Online"
              rows={[
                { label: "Institution", value: NOT_PUBLISHED },
                { label: "Duration", value: NOT_PUBLISHED },
              ]}
            />
          </article>
        ) : null}

        {campus ? (
          <article className="hm-degree">
            {campusImage ? (
              <>
                <img className="hm-degree__photo" src={campusImage.src} alt={campusImage.alt} decoding="async" />
                <div className="hm-degree__caption">
                  <span>FIG. 04 · A campus computer lab</span>
                  <span>Stand-in photograph</span>
                </div>
              </>
            ) : null}
            <DegreeBody
              route={campus}
              mode="On campus"
              rows={[
                { label: "Institution", value: NOT_PUBLISHED },
                { label: "Campus", value: NOT_PUBLISHED },
              ]}
            />
          </article>
        ) : null}
      </div>
      <p className="hm-note hm-note--wide">{DEGREE_SAMPLE_NOTE}</p>
    </section>
  )
}
