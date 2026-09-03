import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Eyebrow, PageHero, Section, T } from '../components/ui'
import { fetchSchoolingCatalog, type SchoolingCatalogEntry } from '../api/schooling'
import { PHOTO, PHOTO_ALT, MEDIA } from '../media'
import { SC } from '../components/schooling/schoolingStyles'
import { Breadcrumbs } from '../components/contextual/Breadcrumbs'
import { educationBreadcrumbs } from '../lib/breadcrumbs'
import { VS } from '../lib/visualSystem'

function GradeCard({ grade, onSelect }: { grade: SchoolingCatalogEntry; onSelect: () => void }) {
  return (
    <article
      onClick={onSelect}
      style={{
        background: VS.surfaceElevated,
        border: `1px solid ${VS.hairline}`,
        borderRadius: T.rCard,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = VS.hairline
        e.currentTarget.style.transform = 'none'
      }}
    >
      <div style={{ height: 140, position: 'relative', overflow: 'hidden', background: VS.surface }}>
        <img
          src={PHOTO.classroomWarm}
          alt={PHOTO_ALT.classroomWarm}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: MEDIA.classroom.objectPosition, display: 'block' }}
        />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span
            style={{
              background: C.ink,
              color: C.white,
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
            }}
          >
            {grade.level?.toUpperCase() ?? 'SCHOOLING'}
          </span>
        </div>
      </div>
      <div style={{ padding: '22px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {grade.isDevelopmentCatalog && (
          <div style={{ color: VS.textMuted, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 8 }}>
            DEVELOPMENT SAMPLE
          </div>
        )}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: VS.textPrimary, margin: '0 0 8px' }}>
          {grade.name}
        </h3>
        <p
          style={{
            color: VS.textSecondary,
            fontSize: 13.5,
            lineHeight: 1.65,
            margin: '0 0 16px',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {grade.description}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, paddingTop: 14, borderTop: `1px solid ${VS.hairline}` }}>
          <div>
            <div style={{ fontSize: 10, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>SUBJECTS</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: VS.textPrimary }}>{grade.subjectCount}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>CHAPTERS</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: VS.textPrimary }}>{grade.chapterCount}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>LESSONS</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: VS.textPrimary }}>{grade.lessonCount}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, color: C.orange, fontSize: 13, fontWeight: 600 }}>View program →</div>
      </div>
    </article>
  )
}

export default function SchoolingPage() {
  const navigate = useNavigate()
  const [grades, setGrades] = useState<SchoolingCatalogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSchoolingCatalog()
      .then(setGrades)
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load schooling catalog'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageShell>
      <div style={{ background: VS.pageBg, padding: '96px clamp(16px, 4vw, 32px) 0', maxWidth: T.maxW, margin: '0 auto' }}>
        <Breadcrumbs items={educationBreadcrumbs('schooling')} tone="dark" />
      </div>
      <PageHero
        eyebrow="Schooling"
        photo={PHOTO.classroomWarm}
        photoAlt={PHOTO_ALT.classroomWarm}
        title={<>Choose your grade.</>}
        lead="School learning on Skylent follows Grade → Subject → Chapter → Lesson → Activity → Assessment. Only grades with published curriculum appear below."
        bg={SC.aurora}
        tone="dark"
      >
        <Button variant="secondary" size="lg" onClick={() => navigate('/education#schooling')}>
          Back to Education
        </Button>
      </PageHero>

      <Section bg={VS.surface} tone="dark">
        <FadeIn>
          <Eyebrow tone="dark">Published grades · parent & learner friendly</Eyebrow>
          <p style={{ color: VS.textSecondary, fontSize: 15, lineHeight: 1.7, maxWidth: 640, margin: '16px 0 32px' }}>
            Select a grade to review subjects, curriculum structure, assessments, and enrollment. Development samples are clearly labelled and are not production offerings.
          </p>
        </FadeIn>

        {loading && (
          <div style={{ color: VS.textSecondary, fontSize: 14, padding: '24px 0' }}>Loading schooling programs…</div>
        )}

        {error && (
          <div style={{ background: VS.surfaceElevated, borderRadius: T.rCard, padding: 24, color: VS.textSecondary, fontSize: 14, border: `1px solid ${VS.hairline}` }}>
            {error}
          </div>
        )}

        {!loading && !error && grades.length === 0 && (
          <div style={{ background: VS.surfaceElevated, borderRadius: T.rCard, padding: 32, textAlign: 'center', border: `1px solid ${VS.hairline}` }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: VS.textPrimary, marginBottom: 8 }}>
              No schooling programs published yet
            </div>
            <p style={{ color: VS.textSecondary, fontSize: 14, margin: 0 }}>Information coming soon.</p>
          </div>
        )}

        {!loading && grades.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {grades.map((grade, i) => (
              <FadeIn key={grade.slug} delay={i * 60}>
                <GradeCard grade={grade} onSelect={() => navigate(`/programs/${grade.slug}`)} />
              </FadeIn>
            ))}
          </div>
        )}

        <FadeIn delay={120}>
          <div
            style={{
              marginTop: 48,
              padding: '24px 28px',
              borderRadius: T.rCard,
              background: VS.surfaceElevated,
              border: `1px solid ${VS.hairline}`,
            }}
          >
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: VS.textMuted, marginBottom: 10 }}>
              HOW LEARNING WORKS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 13, color: VS.textPrimary }}>
              {['Grade', 'Subject', 'Chapter', 'Lesson', 'Activity', 'Assessment', 'Progress'].map((step, i, arr) => (
                <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: VS.surface, borderRadius: 8, padding: '6px 12px', border: `1px solid ${VS.hairline}` }}>{step}</span>
                  {i < arr.length - 1 && <span style={{ color: VS.textMuted }}>→</span>}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>
      </Section>
    </PageShell>
  )
}
