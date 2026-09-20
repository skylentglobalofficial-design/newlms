export default function SkylentHomeJourney() {
  const beats = [
    { label: "Goal", copy: "Where you want to go — career, exam, subject, or a new skill." },
    { label: "Learn", copy: "Authored lessons in Skylent OS." },
    { label: "Practice", copy: "Checks, assignments, and the Northwind lab where the course has one." },
    { label: "Build", copy: "Harbor Desk or Northwind Commercial Review." },
    { label: "Evidence", copy: "The work sample you keep." },
    { label: "Career", copy: "Career OS — profile, projects, and the activity that follows." },
  ] as const

  return (
    <section className="hp-ch hp-line" aria-labelledby="home-journey-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Journey
        </p>
        <h2 id="home-journey-heading" className="hp-ch-title">
          {"Goal → Learn → Practice → Build → Evidence → Career."}
        </h2>
        <p className="hp-ch-lead">One line through the product. Not six separate products.</p>
        <ol className="hp-line-track">
          {beats.map((beat) => (
            <li key={beat.label}>
              <b>{beat.label}</b>
              <span>{beat.copy}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
