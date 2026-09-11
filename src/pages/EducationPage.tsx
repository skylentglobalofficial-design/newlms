import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import { EDUCATION_HASH_REDIRECTS, WORLD_DOORS } from '../skylent-worlds'

const HUB = WORLD_DOORS.filter((door) => door.id !== 'learn' && door.id !== 'career' && door.id !== 'institutions')

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
      <header className="world-hero">
        <div className="world-rail">
          <p className="world-kicker">Education map</p>
          <h1 className="world-title">Education is no longer one page.</h1>
          <p className="world-lede">
            Schooling, exams, and university are separate working worlds now. This route remains so older links still resolve.
          </p>
        </div>
      </header>
      <section className="world-section">
        <div className="world-rail">
          <div className="world-card-list">
            {HUB.map((door) => (
              <Link key={door.id} className="world-card" to={door.href}>
                <b>{door.label}</b>
                <p>{door.question}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </WorldFrame>
  )
}
