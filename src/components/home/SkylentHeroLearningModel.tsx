import { useState, type KeyboardEvent, type ReactNode } from "react"
import { Link } from "react-router-dom"
import "./SkylentHeroLearningModel.css"

type StageId = "learn" | "practice" | "build"
type LearnMode = "lesson" | "examples" | "notes" | "recap"
type PracticeMode = "problems" | "labs" | "cases" | "exercises"
type PracticePanel = "feedback" | "solution" | "notes"
type BuildMode = "projects" | "templates" | "workspace" | "showcase"

const STAGES: Array<{
  id: StageId
  index: string
  title: string
  copy: string
}> = [
  {
    id: "learn",
    index: "01",
    title: "Learn",
    copy: "Written lessons, examples, and recaps in Skylent OS.",
  },
  {
    id: "practice",
    index: "02",
    title: "Practice",
    copy: "Quizzes, assignments, cases, and an interactive SQL lab.",
  },
  {
    id: "build",
    index: "03",
    title: "Build",
    copy: "Finish a course project and keep the work sample.",
  },
]

const OS_ITEMS: Array<{
  id: string
  label: string
  stage?: StageId
  to?: string
}> = [
  { id: "learning", label: "Learning", stage: "learn" },
  { id: "practice", label: "Practice", stage: "practice" },
  { id: "projects", label: "Projects", stage: "build" },
  { id: "evidence", label: "Evidence", to: "/career-os/projects" },
  { id: "career", label: "Career", to: "/career-os" },
]

const LEARN_MODES: Array<{ id: LearnMode; title: string; note: string }> = [
  { id: "lesson", title: "Learn", note: "Structured lessons" },
  { id: "examples", title: "Examples", note: "Worked examples" },
  { id: "notes", title: "Notes", note: "Key takeaways" },
  { id: "recap", title: "Recap", note: "Quick revision" },
]

const PRACTICE_MODES: Array<{ id: PracticeMode; title: string; note: string }> = [
  { id: "problems", title: "Problems", note: "Test your understanding" },
  { id: "labs", title: "Interactive lab", note: "SQL practice in the browser" },
  { id: "cases", title: "Case study", note: "Course case notes" },
  { id: "exercises", title: "Exercises", note: "Short checks" },
]

const BUILD_MODES: Array<{ id: BuildMode; title: string; note: string }> = [
  { id: "projects", title: "My Projects", note: "Create and build" },
  { id: "templates", title: "Templates", note: "Get started faster" },
  { id: "workspace", title: "Workspace", note: "Plan, build, iterate" },
  { id: "showcase", title: "Showcase", note: "Publish and share" },
]

const LEARN_PATH = [
  "Learn the concept",
  "Explore examples",
  "Try practice questions",
  "Apply in a course assignment",
  "Track your progress",
]

const PRACTICE_PATH = [
  "Solve problems",
  "Check feedback",
  "Learn from explanation",
  "Try similar questions",
  "Track your progress",
]

const BUILD_PATH = [
  { title: "Plan", note: "Define your idea" },
  { title: "Build", note: "Work on it step by step" },
  { title: "Test", note: "Refine and improve" },
  { title: "Publish", note: "Add to your portfolio" },
]

const PROBLEM_OPTIONS = ["Option A", "Option B", "Option C", "Option D"] as const
const LAB_TASKS = [
  "Read the brief",
  "Set up the workspace",
  "Complete the core task",
  "Check the result",
]
const CASE_CHOICES = [
  { id: "narrow", label: "Start with the smallest test that could fail" },
  { id: "wide", label: "Build the full system first, then see what happens" },
  { id: "wait", label: "Wait for more information before doing anything" },
]

