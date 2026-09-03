import { useState } from 'react'
import { C, FadeIn } from '../shared'
import { T } from '../ui'
import type { WebinarProgramOverview, CertificateProgramOverview, ProfessionalProgramOverview } from '../../api/skills'
import { SK, skMonoLabel, skSectionHead, supportStatusColor } from './skillsStyles'
import { VS } from '../../lib/visualSystem'

function SkillsSectionPanel({ id, eyebrow, title, children, bg = VS.pageBg }: { id?: string; eyebrow: string; title: string; children: React.ReactNode; bg?: string }) {
  return (
    <section id={id} style={{ background: bg, padding: SK.sectionPad, color: VS.textPrimary }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
        <FadeIn>
          <div style={skMonoLabel('dark')}>{eyebrow}</div>
          <h2 style={{ ...skSectionHead('dark'), marginBottom: 24 }}>{title}</h2>
        </FadeIn>
        {children}
      </div>
    </section>
  )
}

export function WebinarProgramSections({ overview }: { overview: WebinarProgramOverview }) {
  return (
    <>
      {overview.whatYouWillLearn && overview.whatYouWillLearn.length > 0 && (
        <SkillsSectionPanel id="overview" eyebrow="What you'll learn" title="Session focus">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {overview.whatYouWillLearn.map(item => (
              <div key={item} style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 18, color: VS.textPrimary, fontSize: 14, lineHeight: 1.6 }}>
                · {item}
              </div>
            ))}
          </div>
        </SkillsSectionPanel>
      )}
      <SkillsSectionPanel id="agenda" eyebrow="Session agenda" title="Event schedule">
        {overview.sessions.length === 0 ? (
          <div style={{ color: VS.textSecondary, fontSize: 14 }}>Session agenda will appear when published.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {overview.sessions.map(session => (
              <div key={session.id} style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: '20px 22px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: SK.webinar.accent, marginBottom: 8 }}>SESSION</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: VS.textPrimary, marginBottom: 8 }}>{session.title}</div>
                {session.description && <p style={{ color: VS.textSecondary, fontSize: 14, margin: '0 0 12px' }}>{session.description}</p>}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: VS.textSecondary }}>
                  {session.speaker && <span>Speaker: {session.speaker}{session.speakerLabel ? ` (${session.speakerLabel})` : ''}</span>}
                  {session.topicCount > 0 && <span>{session.topicCount} topics</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SkillsSectionPanel>
      <SkillsSectionPanel id="resources" eyebrow="Recording & resources" title="Post-event materials" bg={VS.surface}>
        {overview.recordingAvailable ? (
          <div style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 24, color: VS.textPrimary, fontSize: 14 }}>
            Recording access is available for enrolled learners through the learning workspace.
          </div>
        ) : (
          <div style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 24, color: VS.textSecondary, fontSize: 14 }}>
            Recording and resource materials will be listed here when available. No private storage URLs are exposed publicly.
          </div>
        )}
      </SkillsSectionPanel>
    </>
  )
}

