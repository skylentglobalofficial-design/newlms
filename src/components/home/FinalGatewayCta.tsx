import { Link } from 'react-router-dom'

export default function FinalGatewayCta() {
  return (
    <section className="home-final-gateway" aria-labelledby="home-final-gateway-heading">
      <div className="home-final-gateway-inner">
        <div className="home-section-label"><span />Begin</div>
        <h2 id="home-final-gateway-heading">
          Start with where<br />
          you&apos;re <em>going.</em>
        </h2>
        <p>
          Choose an experience. Enter the product. Leave with something you can use.
        </p>
        <div className="home-final-gateway-actions">
          <Link className="home-primary-button" to="/skills">
            Enter Skills <span aria-hidden="true">↗</span>
          </Link>
          <Link className="home-secondary-button" to="/programs">
            Browse programmes
          </Link>
        </div>
      </div>
    </section>
  )
}