function Icon({ name }: { name: string }) {
  const s = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.7,
    "aria-hidden": true as const,
  }
  if (name === "learning") return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  if (name === "practice") return <svg {...s}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
  if (name === "projects") return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
  if (name === "evidence") return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
  if (name === "career") return <svg {...s}><circle cx="12" cy="8" r="3" /><path d="M4 20a8 8 0 0 1 16 0" /></svg>
  if (name === "search") return <svg {...s}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" /></svg>
  if (name === "play") return <svg {...s}><circle cx="12" cy="12" r="9" /><path d="M10 8l6 4-6 4z" fill="currentColor" stroke="none" /></svg>
  if (name === "lab") return <svg {...s}><path d="M9 3h6" /><path d="M10 3v7L5 20h14L14 10V3" /></svg>
  if (name === "case") return <svg {...s}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
  if (name === "chart") return <svg {...s}><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15l3-4 3 2 4-6" /></svg>
  if (name === "plus") return <svg {...s}><path d="M12 5v14M5 12h14" /></svg>
  if (name === "grid") return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  if (name === "import") return <svg {...s}><path d="M12 3v12" /><path d="M8 11l4 4 4-4" /><path d="M5 21h14" /></svg>
  if (name === "camera") return <svg {...s}><path d="M4 8h4l2-2h4l2 2h4v12H4z" /><circle cx="12" cy="13" r="3" /></svg>
  return <svg {...s}><circle cx="12" cy="12" r="8" /></svg>
}

function ModeIcon({ mode }: { mode: string }) {
  if (mode === "examples") return <Icon name="play" />
  if (mode === "notes") return <Icon name="evidence" />
  if (mode === "recap") return <Icon name="career" />
  if (mode === "problems") return <Icon name="practice" />
  if (mode === "labs") return <Icon name="lab" />
  if (mode === "cases") return <Icon name="case" />
  if (mode === "exercises") return <Icon name="chart" />
  if (mode === "templates") return <Icon name="grid" />
  if (mode === "workspace") return <Icon name="case" />
  if (mode === "showcase") return <Icon name="camera" />
  if (mode === "projects") return <Icon name="projects" />
  return <Icon name="learning" />
}

function Frame({
  stage,
  onStage,
  children,
}: {
  stage: StageId
  onStage: (id: StageId) => void
  children: ReactNode
}) {
  const search =
    stage === "learn"
      ? "Search lessons, notes, questions, projects..."
      : stage === "practice"
        ? "Search problems, cases, labs, exercises..."
        : "Search projects, templates, tools..."

  return (
    <div className="hp-lpb-frame">
      <aside className="hp-lpb-side">
        <p className="hp-lpb-brand">Skylent.</p>
        <nav aria-label="Skylent OS">
          {OS_ITEMS.map((item) => {
            const on = item.stage === stage
            if (item.to) {
              return (
                <Link key={item.id} className="hp-lpb-os-link" to={item.to}>
                  <Icon name={item.id} />
                  {item.label}
                </Link>
              )
            }
            return (
              <button
                key={item.id}
                type="button"
                className={on ? "is-on" : undefined}
                aria-current={on ? "page" : undefined}
                onClick={() => item.stage && onStage(item.stage)}
              >
                <Icon name={item.id} />
                {item.label}
              </button>
            )
          })}
        </nav>
        <p className="hp-lpb-account">Account</p>
      </aside>
      <div className="hp-lpb-main">
        <div className="hp-lpb-toolbar">
          <p className="hp-lpb-mobile-brand">Skylent.</p>
          <label className="hp-lpb-search">
            <Icon name="search" />
            <input type="search" placeholder={search} aria-label="Search inside this specimen" />
          </label>
        </div>
        {children}
      </div>
    </div>
  )
}

function Modes<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: Array<{ id: T; title: string; note: string }>
  value: T
  onChange: (id: T) => void
  label: string
}) {
  return (
    <div className="hp-lpb-modes" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          className={value === item.id ? "is-on" : undefined}
          onClick={() => onChange(item.id)}
        >
          <ModeIcon mode={item.id} />
          <span>
            <b>{item.title}</b>
            <em>{item.note}</em>
          </span>
        </button>
      ))}
    </div>
  )
}

function RadioChoice({
  checked,
  onPick,
  children,
}: {
  checked: boolean
  onPick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className={checked ? "is-on" : undefined}
      onClick={onPick}
    >
      <i className="hp-lpb-radio" aria-hidden="true" />
      <span>{children}</span>
    </button>
  )
}

