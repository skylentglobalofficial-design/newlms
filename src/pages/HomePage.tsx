import { Link } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import { ContentRail, ContextHeader } from '../components/product-ui'
import { WORLD_DOORS } from '../skylent-worlds'

export default function HomePage() {
  return (
    <WorldFrame world="home">
      <ContentRail>
        <ContextHeader
          world="home"
          eyebrow="Skylent"
          title="What are you here for?"
          description="Choose a destination. Same account and LMS underneath."
        />

        <nav aria-label="Skylent destinations">
          {WORLD_DOORS.map((door) => (
            <Link key={door.id} to={door.href} className="destination-row">
              <h2 className="destination-name">{door.label}</h2>
              <p className="destination-copy">{door.question}</p>
              <span className="product-btn-ghost">{door.next}</span>
            </Link>
          ))}
        </nav>

        <p className="panel-note" style={{ padding: '16px 0 32px' }}>
          Same catalogue and backend. The interface changes with the job.
        </p>
      </ContentRail>
    </WorldFrame>
  )
}
