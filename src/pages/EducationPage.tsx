import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import { ContentRail, ContextHeader } from '../components/product-ui'
import { EDUCATION_HASH_REDIRECTS, WORLD_DOORS } from '../skylent-worlds'

const HUB = WORLD_DOORS.filter((door) => door.id === 'schooling' || door.id === 'exams' || door.id === 'university')

export default function EducationPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    const to = hash ? EDUCATION_HASH_REDIRECTS[hash] : undefined
    if (to) navigate(to, { replace: true })
  }, [location.hash, navigate])

  return (
    <WorldFrame world="schooling">
      <ContentRail>
        <ContextHeader
          world="schooling"
          eyebrow="Education map"
          title="Education is no longer one page."
          description="Schooling, exams, and university are separate working worlds. This route remains so older links still resolve."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Education' }]}
        />
        <nav aria-label="Education destinations">
          {HUB.map((door) => (
            <Link key={door.id} to={door.href} className="destination-row">
              <h2 className="destination-name">{door.label}</h2>
              <p className="destination-copy">{door.question} {door.promise}</p>
              <span className="product-btn-ghost">{door.next}</span>
            </Link>
          ))}
        </nav>
      </ContentRail>
    </WorldFrame>
  )
}
