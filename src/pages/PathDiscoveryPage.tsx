import { FormEvent, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import "./PathDiscoveryPage.css"
import "./PathDiscoveryPageV2.css"

type Stage = "school" | "college" | "graduate" | "working" | "switching"
type Goal = "career" | "build" | "research" | "business" | "exam" | "unsure"
type Confidence = "low" | "developing" | "strong"

type Answers = { stage: Stage; goal: Goal; confidence: Confidence; direction: string }
type StarterPath = { title: string; summary: string; steps: string[]; destinations: { label: string; to: string }[] }

const STAGES = [["school", "School"], ["college", "College"], ["graduate", "Graduate"], ["working", "Working"], ["switching", "Changing direction"]] as const
const GOALS = [["career", "Build a career"], ["build", "Build something"], ["research", "Go deeper into research"], ["business", "Build a business"], ["exam", "Prepare for an exam"], ["unsure", "I am not sure yet"]] as const
const CONFIDENCE = [["low", "I am starting"], ["developing", "I can do some of it"], ["strong", "I can already do a lot"]] as const

function starterPath({ stage, goal, confidence, direction }: Answers): StarterPath {
  const focus = direction.trim() || "your chosen direction"
  if (goal === "exam") return { title: "Build an evidence-led exam path.", summary: `At the ${stage} stage, Skylent should establish your baseline before recommending preparation. Your current confidence is ${confidence}, and your stated direction is ${focus}.`, steps: ["Define the exact target exam", "Run a baseline diagnostic", "Map topic-level gaps", "Practise and review evidence", "Use timed mocks to measure readiness"], destinations: [{ label: "Explore exam pathways", to: "/education/exams" }] }
  if (goal === "research") return { title: "Build depth before collecting credentials.", summary: `For ${stage} learners, the research path should connect foundations, technical depth, experiments and visible evidence around ${focus}.`, steps: ["Map your foundations", "Choose a research domain", "Learn only the missing concepts", "Run experiments or projects", "Publish a research-ready evidence trail"], destinations: [{ label: "Explore education", to: "/education" }, { label: "Explore labs", to: "/labs" }] }
  if (goal === "build" || goal === "business") return { title: "Move from capability to evidence.", summary: `For a ${stage} learner who wants to build, Skylent should connect missing capability to real work around ${focus}.`, steps: ["Define the outcome", "Identify the highest-value gaps", "Learn and practise", "Build something real", "Publish evidence and iterate"], destinations: [{ label: "Explore skills", to: "/skills" }, { label: "Explore labs", to: "/labs" }] }
  if (goal === "unsure") return { title: "You do not need to pick a course yet.", summary: "The first job is to understand your current position, constraints and possible directions. Skylent should help you test directions before asking you to commit.", steps: ["Understand your current state", "Compare possible directions", "Find common foundations", "Test a small real task", "Choose the next direction from evidence"], destinations: [{ label: "Browse skills", to: "/skills" }, { label: "Explore education", to: "/education" }] }
  return { title: "Build a career path around evidence, not course count.", summary: `For a ${stage} learner targeting ${focus}, Skylent should compare the destination with the capabilities already present, then connect only the missing learning and practice.`, steps: ["Define the target role", "Map current capabilities", "Close the highest-value gaps", "Build and prove the work", "Move into Career OS and opportunities"], destinations: [{ label: "Explore programmes", to: "/programs" }, { label: "Open Career OS", to: "/career-os" }] }
}

/** @deprecated Superseded by `/path` (PathPage). Kept for reference; not routed. */
export default function PathDiscoveryPage() {
  const [answers, setAnswers] = useState<Answers>({ stage: "college", goal: "career", confidence: "developing", direction: "" })
  const [submitted, setSubmitted] = useState(false)
  const result = useMemo(() => starterPath(answers), [answers])
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true) }

  return (
    <PageShell aurora={false}>
      <main className="path-page">
        <section className="path-hero"><p className="path-kicker">SKYLENT PATH · EARLY PRODUCT</p><h1>Don't start with a course.<br /><em>Start with your direction.</em></h1><p className="path-intro">Tell Skylent where you are, what you are trying to change, what you can already do and what direction is on your mind. The long-term product turns this into a living learner model.</p></section>
        <section className="path-workspace" aria-label="Skylent Path diagnostic">
          <form className="path-form" onSubmit={handleSubmit}>
            <div className="path-question"><span>01</span><div><h2>Where are you right now?</h2><p>Your academic or professional context.</p></div></div>
            <div className="path-options">{STAGES.map(([id, label]) => <button key={id} type="button" className={answers.stage === id ? "selected" : ""} onClick={() => { setAnswers((current) => ({ ...current, stage: id })); setSubmitted(false) }}>{label}</button>)}</div>
            <div className="path-question"><span>02</span><div><h2>What are you moving toward?</h2><p>You are choosing a direction, not a course.</p></div></div>
            <div className="path-options">{GOALS.map(([id, label]) => <button key={id} type="button" className={answers.goal === id ? "selected" : ""} onClick={() => { setAnswers((current) => ({ ...current, goal: id })); setSubmitted(false) }}>{label}</button>)}</div>
            <div className="path-question"><span>03</span><div><h2>How capable do you feel today?</h2><p>Self-reported confidence is only one signal; later versions will combine it with evidence.</p></div></div>
            <div className="path-options">{CONFIDENCE.map(([id, label]) => <button key={id} type="button" className={answers.confidence === id ? "selected" : ""} onClick={() => { setAnswers((current) => ({ ...current, confidence: id })); setSubmitted(false) }}>{label}</button>)}</div>
            <div className="path-question"><span>04</span><div><h2>What direction is on your mind?</h2><p>It can be a role, field, exam, research area, business idea or simply a question.</p></div></div>
            <input className="path-direction-input" value={answers.direction} onChange={(event) => { setAnswers((current) => ({ ...current, direction: event.target.value })); setSubmitted(false) }} placeholder="e.g. data science, aerospace, product, UPSC, my own company…" maxLength={120} />
            <button className="path-submit" type="submit">Build my starter path <span>→</span></button>
          </form>
          <aside className={`path-result ${submitted ? "is-visible" : ""}`} aria-live="polite">
            <p className="path-result-label">{submitted ? "YOUR STARTER PATH" : "THE SKYLENT MODEL"}</p>
            <h2>{submitted ? result.title : "Understand → diagnose → build → prove → move."}</h2>
            <p>{submitted ? result.summary : "The first version is deliberately simple. The long-term system will combine education history, skills, projects, assessments, communication, goals and evidence to continuously update what the learner should do next."}</p>
            <ol>{(submitted ? result.steps : ["Understand your starting point", "Diagnose the gap", "Recommend only what is missing", "Build and verify evidence", "Connect the next opportunity"]).map((step) => <li key={step}>{step}</li>)}</ol>
            {submitted && <div className="path-destinations">{result.destinations.map((destination) => <Link key={destination.to} to={destination.to}>{destination.label} <span>→</span></Link>)}</div>}
            <small>This starter experience does not claim to predict a career or guarantee a job. It is the foundation for a deeper recommendation system that will be connected to real learner evidence as the product matures.</small>
          </aside>
        </section>
      </main>
    </PageShell>
  )
}
