/**
 * Learn ("After you enrol"): a guided walkthrough of the learner experience, from choosing a programme
 * to the finished work appearing in Career OS. One product window stays on screen; its address and
 * sidebar move with each step so the journey reads as one continuous flow.
 *
 * Titles, counts and lab figures come from the authored Data Analytics course and programme content.
 * The window is an illustration of the product: it is not a learner account and changes nothing.
 * Timing, pausing and reduced motion are handled by useWalkthrough.
 */
import { Action } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { NORTHWIND, authoredProgrammeContent, rupees } from "@/components/programme/programme-content"
import { courseFacts, type CourseFacts } from "./course-facts"
import { WalkControls } from "./Repolish"
import { useWalkthrough } from "./useWalkthrough"

const PROGRAMME_SLUG = "data-analytics-pro"

const TOUR = [
  { key: "choose", title: "Choose a programme", path: "/programmes/data-analytics-pro", nav: null },
  { key: "enrol", title: "Enrol", path: "/programmes/data-analytics-pro", nav: null },
  { key: "home", title: "Arrive at your student home", path: "/dashboard/student", nav: "Learning" },
  { key: "lesson", title: "Open the next lesson", path: "/learn/data-analytics/l7", nav: "Learning" },
  { key: "progress", title: "Review material and progress", path: "/learn/data-analytics", nav: "Learning" },
  { key: "lab", title: "Practise in the lab", path: "/os/labs/data-analytics/northwind", nav: "Practice" },
  { key: "project", title: "Work on the project", path: "/dashboard/student", nav: "Projects" },
  { key: "evidence", title: "Review your work", path: "/career-os/projects", nav: "Evidence" },
  { key: "profile", title: "See it in your profile", path: "/career-os/profile", nav: "Career" },
] as const

type TourKey = (typeof TOUR)[number]["key"]
const SIDEBAR = ["Learning", "Practice", "Projects", "Evidence", "Career"] as const

function TourScreen({ step, facts }: { step: TourKey; facts: CourseFacts }) {
  const content = authoredProgrammeContent(PROGRAMME_SLUG)
  const record = content?.evidence.record
  switch (step) {
    case "choose":
      return (
        <div className="hx-tour__screen">
          <span className="hx-tour__label">Professional programme</span>
          <span className="hx-tour__h">{facts.title}</span>
          <span className="hx-tour__p">{content?.cardLine}</span>
          <span className="hx-tour__meta">
            {facts.stats.modules} modules · {facts.stats.lessons} lessons · capstone: {content?.capstoneTitle}
          </span>
          <span className="hx-tour__btn is-focus">Start this programme</span>
        </div>
      )
    case "enrol":
      return (
        <div className="hx-tour__screen hx-tour__screen--dim">
          <div className="hx-tour__dialog">
            <span className="hx-tour__h hx-tour__h--sm">Enrol in {facts.title}</span>
            <span className="hx-tour__check">
              <span className="hx-tour__box" aria-hidden="true" /> I accept the Terms &amp; Conditions and Privacy Policy
            </span>
            <span className="hx-tour__note">Payment is not collected in this pilot.</span>
            <span className="hx-tour__btn is-focus">Enrol</span>
          </div>
        </div>
      )
    case "home":
      return (
        <div className="hx-tour__screen">
          <span className="hx-tour__h hx-tour__h--sm">What to do next</span>
          <div className="hx-tour__card hx-tour__card--accent">
            <span className="hx-tour__label">
              {facts.title} · M{facts.currentModuleNumber} · {facts.current.kind}
            </span>
            <span className="hx-tour__t">
              Lesson {facts.lessonNumber} · {facts.current.title}
            </span>
            <span className="hx-tour__track"><span style={{ width: `${facts.percent}%` }} /></span>
            <span className="hx-tour__row">
              <span className="hx-tour__meta">
                {facts.done} of {facts.total} lessons complete
              </span>
              <span className="hx-tour__btn hx-tour__btn--sm is-focus">Continue learning</span>
            </span>
          </div>
        </div>
      )
    case "lesson":
      return (
        <div className="hx-tour__screen">
          <div className="hx-tour__lessonhead">
            <span className="hx-tour__label hx-tour__label--light">
              Module {facts.currentModuleNumber} · Lesson {facts.lessonNumber} · {facts.current.kind}
              {facts.current.duration ? ` · ${facts.current.duration}` : ""}
            </span>
            <span className="hx-tour__t hx-tour__t--light">{facts.current.title}</span>
          </div>
          <span className="hx-tour__lines" aria-hidden="true">
            <span style={{ width: "92%" }} />
            <span style={{ width: "84%" }} />
            <span style={{ width: "66%" }} />
          </span>
        </div>
      )
    case "progress":
      return (
        <div className="hx-tour__screen">
          <span className="hx-tour__label">Course outline</span>
          {facts.modules.map((module) => (
            <span key={module.id} className={`hx-tour__mod hx-tour__mod--${module.state}`}>
              <span className="hx-tour__modn">{module.label}</span>
              <span className="hx-tour__modt">{module.title}</span>
              <span className="hx-tour__ticks" aria-hidden="true">
                {module.lessons.map((lesson, i) => (
                  <span key={lesson.id} className={i < module.done ? "is-on" : undefined} />
                ))}
              </span>
            </span>
          ))}
        </div>
      )
    case "lab":
      return (
        <div className="hx-tour__screen">
          <span className="hx-tour__label">Northwind Lab · Northwind Retail sales extract</span>
          <span className="hx-tour__t">Net revenue by category</span>
          <span className="hx-tour__meta">Valid rows only: units and price above zero, not returned.</span>
          <span className="hx-tour__table">
            {NORTHWIND.categories.map((row) => (
              <span key={row.name} className="hx-tour__tr">
                <span>{row.name}</span>
                <span>{rupees(row.value)}</span>
              </span>
            ))}
          </span>
        </div>
      )
    case "project":
      return (
        <div className="hx-tour__screen">
          <span className="hx-tour__label">Capstone · Module {facts.capstoneModuleNumber} assignment</span>
          <span className="hx-tour__t">{content?.capstoneTitle ?? facts.capstoneTitle}</span>
          {["Read the brief", "Validate the data", "Build the analysis", "Write the recommendation"].map((task, i) => (
            <span key={task} className="hx-tour__task">
              <span className={i < 2 ? "hx-tour__tick is-on" : "hx-tour__tick"} aria-hidden="true" />
              {task}
            </span>
          ))}
        </div>
      )
    case "evidence":
      return (
        <div className="hx-tour__screen">
          <span className="hx-tour__label">Evidence record</span>
          <span className="hx-tour__t">{record?.title}</span>
          <span className="hx-tour__kv"><span>Context</span><span>{record?.context}</span></span>
          <span className="hx-tour__kv"><span>What it shows</span><span>{record?.workShown.split(", ").slice(0, 4).join(", ")}</span></span>
          <span className="hx-tour__note">{record?.footnote}</span>
        </div>
      )
    case "profile":
      return (
        <div className="hx-tour__screen">
          <span className="hx-tour__label">Career OS · profile</span>
          <span className="hx-tour__kv"><span>Projects</span><span><b>{record?.title}</b> · added from a finished project</span></span>
          <span className="hx-tour__kv"><span>Skills you add</span><span>{(record?.skills ?? []).join(", ")}</span></span>
          <span className="hx-tour__note">Your profile has a visibility setting that you control.</span>
        </div>
      )
  }
}

