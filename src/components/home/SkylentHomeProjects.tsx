import { Link } from "react-router-dom"
import { harborDeskProjectPath, northwindProjectPath } from "../../lib/projects-api"

export default function SkylentHomeProjects() {
  const harbor = {
    title: "Harbor Desk",
    kicker: "Product Management",
    copy: "Late inbound has no owner before open. The bet is a weekend exception queue, specified for review.",
    href: harborDeskProjectPath(),
    file: "harbor-desk-case.md",
  }
  const wind = {
    title: "Northwind Commercial Review",
    kicker: "Data Analytics",
    copy: "A commercial read of a fictional Northwind sales extract — finding, why it matters, one recommendation.",
    href: northwindProjectPath(),
    file: "northwind_sales.csv",
  }

  return (
    <section className="hp-ch hp-archive" aria-labelledby="home-projects-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Projects
        </p>
        <h2 id="home-projects-heading" className="hp-ch-title">
          Real problems. Real work.
        </h2>
        <p className="hp-ch-lead">
          Authored capstones against named case files. Not sample galleries, and not placement portfolios.
        </p>

        <article className="hp-archive-main">
          <p className="hp-archive-kicker">{harbor.kicker}</p>
          <h3>{harbor.title}</h3>
          <p>{harbor.copy}</p>
          <p>
            Against <code>{harbor.file}</code>
          </p>
          <Link className="hp-ch-link" to={harbor.href}>
            Open the case →
          </Link>
        </article>

        <article className="hp-archive-side">
          <p className="hp-archive-kicker">{wind.kicker}</p>
          <div>
            <h3>{wind.title}</h3>
            <p>{wind.copy}</p>
            <p>
              Against <code>{wind.file}</code>
            </p>
            <Link className="hp-ch-link" to={wind.href}>
              Open the review →
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