function Path({
  items,
  current,
  onPick,
}: {
  items: string[]
  current: number
  onPick?: (index: number) => void
}) {
  return (
    <ol className="hp-lpb-path" aria-label="Progress">
      {items.map((item, index) => (
        <li key={item} className={index === current ? "is-on" : undefined}>
          {onPick ? (
            <button type="button" className="hp-lpb-path-item" onClick={() => onPick(index)}>
              <b>{index + 1}</b>
              {item}
            </button>
          ) : (
            <span className="hp-lpb-path-item">
              <b>{index + 1}</b>
              {item}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

function LearnBody({ mode, onPractice }: { mode: LearnMode; onPractice: () => void }) {
  if (mode === "examples") {
    return (
      <div className="hp-lpb-split">
        <article className="hp-lpb-card">
          <p className="hp-lpb-kicker">Example 1.1</p>
          <h3>See the idea used once</h3>
          <p>A short worked example sits next to the lesson — not a second course, and not a video stream.</p>
        </article>
        <aside className="hp-lpb-railcard">
          <p className="hp-lpb-rail-title">Learning path</p>
          <Path items={LEARN_PATH} current={1} />
        </aside>
      </div>
    )
  }
  if (mode === "notes") {
    return (
      <div className="hp-lpb-split">
        <article className="hp-lpb-card">
          <p className="hp-lpb-kicker">Notes</p>
          <h3>Keep the takeaway</h3>
          <ul className="hp-lpb-notes">
            <li>Name the concept in one sentence.</li>
            <li>Write one example that would fail the idea.</li>
            <li>Carry the note into practice.</li>
          </ul>
        </article>
        <aside className="hp-lpb-railcard">
          <p className="hp-lpb-rail-title">Learning path</p>
          <Path items={LEARN_PATH} current={0} />
        </aside>
      </div>
    )
  }
  if (mode === "recap") {
    return (
      <div className="hp-lpb-split">
        <article className="hp-lpb-card">
          <p className="hp-lpb-kicker">Recap</p>
          <h3>What you should be able to do next</h3>
          <p>Restate the concept, then try it. Practice is the next surface in the same workspace.</p>
          <button type="button" className="hp-lpb-textbtn" onClick={onPractice}>
            Continue to practice →
          </button>
        </article>
        <aside className="hp-lpb-railcard">
          <p className="hp-lpb-rail-title">Learning path</p>
          <Path items={LEARN_PATH} current={2} />
        </aside>
      </div>
    )
  }
  return (
    <div className="hp-lpb-split">
      <article className="hp-lpb-card hp-lpb-lesson">
        <p className="hp-lpb-kicker">Lesson 1.1</p>
        <div className="hp-lpb-lesson-grid">
          <div>
            <h3>Written lesson</h3>
            <p>Read the lesson in Skylent OS. Examples and notes sit next to it.</p>
            <p className="hp-lpb-lesson-cta">
              <Icon name="play" />
              Open lesson
            </p>
          </div>
          <div className="hp-lpb-orbit" aria-hidden="true">
            <span className="hp-lpb-orbit-ring" />
            <span className="hp-lpb-orbit-lg" />
            <span className="hp-lpb-orbit-arm" />
            <span className="hp-lpb-orbit-sm" />
            <em>Lesson → practice</em>
          </div>
        </div>
      </article>
      <aside className="hp-lpb-railcard">
        <p className="hp-lpb-rail-title">
          Learning path
          <span>View all</span>
        </p>
        <Path items={LEARN_PATH} current={0} />
      </aside>
    </div>
  )
}

function practiceCopy(panel: PracticePanel, submitted: boolean) {
  if (!submitted) {
    return {
      title: "Attempt to see feedback",
      body: "Submit an answer to get a short explanation. Feedback is a reason, not a rank.",
    }
  }
  if (panel === "solution") {
    return {
      title: "Worked approach",
      body: "Name the constraint, then the smallest test that could fail. The other options skip the test.",
    }
  }
  if (panel === "notes") {
    return {
      title: "Carry this forward",
      body: "Write the constraint in one sentence, then use it in a project.",
    }
  }
  return {
    title: "Why this holds",
    body: "Feedback names the reasoning. There is no score, rank, or streak on this specimen.",
  }
}

function PracticeRail({
  panel,
  submitted,
  current,
  onPanel,
}: {
  panel: PracticePanel
  submitted: boolean
  current: number
  onPanel: (id: PracticePanel) => void
}) {
  const copy = practiceCopy(panel, submitted)
  return (
    <div className="hp-lpb-practice-side">
      <aside className="hp-lpb-railcard">
        <div className="hp-lpb-ftabs" role="tablist" aria-label="Review">
          {(["feedback", "solution", "notes"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={panel === item}
              className={panel === item ? "is-on" : undefined}
              onClick={() => onPanel(item)}
            >
              {item === "feedback" ? "Feedback" : item === "solution" ? "Solution" : "Notes"}
            </button>
          ))}
        </div>
        <div className={submitted ? "hp-lpb-feedback is-live" : "hp-lpb-feedback"} aria-live="polite">
          <p>
            <b>{copy.title}</b>
            <span>{copy.body}</span>
          </p>
        </div>
      </aside>
      <aside className="hp-lpb-railcard">
        <p className="hp-lpb-rail-title">
          Practice path
          <span>View all</span>
        </p>
        <Path items={PRACTICE_PATH} current={current} />
      </aside>
    </div>
  )
}

function PracticeBody({
  mode,
  choice,
  submitted,
  labDone,
  panel,
  onChoice,
  onSubmit,
  onSkip,
  onLab,
  onPanel,
}: {
  mode: PracticeMode
  choice: string | null
  submitted: boolean
  labDone: number
  panel: PracticePanel
  onChoice: (id: string) => void
  onSubmit: () => void
  onSkip: () => void
  onLab: (index: number) => void
  onPanel: (id: PracticePanel) => void
}) {
  const rail = (
    <PracticeRail
      panel={panel}
      submitted={submitted}
      current={submitted ? 1 : 0}
      onPanel={onPanel}
    />
  )

  if (mode === "labs") {
    const total = LAB_TASKS.length
    return (
      <div className="hp-lpb-split">
        <article className="hp-lpb-card">
          <p className="hp-lpb-kicker">Lab 1 of 3</p>
          <h3>Work the idea with your hands</h3>
          <p>
            A generic lab workspace — code, data, language, a case file, or a model. The
            subject is not the point. The attempt is.
          </p>
          <div className="hp-lpb-lab-meter">
            <div className="hp-lpb-qhead">
              <span>In progress</span>
              <span>
                {Math.min(labDone, total)} of {total} steps
              </span>
            </div>
            <div className="hp-lpb-qbar" aria-hidden="true">
              <span style={{ width: `${(Math.min(labDone, total) / total) * 100}%` }} />
            </div>
            <button
              type="button"
              className="hp-lpb-primary"
              onClick={() => onLab(Math.min(labDone + 1, total))}
            >
              Resume
            </button>
          </div>
          <ol className="hp-lpb-tasks">
            {LAB_TASKS.map((task, index) => (
              <li key={task}>
                <button
                  type="button"
                  className={index < labDone ? "is-on" : undefined}
                  onClick={() => onLab(index + 1)}
                >
                  <b>{index < labDone ? "Done" : "Step"}</b>
                  {task}
                </button>
              </li>
            ))}
          </ol>
        </article>
        <aside className="hp-lpb-railcard">
          <p className="hp-lpb-rail-title">
            Practice path
            <span>View all</span>
          </p>
          <Path items={PRACTICE_PATH} current={0} />
        </aside>
      </div>
    )
  }

  if (mode === "cases") {
    return (
      <div className="hp-lpb-split">
        <article className="hp-lpb-card">
          <div className="hp-lpb-qhead">
            <p className="hp-lpb-kicker">Case 1 of 3</p>
            <span>Scenario</span>
          </div>
          <h3>Read the situation. Make a bet.</h3>
          <p>A team has limited time and two possible approaches. You do not get a score. You get a reason.</p>
          <div className="hp-lpb-choices" role="radiogroup" aria-label="Case decision">
            {CASE_CHOICES.map((item) => (
              <RadioChoice
                key={item.id}
                checked={choice === item.id}
                onPick={() => onChoice(item.id)}
              >
                {item.label}
              </RadioChoice>
            ))}
          </div>
          <div className="hp-lpb-actions">
            <button
              type="button"
              className="hp-lpb-primary"
              onClick={() => {
                onSubmit()
                onPanel("feedback")
              }}
            >
              Check reasoning
            </button>
            <button type="button" className="hp-lpb-skip" onClick={onSkip}>
              Skip for now →
            </button>
          </div>
        </article>
        {rail}
      </div>
    )
  }

  if (mode === "exercises") {
    return (
      <div className="hp-lpb-split">
        <article className="hp-lpb-card">
          <div className="hp-lpb-qhead">
            <p className="hp-lpb-kicker">Exercise 1 of 5</p>
            <span>Guided</span>
          </div>
          <div className="hp-lpb-answer-split">
            <div>
              <h3>Solve the problem</h3>
              <p>
                Restate the idea in your own words, then apply it to a small situation of
                your choosing. This works for a proof, a case, a translation, or a model.
              </p>
            </div>
            <div className="hp-lpb-editor" aria-hidden="true">
              <em>Your answer</em>
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="hp-lpb-actions">
            <button
              type="button"
              className="hp-lpb-primary"
              onClick={() => {
                onSubmit()
                onPanel("feedback")
              }}
            >
              Submit answer
            </button>
            <button
              type="button"
              className="hp-lpb-skip"
              onClick={() => {
                onSubmit()
                onPanel("solution")
              }}
            >
              View solution
            </button>
          </div>
        </article>
        {rail}
      </div>
    )
  }

  return (
    <div className="hp-lpb-split">
      <article className="hp-lpb-card">
        <div className="hp-lpb-qhead">
          <p className="hp-lpb-kicker">Question 1 of 5</p>
          <span>Practice</span>
        </div>
        <div className="hp-lpb-qbar" aria-hidden="true">
          <span style={{ width: "20%" }} />
        </div>
        <h3>Analyse the information and choose the best answer.</h3>
        <p>
          Read the scenario carefully and select the most appropriate option. You can
          attempt, review, and learn from the explanation.
        </p>
        <div className="hp-lpb-choices" role="radiogroup" aria-label="Practice options">
          {PROBLEM_OPTIONS.map((item) => (
            <RadioChoice key={item} checked={choice === item} onPick={() => onChoice(item)}>
              {item}
            </RadioChoice>
          ))}
        </div>
        <div className="hp-lpb-actions">
          <button
            type="button"
            className="hp-lpb-primary"
            onClick={() => {
              onSubmit()
              onPanel("feedback")
            }}
          >
            Submit answer
          </button>
          <button type="button" className="hp-lpb-skip" onClick={onSkip}>
            Skip for now →
          </button>
        </div>
      </article>
      {rail}
    </div>
  )
}

function BuildBody({
  mode,
  step,
  onStep,
  onMode,
}: {
  mode: BuildMode
  step: number
  onStep: (index: number) => void
  onMode: (id: BuildMode) => void
}) {
  const path = (
    <aside className="hp-lpb-railcard">
      <p className="hp-lpb-rail-title">
        Project path
        <span>View all</span>
      </p>
      <ol className="hp-lpb-path" aria-label="Build path">
        {BUILD_PATH.map((item, index) => (
          <li key={item.title} className={index === step ? "is-on" : undefined}>
            <button type="button" className="hp-lpb-path-item" onClick={() => onStep(index)}>
              <b>{index + 1}</b>
              <span>
                {item.title}
                <em>{item.note}</em>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  )

  if (mode === "templates") {
    return (
      <div className="hp-lpb-split">
        <article className="hp-lpb-card">
          <p className="hp-lpb-kicker">Templates</p>
          <h3>Start from a structure</h3>
          <p>A brief, a case note, or a work sample — then make it yours.</p>
          <div className="hp-lpb-tiles">
            <button type="button" onClick={() => onStep(1)}>
              Brief
              <span>Frame the problem</span>
            </button>
            <button type="button" onClick={() => onStep(1)}>
              Case note
              <span>Write the decision</span>
            </button>
            <button type="button" onClick={() => onStep(1)}>
              Work sample
              <span>Show the result</span>
            </button>
          </div>
        </article>
        {path}
      </div>
    )
  }
  if (mode === "workspace") {
    return (
      <div className="hp-lpb-split">
        <article className="hp-lpb-card">
          <p className="hp-lpb-kicker">{BUILD_PATH[step].title}</p>
          <h3>{BUILD_PATH[step].note}</h3>
          <p>A writing and making surface for the work itself — not a gallery of other people.</p>
          <div className="hp-lpb-editor is-tall" aria-hidden="true">
            <em>Workspace</em>
            <span />
            <span />
            <span />
            <span />
          </div>
        </article>
        {path}
      </div>
    )
  }
  if (mode === "showcase") {
    return (
      <div className="hp-lpb-split">
        <article className="hp-lpb-card">
          <p className="hp-lpb-kicker">Showcase</p>
          <h3>Keep the work. Carry it yourself.</h3>
          <p>
            Work you keep can move into Career OS. You add it from a finished project.
          </p>
          <div className="hp-lpb-tiles">
            <button type="button" onClick={() => onMode("workspace")}>
              Continue the draft
              <span>Return to the workspace</span>
            </button>
            <button type="button">
              Keep as evidence
              <span>Stays in this account</span>
            </button>
          </div>
        </article>
        {path}
      </div>
    )
  }
  return (
    <div className="hp-lpb-build-board">
      <article className="hp-lpb-card">
        <p className="hp-lpb-kicker">Create</p>
        <h3>Create a new project</h3>
        <p>Start from a template or build from scratch.</p>
        <div className="hp-lpb-create">
          <button
            type="button"
            onClick={() => {
              onMode("workspace")
              onStep(1)
            }}
          >
            <Icon name="plus" />
            <b>Blank project</b>
            <span>Start fresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onMode("templates")
              onStep(0)
            }}
          >
            <Icon name="grid" />
            <b>Use a template</b>
            <span>Pre-built structure</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onMode("workspace")
              onStep(1)
            }}
          >
            <Icon name="import" />
            <b>Import</b>
            <span>Bring your work</span>
          </button>
        </div>
      </article>
      <div className="hp-lpb-build-rail">
        <aside className="hp-lpb-preview" aria-hidden="true">
          <p>Project preview</p>
          <div className="hp-lpb-editor">
            <em>Draft</em>
            <span />
            <span />
            <span />
          </div>
        </aside>
        {path}
      </div>
    </div>
  )
}

export default function SkylentHeroLearningModel() {
  const [stage, setStage] = useState<StageId>("learn")
  const [learnMode, setLearnMode] = useState<LearnMode>("lesson")
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("problems")
  const [buildMode, setBuildMode] = useState<BuildMode>("projects")
  const [practiceChoice, setPracticeChoice] = useState<string | null>(null)
  const [practiceSubmitted, setPracticeSubmitted] = useState(false)
  const [practicePanel, setPracticePanel] = useState<PracticePanel>("feedback")
  const [labDone, setLabDone] = useState(1)
  const [buildStep, setBuildStep] = useState(0)

  function pickStage(next: StageId) {
    setStage(next)
    setPracticeSubmitted(false)
    setPracticePanel("feedback")
  }

  function onJourneyKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = STAGES.findIndex((item) => item.id === stage)
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault()
      pickStage(STAGES[(index + 1) % STAGES.length].id)
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault()
      pickStage(STAGES[(index - 1 + STAGES.length) % STAGES.length].id)
    }
  }

  const copy =
    stage === "learn"
      ? {
          kicker: "Learn",
          title: "Written lessons in Skylent OS.",
          lead: "Open a ready course. Read the lesson, check examples, and keep notes as you go.",
        }
      : stage === "practice"
        ? {
            kicker: "Practice",
            title: "Check what you learned.",
            lead: "Quizzes, assignments, course cases, and the Northwind SQL lab for Data Analytics.",
          }
        : {
            kicker: "Build",
            title: "Finish a project you keep.",
            lead: "Each ready course ends in a capstone. Add that work to Career OS when you want it on your profile.",
          }

  return (
    <section className="hp-hero hp-lpb" aria-labelledby="home-hero-heading">
      <h1 id="home-hero-heading" className="hp-lpb-sr">
        Learn, practice, and build in Skylent OS
      </h1>
      <div className="hp-rail hp-lpb-stage">
        <div className="hp-lpb-journey" role="radiogroup" aria-label="Learning journey" onKeyDown={onJourneyKey}>
          <p className="hp-lpb-eyebrow">Learn · Practise · Build</p>
          {STAGES.map((item) => {
            const on = stage === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={on}
                className={on ? "hp-lpb-step is-on" : "hp-lpb-step"}
                onClick={() => pickStage(item.id)}
              >
                <span className="hp-lpb-step-index">{item.index}</span>
                <span className="hp-lpb-step-copy">
                  <strong>{item.title}</strong>
                  <span>{item.copy}</span>
                </span>
                <span className="hp-lpb-step-go" aria-hidden="true">
                  →
                </span>
              </button>
            )
          })}
          <p className="hp-lpb-foot">
            Start with a ready course.
            <br />
            Lessons, practice, and a project in Skylent OS.
          </p>
        </div>

        <Frame stage={stage} onStage={pickStage}>
          <div key={stage} className="hp-lpb-body">
            <header className="hp-lpb-head">
              <div>
                <p className="hp-lpb-kicker">{copy.kicker}</p>
                <h2>{copy.title}</h2>
              </div>
              <p className="hp-lpb-lead">{copy.lead}</p>
            </header>

            {stage === "learn" ? (
              <>
                <Modes items={LEARN_MODES} value={learnMode} onChange={setLearnMode} label="Learn surfaces" />
                <LearnBody mode={learnMode} onPractice={() => pickStage("practice")} />
              </>
            ) : null}

            {stage === "practice" ? (
              <>
                <Modes
                  items={PRACTICE_MODES}
                  value={practiceMode}
                  onChange={(id) => {
                    setPracticeMode(id)
                    setPracticeSubmitted(false)
                    setPracticeChoice(null)
                    setPracticePanel("feedback")
                  }}
                  label="Practice surfaces"
                />
                <PracticeBody
                  mode={practiceMode}
                  choice={practiceChoice}
                  submitted={practiceSubmitted}
                  labDone={labDone}
                  panel={practicePanel}
                  onChoice={(id) => {
                    setPracticeChoice(id)
                    setPracticeSubmitted(false)
                    setPracticePanel("feedback")
                  }}
                  onSubmit={() => setPracticeSubmitted(true)}
                  onSkip={() => {
                    setPracticeChoice(null)
                    setPracticeSubmitted(false)
                    setPracticePanel("feedback")
                  }}
                  onLab={setLabDone}
                  onPanel={setPracticePanel}
                />
              </>
            ) : null}

            {stage === "build" ? (
              <>
                <Modes items={BUILD_MODES} value={buildMode} onChange={setBuildMode} label="Build surfaces" />
                <BuildBody
                  mode={buildMode}
                  step={buildStep}
                  onMode={setBuildMode}
                  onStep={(index) => {
                    setBuildStep(index)
                    if (index === 0) setBuildMode("templates")
                    if (index === 1) setBuildMode("workspace")
                    if (index === 3) setBuildMode("showcase")
                  }}
                />
              </>
            ) : null}

            {stage === "learn" ? (
              <p className="hp-lpb-quote">
                <q>Next: a short check in the same workspace.</q>
                <button type="button" onClick={() => pickStage("practice")}>
                  Continue to practice →
                </button>
              </p>
            ) : null}
          </div>
        </Frame>
      </div>
    </section>
  )
}
