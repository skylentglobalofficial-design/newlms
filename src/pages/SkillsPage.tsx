import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, SectionHeader, T } from '../components/ui'
import { Breadcrumbs } from '../components/contextual/Breadcrumbs'
import { skillsBreadcrumbs } from '../lib/breadcrumbs'
import { fetchSkillsCatalog } from '../api/skills'
import {
  SkillsCatalogHero,
  SkillsExperienceNav,
  SkillsDeepRouteHero,
  SkillsOtherExperiences,
} from '../components/skills/SkillsCatalogHero'
import { WebinarCard, CertificateProgramCard, ProfessionalProgramCard, ProfessionalDomainGateway } from '../components/skills/SkillsProgramCards'
import { JobAssistanceSection, SkillsCatalogFinalCTA } from '../components/skills/JobAssistanceSection'
import { skMonoLabel } from '../components/skills/skillsStyles'
import { CertificateCredentialPathVisual } from '../components/skills/SkillsProductVisuals'
import { VS } from '../lib/visualSystem'

type SkillsSection = 'webinars' | 'certificates' | 'professional' | 'job-assistance'

function resolveSection(pathname: string, section?: SkillsSection): SkillsSection | undefined {
  if (section) return section
  if (pathname.endsWith('/webinars')) return 'webinars'
  if (pathname.endsWith('/certificates')) return 'certificates'
  if (pathname.endsWith('/professional')) return 'professional'
  if (pathname.endsWith('/job-assistance')) return 'job-assistance'
  return undefined
}