export function CertificateProgramSections({ overview }: { overview: CertificateProgramOverview }) {
  const [activeModuleId, setActiveModuleId] = useState(overview.modules[0]?.id ?? '')

  return (
    <>
      <SkillsSectionPanel id="roadmap" eyebrow="Learning roadmap" title="Structured credential path">
        <div style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: SK.certificate.accentMuted, lineHeight: 2 }}>{overview.segment.curriculumModel}</div>
        </div>
      </SkillsSectionPanel>
      <SkillsSectionPanel id="modules" eyebrow="Modules" title="Program modules" bg={VS.surface}>
        {overview.modules.length === 0 ? (
          <div style={{ color: VS.textSecondary, fontSize: 14 }}>No modules published yet.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }} role="tablist" aria-label="Select module">
              {overview.modules.map(mod => (
                <button key={mod.id} type="button" role="tab" aria-selected={mod.id === activeModuleId} onClick={() => setActiveModuleId(mod.id)}
                  style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${mod.id === activeModuleId ? SK.certificate.accent : VS.hairline}`, background: mod.id === activeModuleId ? SK.certificate.accent : VS.surfaceElevated, color: mod.id === activeModuleId ? C.white : VS.textPrimary, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {mod.title}
                </button>
              ))}
            </div>
            {(overview.modules.find(m => m.id === activeModuleId) ?? overview.modules[0]) && (
              <div style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 24 }}>
                {(overview.modules.find(m => m.id === activeModuleId) ?? overview.modules[0])!.description && (
                  <p style={{ color: VS.textSecondary, fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>
                    {(overview.modules.find(m => m.id === activeModuleId) ?? overview.modules[0])!.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 11, color: VS.textSecondary }}>
                  <span>{(overview.modules.find(m => m.id === activeModuleId) ?? overview.modules[0])!.topicCount} topics</span>
                  <span>{(overview.modules.find(m => m.id === activeModuleId) ?? overview.modules[0])!.assessmentCount} assessments</span>
                  <span>{(overview.modules.find(m => m.id === activeModuleId) ?? overview.modules[0])!.projectCount} projects</span>
                </div>
              </div>
            )}
          </>
        )}
      </SkillsSectionPanel>
      <SkillsSectionPanel id="assessment" eyebrow="Assessments" title="Module assessments">
        {overview.assessments.length === 0 ? (
          <div style={{ color: VS.textSecondary, fontSize: 14 }}>No assessments published yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {overview.assessments.map(a => (
              <div key={a.id} style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 18 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: SK.certificate.accentMuted, marginBottom: 6 }}>{a.type}</div>
                <div style={{ fontWeight: 600, color: VS.textPrimary, fontSize: 14 }}>{a.title}</div>
                {a.nodeTitle && <div style={{ color: VS.textSecondary, fontSize: 12, marginTop: 4 }}>{a.nodeTitle}</div>}
              </div>
            ))}
          </div>
        )}
      </SkillsSectionPanel>
      <SkillsSectionPanel id="projects" eyebrow="Project" title="Applied project work" bg={VS.surface}>
        {overview.projects.length === 0 ? (
          <div style={{ color: VS.textSecondary, fontSize: 14 }}>No projects published yet.</div>
        ) : (
          overview.projects.map(project => (
            <div key={project.id} style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 24, marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: VS.textPrimary, marginBottom: 8 }}>{project.title}</div>
              {project.objective && <p style={{ color: VS.textSecondary, fontSize: 14, lineHeight: 1.7, margin: '0 0 12px' }}>{project.objective}</p>}
              {project.skills.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {project.skills.map(s => (
                    <span key={s} style={{ background: VS.surface, borderRadius: 6, padding: '4px 10px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </SkillsSectionPanel>
      <SkillsSectionPanel id="certification" eyebrow="Certification" title="Completion requirements & eligibility">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="two-col">
          <div style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: SK.certificate.accentMuted, marginBottom: 12 }}>REQUIREMENTS</div>
            {overview.completionRequirements.map(req => (
              <div key={req} style={{ color: VS.textPrimary, fontSize: 14, lineHeight: 1.8 }}>· {req}</div>
            ))}
          </div>
          <div style={{ background: VS.surface, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: SK.certificate.accentMuted, marginBottom: 12 }}>ELIGIBILITY · {overview.certificateEligibility.status}</div>
            {overview.certificateEligibility.requirements.map(req => (
              <div key={req} style={{ color: VS.textPrimary, fontSize: 14, lineHeight: 1.8 }}>· {req}</div>
            ))}
            <p style={{ color: VS.textSecondary, fontSize: 13, lineHeight: 1.6, margin: '16px 0 0' }}>{overview.certificateEligibility.note}</p>
          </div>
        </div>
      </SkillsSectionPanel>
    </>
  )
}

export function ProfessionalProgramSections({ overview }: { overview: ProfessionalProgramOverview }) {
  const [activeModuleId, setActiveModuleId] = useState(overview.modules[0]?.id ?? '')

  return (
    <>
      <SkillsSectionPanel id="career-direction" eyebrow="Career direction" title="Practical career orientation">
        {(overview.careerReadiness ?? overview.whatYouWillLearn ?? []).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {(overview.careerReadiness ?? overview.whatYouWillLearn ?? []).map(item => (
              <div key={item} style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 18, color: VS.textPrimary, fontSize: 14, lineHeight: 1.6 }}>· {item}</div>
            ))}
          </div>
        ) : (
          <div style={{ color: VS.textSecondary, fontSize: 14 }}>Career direction details will appear when published.</div>
        )}
      </SkillsSectionPanel>
      <SkillsSectionPanel id="modules" eyebrow="Modules" title="Program modules / months" bg={VS.surface}>
        {overview.modules.length === 0 ? (
          <div style={{ color: VS.textSecondary, fontSize: 14 }}>No modules published yet.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }} role="tablist" aria-label="Select module">
              {overview.modules.map(mod => (
                <button key={mod.id} type="button" role="tab" aria-selected={mod.id === activeModuleId} onClick={() => setActiveModuleId(mod.id)}
                  style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${mod.id === activeModuleId ? SK.professional.accent : VS.hairline}`, background: mod.id === activeModuleId ? SK.professional.accent : VS.surfaceElevated, color: mod.id === activeModuleId ? C.white : VS.textPrimary, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {mod.title}
                </button>
              ))}
            </div>
            {(overview.modules.find(m => m.id === activeModuleId) ?? overview.modules[0]) && (
              <div style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 24 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 11, color: VS.textSecondary }}>
                  <span>{(overview.modules.find(m => m.id === activeModuleId) ?? overview.modules[0])!.topicCount} topics</span>
                  <span>{(overview.modules.find(m => m.id === activeModuleId) ?? overview.modules[0])!.projectCount} projects</span>
                  <span>{(overview.modules.find(m => m.id === activeModuleId) ?? overview.modules[0])!.assessmentCount} assessments</span>
                </div>
              </div>
            )}
          </>
        )}
      </SkillsSectionPanel>
      <SkillsSectionPanel id="projects" eyebrow="Projects" title="Applied project work">
        {overview.projects.length === 0 ? (
          <div style={{ color: VS.textSecondary, fontSize: 14 }}>No projects published yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {overview.projects.map(project => (
              <div key={project.id} style={{ background: VS.surface, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 24 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: SK.professional.accentMuted, marginBottom: 8 }}>PROJECT</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: VS.textPrimary, marginBottom: 8 }}>{project.title}</div>
                {project.objective && <p style={{ color: VS.textSecondary, fontSize: 14, lineHeight: 1.7, margin: '0 0 12px' }}>{project.objective}</p>}
                {project.expectedOutput && (
                  <div style={{ fontSize: 13, color: VS.textPrimary, marginBottom: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: VS.textMuted }}>OUTPUT </span>{project.expectedOutput}
                  </div>
                )}
                {project.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {project.skills.map(s => (
                      <span key={s} style={{ background: VS.surfaceElevated, borderRadius: 6, padding: '4px 10px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SkillsSectionPanel>
      <SkillsSectionPanel id="career-support" eyebrow="Career support" title="Support after learning" bg={VS.surface}>
        <div style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: SK.professional.accentMuted, marginBottom: 12 }}>STATUS · {overview.careerSupport.status}</div>
          <p style={{ color: VS.textSecondary, fontSize: 14, lineHeight: 1.7, margin: '0 0 20px' }}>{overview.careerSupport.note}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {overview.careerSupport.areas.map(area => (
              <div key={area.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 14px', background: VS.surface, borderRadius: 10 }}>
                <span style={{ color: VS.textPrimary, fontSize: 14 }}>{area.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: supportStatusColor(area.status) }}>{area.status.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </SkillsSectionPanel>
    </>
  )
}

export function SkillsProgramSections({
  overview,
}: {
  overview: WebinarProgramOverview | CertificateProgramOverview | ProfessionalProgramOverview
}) {
  if (overview.programType === 'WEBINAR') return <WebinarProgramSections overview={overview} />
  if (overview.programType === 'CERTIFICATE') return <CertificateProgramSections overview={overview} />
  return <ProfessionalProgramSections overview={overview} />
}
