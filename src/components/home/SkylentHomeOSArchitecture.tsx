export default function SkylentHomeOSArchitecture() {
  const layers = [
    {
      label: "Learn",
      copy: "Written lessons in Skylent OS. Self-paced. No video stream and no live classroom.",
    },
    {
      label: "Practice",
      copy: "Checks after a block of lessons, then assignments on the course material.",
    },
    {
      label: "Build",
      copy: "A named capstone — Harbor Desk or Northwind Commercial Review — assembled in the project workspace.",
    },
    {
      label: "Evidence",
      copy: "You keep the artefact. Nothing is auto-invented or auto-published.",
    },
    {
      label: "Career",
      copy: "Career OS holds profile, projects, opportunities, applications, interviews, and support.",
    },
  ] as const

  return (
    <section className="hp-ch hp-osx" aria-labelledby="home-os-arch-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Skylent OS
        </p>
        <h2 id="home-os-arch-heading" className="hp-ch-title">
          One system across the journey.
        </h2>
        <p className="hp-ch-lead">
          Not another dashboard. The operating layers of learning, practice, work, evidence, and career — as the
          product actually implements them.
        </p>
        <ol className="hp-osx-stack">
          {layers.map((layer, index) => (
            <li key={layer.label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{layer.label}</b>
              <em>{layer.copy}</em>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
