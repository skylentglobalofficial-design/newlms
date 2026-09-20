import { useState } from "react"

type Stage = "learn" | "practice" | "build"

const STAGES: Array<{ id: Stage; number: string; label: string; copy: string }> = [
  {
    id: "learn",
    number: "01",
    label: "Learn",
    copy: "Understand concepts clearly. Explore ideas, examples and real applications.",
  },
  {
    id: "practice",
    number: "02",
    label: "Practice",
    copy: "Apply what you learn through problems, labs, cases and feedback.",
  },
  {
    id: "build",
    number: "03",
    label: "Build",
    copy: "Turn what you know into something real that you can show.",
  },
]

function LearnPanel() {
  return (
    <div className="slm-panel">
      <div className="slm-panel-top">
        <span>Skylent LMS</span>
        <span>Learning workspace</span>
      </div>
      <div className="slm-panel-body">
        <div className="slm-sidebar">
          <span className="is-active">Learn</span>
          <span>Examples</span>
          <span>Notes</span>
          <span>Recap</span>
        </div>
        <div className="slm-main">
          <p className="slm-eyebrow">LEARN</p>
          <h3>Understand the idea.</h3>
          <p className="slm-muted">
            Clear explanations, examples and context — arranged so you know what to learn next.
          </p>
          <div className="slm-lesson">
            <div className="slm-lesson-copy">
              <span className="slm-label">LESSON</span>
              <strong>Concept → Example → Application</strong>
              <p>Build the foundation first, then see how the idea works in the real world.</p>
            </div>
            <div className="slm-diagram" aria-hidden="true">
              <span />
              <i />
              <b />
              <em />
            </div>
          </div>
          <div className="slm-path">
            <span className="is-done">01 · Learn the concept</span>
            <span className="is-now">02 · Explore examples</span>
            <span>03 · Try a question</span>
            <span>04 · Apply it</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PracticePanel() {
  return (
    <div className="slm-panel">
      <div className="slm-panel-top">
        <span>Skylent LMS</span>
        <span>Practice workspace</span>
      </div>
      <div className="slm-panel-body">
        <div className="slm-sidebar">
          <span>Learn</span>
          <span className="is-active">Practice</span>
          <span>Labs</span>
          <span>Feedback</span>
        </div>
        <div className="slm-main">
          <p className="slm-eyebrow">PRACTICE</p>
          <h3>Put knowledge to work.</h3>
          <p className="slm-muted">
            The practice changes with what you are learning — questions, virtual labs, cases, exercises and feedback.
          </p>
          <div className="slm-practice-grid">
            <article className="is-featured">
              <span>01</span>
              <strong>Virtual Lab</strong>
              <p>Work inside the environment instead of only reading about it.</p>
              <b>Open lab →</b>
            </article>
            <article>
              <span>02</span>
              <strong>Problems</strong>
              <p>Try a problem. Submit your work. See where you can improve.</p>
              <b>Start →</b>
            </article>
            <article>
              <span>03</span>
              <strong>Cases</strong>
              <p>Reason through a real situation and make a decision.</p>
              <b>Open case →</b>
            </article>
            <article>
              <span>04</span>
              <strong>Feedback</strong>
              <p>Use results to decide what to revisit and what to do next.</p>
              <b>Review →</b>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}

function BuildPanel() {
  return (
    <div className="slm-panel">
      <div className="slm-panel-top">
        <span>Skylent OS</span>
        <span>Build workspace</span>
      </div>
      <div className="slm-panel-body">
        <div className="slm-sidebar">
          <span>Learn</span>
          <span>Practice</span>
          <span className="is-active">Build</span>
          <span>Projects</span>
        </div>
        <div className="slm-main">
          <p className="slm-eyebrow">BUILD</p>
          <h3>Make something real.</h3>
          <p className="slm-muted">
            Use what you have learned to create an output — a project, product, app, analysis or anything your goal requires.
          </p>
          <div className="slm-build-stage">
            <div className="slm-build-canvas">
              <span className="slm-label">YOUR WORK</span>
              <div className="slm-build-screen">
                <div />
                <div />
                <div />
                <strong>Something you made.</strong>
              </div>
            </div>
            <div className="slm-build-steps">
              <span className="is-done">01 · Idea</span>
              <span className="is-done">02 · Make</span>
              <span className="is-now">03 · Test</span>
              <span>04 · Share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SkylentHeroLearningModel() {
  const [stage, setStage] = useState<Stage>("learn")

  return (
    <div className="slm-hero">
      <div className="slm-copy">
        <p className="slm-kicker">A BRIGHTER YOU THROUGH LEARNING</p>
        <h1>Learn.<br />Practice.<br />Build.</h1>
        <p className="slm-intro">
          A complete learning journey — from understanding an idea to using it and making something real.
        </p>
        <div className="slm-stage-list" role="tablist" aria-label="How Skylent works">
          {STAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={stage === item.id}
              className={stage === item.id ? "is-active" : undefined}
              onClick={() => setStage(item.id)}
            >
              <span className="slm-stage-number">{item.number}</span>
              <span className="slm-stage-content">
                <strong>{item.label}</strong>
                <small>{item.copy}</small>
              </span>
              <span className="slm-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
        <p className="slm-note">Any goal. Any subject. One learning system.</p>
      </div>

      <div className="slm-visual" aria-live="polite">
        {stage === "learn" ? <LearnPanel /> : null}
        {stage === "practice" ? <PracticePanel /> : null}
        {stage === "build" ? <BuildPanel /> : null}
      </div>
    </div>
  )
}
