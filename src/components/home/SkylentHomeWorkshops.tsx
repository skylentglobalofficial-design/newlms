import { Link } from "react-router-dom"
import { workshops } from "../../data"
import { MATURITY_LABEL } from "../../lib/product-architecture"

export default function SkylentHomeWorkshops() {
  const specimens = workshops.slice(0, 6)

  return (
    <section className="hp-ch hp-ws" aria-labelledby="home-workshops-heading">
      <div className="hp-rail">
        <p className="hp-ch-kicker">
          <i aria-hidden="true" />
          Workshops
        </p>
        <h2 id="home-workshops-heading" className="hp-ch-title">
          Learn by doing.
        </h2>
        <p className="hp-ch-lead">
          Short, event-shaped sessions on a single skill. Planned subjects are listed. Registration, attendance,
          payment, and certificates are not built.{" "}
          <span className="hp-ch-soon">{MATURITY_LABEL.coming_soon}</span>
        </p>
        <ul className="hp-ws-poster">
          {specimens.map((workshop) => (
            <li key={workshop.slug}>
              <Link to={`/workshops/${workshop.slug}`}>
                <b>{workshop.title}</b>
              </Link>
              <em>{workshop.category}</em>
              <span>{workshop.duration}</span>
            </li>
          ))}
        </ul>
        <p className="hp-ch-lead">
          <Link className="hp-ch-link" to="/workshops">
            See planned workshops →
          </Link>
        </p>
      </div>
    </section>
  )
}
