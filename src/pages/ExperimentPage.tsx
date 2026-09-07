import { useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { C } from '../components/shared'
import { labSubjects } from '../data'
import { useAuth } from '../context/AuthContext'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('professional')

export default function ExperimentPage() {
  const { labId } = useParams<{ labId: string; experimentId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: location.pathname + location.search + location.hash } })
    }
  }, [user, navigate, location.pathname, location.search, location.hash])

  const subject = labSubjects.find(s => s.id === labId)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c0e', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 52, background: C.ink, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16 }}>
        <button type="button" onClick={() => navigate(labId ? `/labs/${labId}` : '/labs')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          ← Back to lab
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div className="skylent-label" style={{ color: accent.text, marginBottom: 12 }}>Not available</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: C.white, margin: '0 0 12px' }}>
            Virtual lab experiments are not launched yet
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
            {subject
              ? `${subject.subject} experiments are listed in the catalog preview, but launch, run, and submission are not connected to enrolled courses in this environment.`
              : 'Experiment workspaces are not available in this environment.'}
          </p>
          <Link to={labId ? `/labs/${labId}` : '/labs'} style={{ color: accent.text, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Return to lab catalog →
          </Link>
        </div>
      </div>
    </div>
  )
}
