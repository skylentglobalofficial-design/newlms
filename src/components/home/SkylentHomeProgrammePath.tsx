export default function SkylentHomeProgrammePath() {
  const steps = [
    { label: "Foundations", copy: "What the work is for, and the vocabulary it uses." },
    { label: "Concepts", copy: "Users, evidence, jobs, constraints, and non-goals." },
    { label: "Practice", copy: "Checks and written briefs against the Harbor Desk case." },
    { label: "Project", copy: "A priority memo: one bet under a stated constraint." },
    { label: "Capstone", copy: "The Harbor Desk product case — a specification someone could implement." },
    { label: "Evidence", copy: "Keep the work sample. Carry it into Career OS yourself." },
  ] as const

  return (
    <section className="hp-ch hp-progpath" aria-labelledby="home-path-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Path
        </p>
        <h2 id="home-path-heading" className="hp-ch-title">
          See the journey before you start.
        </h2>
        <p className="hp-ch-lead">
          Product Management is written lessons, practice, and a named capstone. There is no video stream and no
          live classroom.
        </p>
        <ol className="hp-progpath-line">
          {steps.map((step) => (
            <li key={step.label}>
              <i aria-hidden="true" />
              <b>{step.label}</b>
              <span>{step.copy}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
