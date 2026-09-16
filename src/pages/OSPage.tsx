import { Link } from 'react-router-dom'
import { C, PageShell } from '../components/shared'
import { T } from '../tokens'

const SURFACES = [
  {
    title: 'Courses and lessons',
    body: 'Open an enrolled course and move through video, reading, quizzes, and assignments in one workspace.',
  },
  {
    title: 'Practice',
    body: 'Check understanding with quizzes and turn briefs into work you can keep as evidence.',
  },
  {
    title: 'Progress',
    body: 'See what you have completed and what comes next from the student dashboard.',
  },
]

export default function OSPage() {
  return (
    <PageShell aurora={false}>
      <section
        className="os-gateway"
        style={{
          background: C.canvas,
          minHeight: 'calc(100vh - 64px)',
          padding: 'clamp(48px, 8vw, 96px) 32px 80px',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p className="skylent-label" style={{ color: C.indigo, marginBottom: 16 }}>
            Skylent OS
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.4vw, 48px)',
              fontWeight: 600,
              color: C.ink,
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              margin: '0 0 16px',
            }}
          >
            Your learning workspace
          </h1>
          <p style={{ color: C.slate, fontSize: 17, lineHeight: 1.7, margin: '0 0 36px', maxWidth: 540 }}>
            Skylent OS is the student workspace for courses, lessons, practice, and progress. It is the same product as the student dashboard and course study view — not a separate operating system.
          </p>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: `1px solid ${T.lineStrong}` }}>
            {SURFACES.map((item) => (
              <li
                key={item.title}
                style={{
                  padding: '20px 0',
                  borderBottom: `1px solid ${T.lineLight}`,
                }}
              >
                <div style={{ color: C.ink, fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
                <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.65, margin: 0 }}>{item.body}</p>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '0 18px',
                background: C.indigo,
                color: C.white,
                borderRadius: T.rControl,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
            <Link
              to="/courses"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '0 18px',
                background: C.cream,
                color: C.ink,
                border: `1px solid ${T.lineStrong}`,
                borderRadius: T.rControl,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Browse courses
            </Link>
            <Link
              to="/dashboard/student"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '0 18px',
                color: C.indigo,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Student dashboard →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
