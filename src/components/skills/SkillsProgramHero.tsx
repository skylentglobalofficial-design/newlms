import { C, FadeIn } from '../shared'
import { Badge, Button, Eyebrow, T } from '../ui'
import type { WebinarProgramOverview, ProfessionalProgramOverview } from '../../api/skills'
import { SK, skAuroraForProfessionalDiscipline, eventStateLabel, skGlassPanel } from './skillsStyles'
import { inferProfessionalDiscipline, type ProfessionalDiscipline } from '../../lib/programContext'
import { MarketingWorkspace } from '../subjectNative/MarketingWorkspace'
import { UiUxWorkspace } from '../subjectNative/UiUxWorkspace'
import { buildAurora, VS } from '../../lib/visualSystem'

const DISCIPLINE_WORKSPACE: Partial<Record<ProfessionalDiscipline, React.ComponentType>> = {
  UI_UX: UiUxWorkspace,
  DIGITAL_MARKETING: MarketingWorkspace,
}

const DISCIPLINE_COPY: Partial<Record<ProfessionalDiscipline, string>> = {
  UI_UX: 'Research user needs, map flows, wireframe screens, and test prototypes against real tasks.',
  DIGITAL_MARKETING: 'Plan campaigns across search, social, and paid channels — track funnel metrics and optimise spend.',
}

