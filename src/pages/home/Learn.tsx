/**
 * After you enrol: a connected illustration of the learner path.
 * Stages follow the real product: enrol, the student home, lessons, projects,
 * Career OS evidence, and opportunities. Opportunities are not published yet.
 * Nothing here enrols, pays, or applies for a role. Motion pauses while the
 * pointer or keyboard focus is inside the section, and it stays still when
 * the visitor prefers reduced motion.
 */
import { useEffect, useRef, useState, type CSSProperties, type FocusEvent } from "react"
import { authoredProgrammeContent } from "@/components/programme/programme-content"
import { courseFacts } from "./course-facts"

const PROGRAMME_SLUG = "data-analytics-pro"
const STAGES = [
  { key: "enrol", title: "Enrol" },
  { key: "courses", title: "My Courses" },
  { key: "lessons", title: "Lessons" },
  { key: "projects", title: "Projects" },
  { key: "career", title: "Career OS" },
  { key: "opportunities", title: "Opportunities" },
] as const

type StageKey = (typeof STAGES)[number]["key"]

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
}

function StageScreen({ stage }: { stage: StageKey }) {
  const facts = courseFacts()
  const content = authoredProgrammeContent(PROGRAMME_SLUG)
  const record = content?.evidence.record
  if (stage === "enrol") {
    return (
      <div className="hx-enrol">
        <p className="hx-k">Enrolment</p>
        <h3>Enrol in {facts?.title ?? "Data Analytics"}</h3>
        <p className="hx-enrol__meta">{facts ? `${facts.stats.modules} modules · ${facts.stats.lessons} lessons` : "The open programme"}</p>
        <p className="hx-enrol__check"><span aria-hidden="true" /> Accept the Terms &amp; Conditions and Privacy Policy</p>
        <p className="hx-flow__pay">Payment is not collected in this pilot.</p>
        <span className="hx-enrol__go">Enrol</span>
      </div>
    )
  }
  if (stage === "courses") {
    if (!facts) return <p className="hx-canvas__note">The course list is not available in this preview.</p>
    return (
      <div className="hx-canvas">
        <div className="hx-canvas__head">
          <div>
            <p className="hx-k">My courses</p>
            <h3>{facts.title}</h3>
          </div>
          <p>Lesson {facts.lessonNumber} of {facts.total}</p>
        </div>
        <article className="hx-course">
          <div>
            <strong>{facts.currentModule.title}</strong>
            <span>{facts.current.title}</span>
          </div>
          <span className="hx-bar" aria-hidden="true"><span style={{ width: `${facts.percent}%` }} /></span>
          <p>{facts.done} of {facts.total} lessons before this one in the preview.</p>
        </article>
        <ol className="hx-mods hx-mods--mini">
          {facts.modules.map((module) => (
            <li key={module.id} className={`is-${module.state}`}>
              <span>{module.label}</span>
              <span><strong>{module.title}</strong></span>
            </li>
          ))}
        </ol>
      </div>
    )
  }
  if (stage === "lessons") {
    if (!facts) return <p className="hx-canvas__note">The lesson list is not available in this preview.</p>
    return (
      <div className="hx-canvas hx-canvas--split">
        <ol className="hx-lessons">
          {facts.currentModule.lessons.map((lesson) => {
            const place = facts.currentModule.lessons.findIndex((item) => item.id === lesson.id)
            const current = facts.currentModule.lessons.findIndex((item) => item.id === facts.current.id)
            return (
              <li key={lesson.id} className={place === current ? "is-open" : place < current ? "is-earlier" : undefined}>
                <span>{lesson.label}</span>
                <span>{lesson.title}</span>
              </li>
            )
          })}
        </ol>
        <div>
          <p className="hx-k">Module {facts.currentModuleNumber} · {facts.current.kind}</p>
          <h3>{facts.current.title}</h3>
          <p className="hx-canvas__note">Written lesson in the workspace. Not your place in the course.</p>
          <span className="hx-bar" aria-hidden="true"><span style={{ width: `${facts.percent}%` }} /></span>
        </div>
      </div>
    )
  }
  if (stage === "projects") {
    return (
      <div className="hx-canvas">
        <div className="hx-canvas__head">
          <div>
            <p className="hx-k">Project workspace</p>
            <h3>{content?.capstoneTitle ?? facts?.capstoneTitle ?? "Capstone"}</h3>
          </div>
        </div>
        <ol className="hx-deliver">
          {[
            ["Read the brief", "The question the extract can answer"],
            ["Build the analysis", "Queries and the result tables"],
            ["Write the recommendation", "What someone should do next"],
          ].map(([task, detail], index) => (
            <li key={task} className={index === 1 ? "is-open" : undefined}>
              <span>{index + 1}</span>
              <span><strong>{task}</strong><em>{detail}</em></span>
            </li>
          ))}
        </ol>
      </div>
    )
  }
  if (stage === "career") {
    return (
      <div className="hx-canvas">
        <div className="hx-canvas__head">
          <div>
            <p className="hx-k">Career OS · evidence</p>
            <h3>{record?.title ?? "Finished project"}</h3>
          </div>
        </div>
        <dl className="hx-record">
          <div><dt>Context</dt><dd>{record?.context}</dd></div>
          <div><dt>What it shows</dt><dd>{record?.workShown}</dd></div>
        </dl>
        <p className="hx-chips">
          {(record?.skills ?? []).slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}
        </p>
        <p className="hx-canvas__note">Not a connected profile. {record?.footnote}</p>
      </div>
    )
  }
  return (
    <div className="hx-empty">
      <p className="hx-k">Opportunities</p>
      <h3>No openings are published yet.</h3>
      <p>You can record applications you send. Skylent does not apply for you, and this preview is not your account.</p>
    </div>
  )
}

