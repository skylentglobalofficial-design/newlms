import { FormEvent, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import "./PathDiscoveryPage.css"

type Stage = "school" | "college" | "graduate" | "working" | "switching"
type Goal = "job" | "build" | "research" | "business" | "exam" | "unsure"

type StarterPath = {
  title: string
  summary: string
  steps: string[]
  destinations: { label: string; to: string }[]
}

const STAGES: { id: Stage; label: string }[] = [
  { id: "school", label: "School" },
  { id: "college", label: "College" },
  { id: "graduate", label: "Graduate" },
  { id: "working", label: "Working" },
  { id: "switching", label: "Changing direction" },
]

const GOALS: { id: Goal; label: string }[] = [
  { id: "job", label: "Get into a career" },
  { id: "build", label: "Build something" },
  { id: "research", label: "Go deeper into research" },
  { id: "business", label: "Build a business" },
  { id: "exam", label: "Prepare for an exam" },
  { id: "unsure", label: "I am not sure yet" },
]

function starterPath(stage: Stage, goal: Goal): StarterPath {
  if (goal === "exam") {
    return {
      title: "Start with a diagnostic, not a course list.",
      summary: `For someone at the ${stage} stage, the first useful step is to identify the target exam, current level, and the topics that need work.`,
      steps: ["Choose the target exam", "Run a baseline diagnostic", "Build topic-level practice", "Use timed mocks and review the evidence"],
      destinations: [{ label: "Explore exam pathways", to: "/education/exams" }],
    }
  }

  if (goal === "research") {
    return {
      title: "Build depth before collecting credentials.",
      summary: `At the ${stage} stage, a research-oriented path should connect foundations, technical depth, experiments, and visible evidence of independent work.`,
      steps: ["Map your current foundations", "Choose a technical domain", "Run experiments or projects", "Build a research-ready evidence trail"],
      destinations: [{ label: "Explore education", to: "/education" }, { label: "Explore labs", to: "/labs" }],
    }
  }

  if (goal === "build" || goal === "business") {
    return {
      title: "Move from capability to evidence.",
      summary: `For a ${stage} learner who wants to build, the useful sequence is capability → practice → real work → evidence → opportunity.`,
      steps: ["Identify the capability you need", "Learn only the missing pieces", "Build a real project", "Publish evidence and iterate"],
      destinations: [{ label: "Explore skills", to: "/skills" }, { label: "Explore labs", to: "/labs" }],
    }
  }

  if (goal === "unsure") {
    return {
      title: "You do not need to pick a course yet.",
      summary: `Start by understanding your current position, interests, constraints, and possible directions. The next version of Skylent will turn this intake into a deeper personalised path.`,
      steps: ["Understand your current position", "Compare a few possible directions", "Identify the common foundations", "Choose a small next step and test it"],
      destinations: [{ label: "Browse skills", to: "/skills" }, { label: "Explore education", to: "/education" }],
    }
  }

  return {
    title: "Build a career path around evidence, not a course count.",
    summary: `For a ${stage} learner focused on a career, Skylent should first identify the target role, compare it with your current capabilities, then connect only the missing learning and practice.`,
    steps: ["Define the target role", "Map current capabilities", "Close the highest-value gaps", "Build and prove the work", "Use Career OS for opportunities"],
    destinations: [{ label: "Explore programmes", to: "/programs" }, { label: "Open Career OS", to: "/career-os" }],
  }
}

export default function PathDiscoveryPage() {
  const [stage, setStage] = useState<Stage>("college")
  const [goal, setGoal] = useState<Goal>("job")
  const [submitted, setSubmitted] = useState(false)
  const result = useMemo(() => starterPath(stage, goal), [stage, goal])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <PageShell aurora={false}>
      <main className="path-page">
        <section className="path-hero">
          <p className="path-kicker">SKYLENT PATH</p>
          <h1>Don't start with a course.<br /><em>Start with your direction.</em></h1>
          <p className="path-intro">
            Skylent is being built around a simple question: where are you now, where do you want to go, and what is actually missing between the two?
          </p>
        </section>

        <section className="path-workspace" aria-label="Path discovery">
          <form className="path-form" onSubmit={handleSubmit}>
            <div className="path-question">
              <span>01</span>
              <div>
                <h2>Where are you right now?</h2>
                <p>This changes the context of the path.</p>
              </div>
            </div>
            <div className="path-options">
              {STAGES.map((item) => (
                <button key={item.id} type="button" className={stage === item.id ? "selected" : ""} onClick={() => { setStage(item.id); setSubmitted(false) }}>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="path-question">
              <span>02</span>
              <div>
                <h2>What are you trying to move toward?</h2>
                <p>You can change this later. You are not choosing a course.</p>
              </div>
            </div>
            <div className="path-options">
              {GOALS.map((item) => (
                <button key={item.id} type="button" className={goal === item.id ? "selected" : ""} onClick={() => { setGoal(item.id); setSubmitted(false) }}>
                  {item.label}
                </button>
              ))}
            </div>

            <button className="path-submit" type="submit">Show my starter path <span>→</span></button>
          </form>

          <aside className={`path-result ${submitted ? "is-visible" : ""}`} aria-live="polite">
            <p className="path-result-label">YOUR STARTER PATH</p>
            <h2>{submitted ? result.title : "Your path will start here."}</h2>
            <p>{submitted ? result.summary : "Answer two questions and Skylent will show the kind of sequence we are building around you."}</p>
            <ol>
              {(submitted ? result.steps : ["Where you are", "Where you want to go", "What is missing", "What to do next"]).map((step) => <li key={step}>{step}</li>)}
            </ol>
            {submitted && <div className="path-destinations">{result.destinations.map((destination) => <Link key={destination.to} to={destination.to}>{destination.label} <span>→</span></Link>)}</div>}
            <small>This is a starter product flow, not an AI career guarantee. The deeper assessment and recommendation engine will be connected to this experience later.</small>
          </aside>
        </section>
      </main>
    </PageShell>
  )
}