export function Learn() {
  const facts = courseFacts()
  const walk = useWalkthrough<HTMLElement>(TOUR.length, 2000)
  if (!facts) return null
  const step = TOUR[walk.active]
  return (
    <section ref={walk.rootRef} id="learn" className="hx-tour" aria-labelledby="hm-learn-title">
      <div className="sky-container hx-tour__grid" {...walk.regionProps}>
        <div className="hx-tour__copy">
          <Reveal stagger step={80}>
            <p className="hx-eyebrow hx-eyebrow--dark">After you enrol</p>
            <h2 id="hm-learn-title" className="hx-h2">
              Open Skylent and <em>know what to do next.</em>
            </h2>
            <p className="hx-tour__lead">From choosing a programme to seeing the finished work in your profile, in nine steps.</p>
          </Reveal>
          <ol className="hx-tour__steps" aria-label="What happens after you enrol">
            {TOUR.map((item, i) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={i === walk.active ? "hx-tour__step is-on" : i < walk.active ? "hx-tour__step is-done" : "hx-tour__step"}
                  aria-current={i === walk.active ? "step" : undefined}
                  onClick={() => walk.go(i)}
                >
                  <span className="hx-tour__stepn" aria-hidden="true">{i + 1}</span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
          <Action to="/signup" kind="secondary">Create your account</Action>
        </div>

        <figure className="hx-tour__figure">
          <div className="hx-tour__window">
            <div className="hx-tour__bar" aria-hidden="true">
              <span className="hx-tour__dots"><span /><span /><span /></span>
              <span className="hx-tour__url">skylent.live{step.path}</span>
            </div>
            <div className={step.nav ? "hx-tour__app" : "hx-tour__app hx-tour__app--public"}>
              {step.nav ? (
                <span className="hx-tour__side" aria-hidden="true">
                  <span className="hx-tour__brand">Skylent</span>
                  {SIDEBAR.map((item) => (
                    <span key={item} className={item === step.nav ? "hx-tour__nav is-on" : "hx-tour__nav"}>{item}</span>
                  ))}
                </span>
              ) : (
                <span className="hx-tour__topbar" aria-hidden="true">
                  <span className="hx-tour__brand">Skylent</span>
                </span>
              )}
              <div className="hx-tour__main" key={step.key}>
                <p className="hx-sr">
                  Step {walk.active + 1} of {TOUR.length}: {step.title}.
                </p>
                <div aria-hidden="true">
                  <TourScreen step={step.key} facts={facts} />
                </div>
              </div>
            </div>
            <div className="hx-tour__progress" aria-hidden="true">
              {TOUR.map((item, i) => (
                <span key={item.key} className={i <= walk.active ? "is-on" : undefined} />
              ))}
            </div>
          </div>
          <figcaption className="hx-tour__caption">
            <WalkControls active={walk.active} count={TOUR.length} title={step.title} playing={walk.playing} onPrev={walk.prev} onNext={walk.next} onToggle={walk.toggle} />
            <span className="hx-tour__disclaimer">An illustration of the product using the Data Analytics programme, not a learner&apos;s account.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
