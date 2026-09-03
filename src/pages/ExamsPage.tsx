import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { T } from '../components/ui'
import { fetchExamsCatalog } from '../api/exams'
import { ExamCatalogHero } from '../components/exams/ExamCatalogHero'
import { ExamProgramCard } from '../components/exams/ExamProgramCard'
import { ExamCatalogFinalCTA, ExamPrepSystemVisual } from '../components/exams/ExamCatalogSections'
import { examMonoLabel, filterPrimaryExams } from '../components/exams/examStyles'
import { Breadcrumbs } from '../components/contextual/Breadcrumbs'
import { examBreadcrumbs } from '../lib/breadcrumbs'
import { ExamWorkflowPanel } from '../components/contextual/ExamWorkflowPanel'
import { SampleExamInterfaceVisual, IllustrativeAnalysisVisual, ExamContextPanel } from '../components/exams/ExamProductVisuals'
import { VS } from '../lib/visualSystem'

export default function ExamsPage() {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<Awaited<ReturnType<typeof fetchExamsCatalog>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExamsCatalog()
      .then(setPrograms)
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load exam catalog'))
      .finally(() => setLoading(false))
  }, [])

  const primary = filterPrimaryExams(programs)

  const programByExam = (code: string) => primary.find(p => p.examCode === code)

  return (
    <PageShell>
      <div style={{ background: C.ink, padding: '24px clamp(16px, 4vw, 32px) 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', paddingBottom: 16 }}>
          <Breadcrumbs items={examBreadcrumbs()} tone="dark" />
        </div>
      </div>
      <ExamCatalogHero
        onExploreExams={() => document.getElementById('exam-programs')?.scrollIntoView({ behavior: 'smooth' })}
        onSeeSystem={() => document.getElementById('exam-system')?.scrollIntoView({ behavior: 'smooth' })}
        onBack={() => navigate('/education#competitive-exams')}
      />

      <section id="exam-contexts" style={{ background: VS.pageBg, padding: 'clamp(48px, 8vw, 72px) clamp(16px, 4vw, 32px)', borderBottom: `1px solid ${VS.hairline}`, color: VS.textPrimary }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <FadeIn>
            <div style={examMonoLabel('dark')}>Exam contexts</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.2vw, 38px)', fontWeight: 600, color: VS.textPrimary, margin: '0 0 32px', letterSpacing: '-0.025em' }}>
              Each exam has its own performance anatomy.
            </h2>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="three-col">
            {(['JEE', 'NEET', 'CAT'] as const).map(code => {
              const linked = programByExam(code)
              return (
                <FadeIn key={code}>
                  {linked ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/programs/${linked.slug}`)}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      <ExamContextPanel examCode={code} />
                      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: C.orange, paddingLeft: 4 }}>View {code} program →</div>
                    </button>
                  ) : (
                    <div>
                      <ExamContextPanel examCode={code} />
                      <p style={{ marginTop: 10, fontSize: 12, color: VS.textMuted, fontFamily: 'var(--font-mono)', paddingLeft: 4 }}>STATUS: No {code} program published yet.</p>
                    </div>
                  )}
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      <section id="exam-programs" style={{ background: VS.surface, padding: 'clamp(56px, 9vw, 96px) clamp(16px, 4vw, 32px)', color: VS.textPrimary }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <FadeIn>
            <div style={examMonoLabel('dark')}>Published programs</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.6vw, 42px)', fontWeight: 600, color: VS.textPrimary, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
              Choose your exam
            </h2>
            <p style={{ color: VS.textSecondary, fontSize: 15, lineHeight: 1.7, maxWidth: 640, margin: '0 0 36px' }}>
              Structured prep with subject/section navigation, practice sets, tests, and mocks — development samples clearly labelled.
            </p>
          </FadeIn>
          {loading && <div style={{ color: VS.textSecondary, fontSize: 14 }}>Loading exam programs…</div>}
          {error && <div style={{ background: VS.surfaceElevated, borderRadius: T.rCard, padding: 24, color: VS.textSecondary, border: `1px solid ${VS.hairline}` }}>{error}</div>}
          {!loading && !error && primary.length === 0 && (
            <div style={{ background: VS.surfaceElevated, borderRadius: T.rCard, padding: 32, textAlign: 'center', border: `1px solid ${VS.hairline}` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 8, color: VS.textPrimary }}>No exam programs published yet</div>
              <p style={{ color: VS.textSecondary, fontSize: 14, margin: 0 }}>Information coming soon.</p>
            </div>
          )}
          {!loading && primary.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {primary.map((program, i) => (
                <ExamProgramCard key={program.slug} program={program} index={i} onSelect={() => navigate(`/programs/${program.slug}`)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ background: VS.pageBg, padding: 'clamp(48px, 8vw, 72px) clamp(16px, 4vw, 32px)', color: VS.textPrimary }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="two-col">
            <FadeIn><SampleExamInterfaceVisual /></FadeIn>
            <FadeIn delay={60}><IllustrativeAnalysisVisual /></FadeIn>
          </div>
        </div>
      </section>

      <section id="upsc-pathway" style={{ background: VS.surface, padding: 'clamp(56px, 9vw, 96px) clamp(16px, 4vw, 32px)', borderTop: `1px solid ${VS.hairline}`, color: VS.textPrimary }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <FadeIn>
            <div style={examMonoLabel('dark')}>UPSC · Stage-driven pathway</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.6vw, 42px)', fontWeight: 600, color: VS.textPrimary, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
              UPSC civil services preparation
            </h2>
            <p style={{ color: VS.textSecondary, fontSize: 15, lineHeight: 1.7, maxWidth: 640, margin: '0 0 8px' }}>
              Prelims → Mains → Optional → Answer Writing → Essay → Interview — when a program is published. No fabricated ranks, AIR, or selection rates.
            </p>
            <p style={{ color: VS.textMuted, fontSize: 13, fontFamily: 'var(--font-mono)', margin: '0 0 28px' }}>
              STATUS: No UPSC program published in this environment yet — capability preview below.
            </p>
          </FadeIn>
          <div style={{ marginBottom: 28 }}>
            <ExamContextPanel examCode="UPSC" />
          </div>
        </div>
        <ExamWorkflowPanel examCode="UPSC" />
      </section>

      <div id="exam-system"><ExamPrepSystemVisual /></div>
      <ExamCatalogFinalCTA onExplore={() => document.getElementById('exam-programs')?.scrollIntoView({ behavior: 'smooth' })} />
    </PageShell>
  )
}