export function WebinarProgramHero({
  overview,
  ctaLabel,
  onCta,
  isEnrolled,
  onBack,
}: {
  overview: WebinarProgramOverview
  ctaLabel: string
  onCta: () => void
  isEnrolled: boolean
  onBack: () => void
}) {
  const stateLabel = eventStateLabel(overview.eventState)

  return (
    <section style={{ background: SK.aurora, padding: 'clamp(88px, 10vw, 112px) clamp(16px, 4vw, 32px) clamp(48px, 6vw, 64px)' }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
        <FadeIn>
          <button type="button" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.38)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 28, padding: 0, letterSpacing: '0.06em' }}>
            ← SKILLS
          </button>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)', gap: 'clamp(28px, 5vw, 48px)', alignItems: 'start' }} className="program-detail-grid">
          <div>
            <FadeIn delay={40}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <Eyebrow tone="dark">Webinar</Eyebrow>
                {stateLabel && <Badge tone="dark" accent>{stateLabel}</Badge>}
                {overview.isDevelopmentCatalog && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>DEVELOPMENT SAMPLE</span>
                )}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(32px, 4.8vw, 52px)', color: C.white, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 16px' }}>
                {overview.name}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.75, maxWidth: 560, margin: '0 0 28px' }}>{overview.description}</p>
            </FadeIn>
            <FadeIn delay={100}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button variant="primary" size="lg" onClick={onCta}>{isEnrolled ? 'Continue Learning' : ctaLabel}</Button>
                {overview.linkedWorkshopSlug && (
                  <Button variant="secondary" size="lg" onClick={() => window.location.assign(`/programs/${overview.linkedWorkshopSlug}`)} style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.14)', color: C.white }}>
                    Related program
                  </Button>
                )}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={80}>
            <div style={{ ...skGlassPanel('dark'), borderRadius: 16, padding: '24px 26px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>EVENT FACTS</div>
              {[
                ['Date', overview.eventDate ?? 'TBA'],
                ['Duration', overview.duration ?? 'TBA'],
                ['Mode', overview.mode ?? 'TBA'],
                ['Speaker', overview.speaker ?? 'TBA'],
                ['Sessions', String(overview.sessions.length)],
                ['Recording', overview.recordingAvailable ? 'Available' : 'Not yet available'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12, marginBottom: 12, alignItems: 'start' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>
                    {value}
                    {label === 'Speaker' && overview.speakerLabel && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{overview.speakerLabel}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

export function CertificateProgramHero({
  overview,
  ctaLabel,
  onCta,
  isEnrolled,
  onBack,
}: {
  overview: import('../../api/skills').CertificateProgramOverview
  ctaLabel: string
  onCta: () => void
  isEnrolled: boolean
  onBack: () => void
}) {
  return (
    <section style={{ background: buildAurora('certificate'), padding: 'clamp(88px, 10vw, 112px) clamp(16px, 4vw, 32px) clamp(48px, 6vw, 64px)' }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
        <FadeIn>
          <button type="button" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.38)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 28, padding: 0, letterSpacing: '0.06em' }}>
            ← SKILLS
          </button>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(260px, 0.9fr)', gap: 'clamp(28px, 5vw, 48px)', alignItems: 'start' }} className="program-detail-grid">
          <div>
            <FadeIn delay={40}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
                <Eyebrow tone="dark">Certificate Program</Eyebrow>
                {overview.isDevelopmentCatalog && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>DEVELOPMENT SAMPLE</span>
                )}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(32px, 4.8vw, 52px)', color: C.white, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 16px' }}>{overview.name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.75, maxWidth: 560, margin: '0 0 24px' }}>{overview.description}</p>
            </FadeIn>
            <FadeIn delay={100}>
              <Button variant="primary" size="lg" onClick={onCta}>{isEnrolled ? 'Continue Learning' : ctaLabel}</Button>
            </FadeIn>
          </div>
          <FadeIn delay={80}>
            <div style={{ ...skGlassPanel('dark'), borderRadius: 16, padding: '24px 26px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>CREDENTIAL OVERVIEW</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 2, marginBottom: 16 }}>{overview.segment.curriculumModel}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[['Modules', overview.moduleCount], ['Topics', overview.topicCount], ['Assessments', overview.assessmentCount], ['Projects', overview.projectCount]].filter(([, v]) => (v as number) > 0).map(([l, v]) => (
                  <span key={String(l)} style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                    <span style={{ color: VS.textMuted, fontFamily: 'var(--font-mono)', fontSize: 10 }}>{l} </span><span style={{ fontWeight: 600, color: VS.textPrimary }}>{v}</span>
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

export function ProfessionalProgramHero({
  overview,
  ctaLabel,
  onCta,
  isEnrolled,
  onBack,
}: {
  overview: ProfessionalProgramOverview
  ctaLabel: string
  onCta: () => void
  isEnrolled: boolean
  onBack: () => void
}) {
  const discipline = inferProfessionalDiscipline({ slug: overview.slug, name: overview.name })
  const Workspace = DISCIPLINE_WORKSPACE[discipline]
  const disciplineLead = DISCIPLINE_COPY[discipline]

  if (Workspace && disciplineLead) {
    const aurora = skAuroraForProfessionalDiscipline(discipline)
    return (
      <section className="subject-native-hero" style={{ background: aurora, padding: 'clamp(88px, 10vw, 112px) clamp(16px, 4vw, 32px) clamp(48px, 6vw, 64px)' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <button type="button" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.38)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 28, padding: 0, letterSpacing: '0.06em' }}>
            ← SKILLS
          </button>
          <div className="subject-native-hero-grid">
            <div className="subject-native-hero-main">
              <Workspace />
              <div className="subject-native-hero-copy">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  <Eyebrow tone="dark">Professional Program</Eyebrow>
                  {overview.supportsCareerOs && <Badge tone="dark" accent>Career OS</Badge>}
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(28px, 3.6vw, 44px)', color: C.white, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 12px' }}>{overview.name}</h1>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.72, maxWidth: 620, margin: '0 0 20px' }}>{disciplineLead}</p>
                <Button variant="primary" size="lg" onClick={onCta}>{isEnrolled ? 'Continue Learning' : ctaLabel}</Button>
              </div>
            </div>
            <aside className="subject-native-hero-aside">
              <div style={{ ...skGlassPanel('dark'), borderRadius: 16, padding: '24px 26px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>PROGRAM FACTS</div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{overview.description}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={{ background: SK.aurora, padding: 'clamp(88px, 10vw, 112px) clamp(16px, 4vw, 32px) clamp(48px, 6vw, 64px)' }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
        <button type="button" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.38)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 28, padding: 0, letterSpacing: '0.06em' }}>
          ← SKILLS
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(260px, 0.9fr)', gap: 'clamp(28px, 5vw, 48px)', alignItems: 'start' }} className="program-detail-grid">
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <Eyebrow tone="dark">Professional Program</Eyebrow>
              {overview.supportsCareerOs && <Badge tone="dark" accent>Career OS</Badge>}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(32px, 4.8vw, 52px)', color: C.white, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 16px' }}>{overview.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.75, maxWidth: 560, margin: '0 0 24px' }}>{overview.description}</p>
            <Button variant="primary" size="lg" onClick={onCta}>{isEnrolled ? 'Continue Learning' : ctaLabel}</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