export function Learn() {
  const rootRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [reduced] = useState(prefersReducedMotion)
  const [inView, setInView] = useState(false)
  const [paused, setPaused] = useState(false)
  const stage = STAGES[active]

  useEffect(() => {
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reduced || !inView || paused) return
    const timer = window.setInterval(() => setActive((current) => (current + 1) % STAGES.length), 3200)
    return () => window.clearInterval(timer)
  }, [reduced, inView, paused])

  return (
    <section
      ref={rootRef}
      id="learn"
      className="hx-tour"
      aria-labelledby="hm-learn-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div className="sky-container hx-flow">
        <div className="hx-flow__copy">
          <p className="hx-eyebrow hx-eyebrow--dark">After you enrol</p>
          <h2 id="hm-learn-title" className="hx-h2 hx-h2--sm">Open the workspace and continue.</h2>
          <p className="hx-flow__lead">Enrol, open your courses, then lessons, projects and the work you keep.</p>
          <p className="hx-flow__pay">Payment is not collected in this pilot.</p>
        </div>
        <div className="hx-flow__railwrap" style={{ "--stage": active } as CSSProperties}>
          <span className="hx-flow__line" aria-hidden="true" />
          <span className="hx-flow__mark" aria-hidden="true" />
          <ol className="hx-flow__rail" aria-label="What happens after you enrol">
            {STAGES.map((item, index) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={index === active ? "is-on" : index < active ? "is-done" : undefined}
                  aria-current={index === active ? "step" : undefined}
                  onClick={() => setActive(index)}
                >
                  <span className="hx-flow__dot" aria-hidden="true" />
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="hx-app">
          <div className="hx-app__bar">
            <span>Skylent</span>
            <span>Illustrative preview · Not connected</span>
          </div>
          <div className="hx-app__body" key={stage.key}>
            <p className="hx-sr">{stage.title}. Illustrative preview, not a connected account.</p>
            <StageScreen stage={stage.key} />
          </div>
        </div>
      </div>
    </section>
  )
}