export default function SkillsPage({ section }: { section?: SkillsSection }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof fetchSkillsCatalog>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeSection = resolveSection(location.pathname, section)
  const isDeepRoute = !!activeSection

  useEffect(() => {
    fetchSkillsCatalog()
      .then(setCatalog)
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load skills catalog'))
      .finally(() => setLoading(false))
  }, [])

  const navToSection = (id: SkillsSection) => {
    const paths: Record<SkillsSection, string> = {
      webinars: '/education/skills/webinars',
      certificates: '/education/skills/certificates',
      professional: '/education/skills/professional',
      'job-assistance': '/education/skills/job-assistance',
    }
    navigate(paths[id])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showSection = (id: SkillsSection) => !isDeepRoute || activeSection === id

  return (
    <PageShell>
      <div style={{ background: C.ink, padding: '24px clamp(16px, 4vw, 32px) 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', paddingBottom: 16 }}>
          <Breadcrumbs items={skillsBreadcrumbs(activeSection)} tone="dark" />
        </div>
      </div>

      {isDeepRoute ? (
        <SkillsDeepRouteHero section={activeSection} onBack={() => navigate('/education/skills')} />
      ) : (
        <SkillsCatalogHero
          onExploreWebinars={() => navToSection('webinars')}
          onExploreCertificates={() => navToSection('certificates')}
          onExploreProfessional={() => navToSection('professional')}
          onExploreJobAssistance={() => navToSection('job-assistance')}
          onBack={() => navigate('/education')}
        />
      )}

      <SkillsExperienceNav active={activeSection} onSelect={navToSection} />

      {showSection('webinars') && (
        <Section bg={VS.pageBg} id="webinars" tone="dark">
          {!isDeepRoute && (
            <FadeIn>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start', marginBottom: 32 }} className="two-col-sm">
                <div>
                  <SectionHeader
                    eyebrow="Discover · Attend"
                    title="Live sessions — event-first."
                    lead="Date, speaker, topic, format, and registration from the catalog. No fabricated speakers."
                    tone="dark"
                  />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: VS.textMuted, letterSpacing: '0.08em', padding: '14px 16px', background: VS.surface, borderRadius: 10, border: `1px solid ${VS.hairline}` }}>
                  EVENT ANATOMY · UPCOMING · LIVE · RECORDED
                </div>
              </div>
            </FadeIn>
          )}
          {loading && <div style={{ color: VS.textSecondary, fontSize: 14 }}>Loading webinars…</div>}
          {error && (
            <div style={{ background: VS.surface, borderRadius: T.rCard, padding: 24, color: VS.textSecondary, border: `1px solid ${VS.hairline}` }}>{error}</div>
          )}
          {!loading && !error && (catalog?.webinars.length ?? 0) === 0 && (
            <div style={{ background: VS.surface, borderRadius: T.rCard, padding: 32, textAlign: 'center', border: `1px solid ${VS.hairline}` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 8, color: VS.textPrimary }}>No upcoming webinars</div>
              <p style={{ color: VS.textSecondary, fontSize: 14, margin: 0 }}>New events will appear here when published — honest empty state, not placeholder speakers.</p>
            </div>
          )}
          {!loading && catalog && catalog.webinars.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {catalog.webinars.map((webinar, i) => (
                <WebinarCard
                  key={webinar.programSlug ?? webinar.slug}
                  webinar={webinar}
                  index={i}
                  onSelect={() => {
                    if (webinar.programSlug) navigate(`/programs/${webinar.programSlug}`)
                    else if (webinar.linkedWorkshopSlug) navigate(`/programs/${webinar.linkedWorkshopSlug}`)
                  }}
                />
              ))}
            </div>
          )}
        </Section>
      )}

      {showSection('certificates') && (
        <Section bg={VS.surface} id="certificate" tone="dark">
          {!isDeepRoute && (
            <FadeIn>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center', marginBottom: 36 }} className="two-col">
                <div>
                  <div style={skMonoLabel('dark')}>Learn · Complete · Credential</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.6vw, 42px)', fontWeight: 600, color: VS.textPrimary, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
                    Structured credentials with honest completion states.
                  </h2>
                  <p style={{ color: VS.textSecondary, fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
                    Curriculum → assessment → project → credential. Issuance depends on program configuration — stated per program when not available.
                  </p>
                </div>
                <CertificateCredentialPathVisual />
              </div>
            </FadeIn>
          )}
          {!loading && catalog && catalog.certificates.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }} className="two-col">
              {catalog.certificates.map((program, i) => (
                <CertificateProgramCard key={program.slug} program={program} index={i} onSelect={() => navigate(`/programs/${program.slug}`)} />
              ))}
            </div>
          ) : !loading ? (
            <div style={{ color: VS.textSecondary, fontSize: 14, background: VS.surfaceElevated, borderRadius: T.rCard, padding: 24, border: `1px solid ${VS.hairline}` }}>
              Certificate programs will appear here as they are published.
            </div>
          ) : null}
        </Section>
      )}

      {showSection('professional') && (
        <Section bg={C.ink} id="professional">
          {!isDeepRoute && (
            <FadeIn>
              <div style={{ marginBottom: 32 }}>
                <div style={{ ...skMonoLabel('dark'), color: 'rgba(255,255,255,0.4)' }}>Role · Workflow · Career</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 600, color: C.white, margin: '0 0 16px', letterSpacing: '-0.03em' }}>
                  Professional domains — not identical cards.
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.75, maxWidth: 560, margin: 0 }}>
                  Each domain exposes meaningful anatomy: datasets and dashboards for analytics, frontend and API for full stack, research and roadmap for product — previews only.
                </p>
              </div>
            </FadeIn>
          )}
          {!loading && catalog && (
            <ProfessionalDomainGateway programs={catalog.professionals} onSelect={slug => navigate(`/programs/${slug}`)} />
          )}
          {!loading && catalog && catalog.professionals.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 24 }} className="programs-grid">
              {catalog.professionals.map((program, i) => (
                <ProfessionalProgramCard key={program.slug} program={program} index={i} onSelect={() => navigate(`/programs/${program.slug}`)} />
              ))}
            </div>
          ) : !loading ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Professional programs will appear here when published.</div>
          ) : null}
        </Section>
      )}

      {showSection('job-assistance') && catalog && (
        <JobAssistanceSection jobAssistance={catalog.jobAssistance} onOpenCareerOs={() => navigate('/career-os')} />
      )}

      {isDeepRoute && activeSection && (
        <SkillsOtherExperiences active={activeSection} onSelect={navToSection} />
      )}

      {!isDeepRoute && <SkillsCatalogFinalCTA onOpenCareerOs={() => navigate('/career-os')} />}
    </PageShell>
  )
}
