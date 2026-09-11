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
          description="One platform with six working surfaces. Pick the one that matches the job you need to do."
        />

        <nav aria-label="Skylent destinations">
          {WORLD_DOORS.map((door) => (
            <Link key={door.id} to={door.href} className="destination-row">
              <h2 className="destination-name">{door.label}</h2>
              <p className="destination-copy">
                <strong>{door.who}</strong>
                {' '}
                {door.question}
                {' '}
                {door.promise}
              </p>
              <span className="product-btn-ghost">{door.next}</span>
            </Link>
          ))}
        </nav>

        <p className="panel-note" style={{ padding: '18px 0 48px' }}>
          Same account, catalogue, LMS, and backend. The interface changes because a class 8 student, a JEE aspirant, and an institution admin are not doing the same work.
        </p>
      </ContentRail>
    </WorldFrame>
  )
}
