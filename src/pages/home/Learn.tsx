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
      <div className="hx-flow__screen">
        <p className="hx-flow__kicker">Enrolment</p>
        <p className="hx-flow__title">Enrol in {facts?.title ?? "Data Analytics"}</p>
        <p className="hx-flow__sentence">Accept the Terms &amp; Conditions and Privacy Policy.</p>
        <p className="hx-flow__pay">Payment is not collected in this pilot.</p>
      </div>
    )
  }
  if (stage === "courses" && facts) {
    return (
      <div className="hx-flow__screen">
        <p className="hx-flow__kicker">Student home</p>
        <p className="hx-flow__title">{facts.title}</p>
        <p className="hx-flow__sentence">Lesson {facts.lessonNumber} · {facts.current.title}</p>
        <span className="hx-flow__track" aria-hidden="true"><span style={{ width: `${facts.percent}%` }} /></span>
        <p className="hx-flow__meta">{facts.done} of {facts.total} lessons complete in this preview.</p>
      </div>
    )
  }
  if (stage === "lessons" && facts) {
    return (
      <div className="hx-flow__screen">
        <p className="hx-flow__kicker">Module {facts.currentModuleNumber} · Lesson {facts.lessonNumber} · {facts.current.kind}</p>
        <p className="hx-flow__title">{facts.current.title}</p>
        <p className="hx-flow__meta">A written lesson in the workspace. This preview is not your place in the course.</p>
      </div>
    )
  }
  if (stage === "projects") {
    return (
      <div className="hx-flow__screen">
        <p className="hx-flow__kicker">Project</p>
        <p className="hx-flow__title">{content?.capstoneTitle ?? facts?.capstoneTitle ?? "Capstone"}</p>
        <ul className="hx-flow__tasks">
          {["Read the brief", "Build the analysis", "Write the recommendation"].map((task, index) => (
            <li key={task} className={index === 0 ? "is-done" : undefined}>{task}</li>
          ))}
        </ul>
      </div>
    )
  }
  if (stage === "career") {
    return (
      <div className="hx-flow__screen">
        <p className="hx-flow__kicker">Career OS · evidence</p>
        <p className="hx-flow__title">{record?.title ?? "Finished project"}</p>
        <p className="hx-flow__meta">Added from a finished project. This is not a connected profile.</p>
        {record ? (
          <p className="hx-flow__chips">
            {record.skills.slice(0, 3).map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </p>
        ) : null}
      </div>
    )
  }
  return (
    <div className="hx-flow__screen">
      <p className="hx-flow__kicker">Opportunities</p>
      <p className="hx-flow__title">No openings are published yet.</p>
      <p className="hx-flow__meta">You can record applications you send. Skylent does not apply for you, and this preview is not your account.</p>
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
        <div className="hx-flow__board">
          <p className="hx-flow__label">Illustrative preview · Not a connected account</p>
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
          <div className="hx-flow__panel">
            <p className="hx-sr">{stage.title}. Illustrative preview, not a connected account.</p>
            <StageScreen stage={stage.key} />
          </div>
        </div>
      </div>
    </section>
  )
}
