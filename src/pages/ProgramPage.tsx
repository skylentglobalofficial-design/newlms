import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import {
  Button, ButtonLink, Card, DefinitionList, EmptyState, MetaRow, Note,
  Rail, SectionHeading, StatusPill, Tag,
} from '../design/primitives'
import { getSurfaceAccent } from '../design/accent'
import { PROGRAM_TYPE_LABEL, formatInr } from '../design/CatalogueCard'
import { R, S, TY } from '../design/tokens'
import { getProgrammeAvailability, liveCourseSlugsForProgram } from '../lib/catalogue-status'
import { useCatalogEnrollment } from '../hooks/useCatalogEnrollment'
import { resolveAuroraTheme } from '../aurora-themes'
import { courses, programs } from '../data'
import type { Program } from '../data'
import '../design/detail.css'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'projects', label: 'Projects' },
  { id: 'delivery', label: 'How it runs' },
  { id: 'fees', label: 'Fees' },
  { id: 'faq', label: 'FAQ' },
]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84, behavior: 'smooth' })
}

// ── Summary rail ─────────────────────────────────────────────────────────────
function SummaryRail({ program }: { program: Program }) {
  const themeId = resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType)
  const availability = getProgrammeAvailability(program)
  const { startProgramEnrollment, enrolling, enrollError } = useCatalogEnrollment()
  const modules = program.curriculumDetail?.length ?? 0
  const lowestPrice = program.pricing.length ? Math.min(...program.pricing.map(tier => tier.price)) : null

  return (
    <Card padding={22} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <StatusPill availability={availability} />
        <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '10px 0 0' }}>{availability.explanation}</p>
      </div>

      <div>
        <div style={{ ...TY.bodySm, color: S.inkMuted }}>Fee</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: S.ink, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {lowestPrice === null ? 'On request' : formatInr(lowestPrice)}
        </div>
        {program.pricing.length > 1 && (
          <div style={{ ...TY.meta, color: S.inkMuted, marginTop: 2 }}>
            Lowest of {program.pricing.length} tiers · <button type="button" className="sk-inline-link" onClick={() => scrollToSection('fees')}>compare</button>
          </div>
        )}
      </div>

      <DefinitionList
        items={[
          { term: 'Duration', value: program.duration },
          { term: 'Level', value: program.level },
          { term: 'Mode', value: program.format },
          { term: 'Published modules', value: modules > 0 ? modules : 'None yet' },
          { term: 'Credential', value: program.cert },
          { term: 'Starts', value: program.upcomingBatch },
        ]}
      />

      {availability.canStartLearning ? (
        <Button themeId={themeId} full size="lg" disabled={enrolling} onClick={() => startProgramEnrollment(program.slug)}>
          {enrolling ? 'Enrolling…' : availability.ctaLabel}
        </Button>
      ) : (
        <ButtonLink to="/contact" themeId={themeId} full size="lg">
          {availability.ctaLabel}
        </ButtonLink>
      )}

      {enrollError && <Note tone="caution">{enrollError}</Note>}

      <p style={{ ...TY.meta, color: S.inkMuted, margin: 0 }}>
        {availability.canStartLearning
          ? 'Enrolling opens the linked courses in the learning platform straight away.'
          : 'Registering interest starts a conversation. It does not reserve a place or take payment.'}
      </p>
    </Card>
  )
}

// ── Curriculum ───────────────────────────────────────────────────────────────
function Curriculum({ program }: { program: Program }) {
  const [open, setOpen] = useState<string | null>(program.curriculumDetail?.[0]?.number ?? null)
  const themeId = resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType)
  const accent = getSurfaceAccent(themeId)
  const modules = program.curriculumDetail ?? []

  if (!modules.length) {
    return (
      <EmptyState
        title="No curriculum published"
        body="The syllabus for this programme has not been written up yet. We would rather show nothing than a placeholder outline."
      />
    )
  }

  return (
    <div className="sk-accordion">
      {modules.map(module => {
        const isOpen = open === module.number
        return (
          <div key={module.number} className="sk-accordion-item">
            <button
              type="button"
              className="sk-accordion-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : module.number)}
            >
              <span className="sk-accordion-index" style={{ color: accent.text, background: accent.soft }}>
                {module.number}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...TY.h3, color: S.ink, display: 'block', fontFamily: 'var(--font-display)' }}>{module.title}</span>
                <span style={{ ...TY.meta, color: S.inkMuted }}>{module.duration}</span>
              </span>
              <span aria-hidden className="sk-accordion-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                <svg width="13" height="8" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6z" /></svg>
              </span>
            </button>
            {isOpen && (
              <div className="sk-accordion-panel">
                <p style={{ ...TY.body, color: S.inkSecondary, margin: 0 }}>{module.description}</p>
                {module.topics && module.topics.length > 0 && (
                  <ul className="sk-topic-list">
                    {module.topics.map(topic => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ProgramPage() {
  const { slug } = useParams<{ slug: string }>()
  const program = useMemo(() => programs.find(p => p.slug === slug), [slug])
  const [activeSection, setActiveSection] = useState('overview')

  if (!program) {
    return (
      <ProductShell>
        <Rail>
          <div style={{ padding: '80px 0' }}>
            <EmptyState
              title="Programme not found"
              body="This programme is not in the catalogue."
              action={<ButtonLink to="/programs" variant="secondary">Browse programmes</ButtonLink>}
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  const themeId = resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType)
  const accent = getSurfaceAccent(themeId)
  const availability = getProgrammeAvailability(program)
  const liveCourses = liveCourseSlugsForProgram(program.slug)
    .map(courseSlug => courses.find(course => course.slug === courseSlug))
    .filter((course): course is NonNullable<typeof course> => !!course)
  const realFaculty = (program.faculty ?? []).filter(member => !member.placeholder)
  const modules = program.curriculumDetail ?? []

  return (
    <ProductShell className="sk-has-sticky-bar">
      <Rail>
        <div className="sk-detail-head">
          <Link to="/programs" className="sk-backlink"><span aria-hidden>←</span> All programmes</Link>
          <div className="sk-detail-head-row">
            <div style={{ minWidth: 0 }}>
              <div style={{ ...TY.meta, color: accent.text, fontWeight: 600, marginBottom: 8 }}>
                {PROGRAM_TYPE_LABEL[program.programType]}
              </div>
              <h1 style={{ ...TY.display, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{program.name}</h1>
              <p style={{ ...TY.bodyLg, color: S.inkSecondary, margin: '14px 0 0', maxWidth: '62ch' }}>{program.desc}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 16 }}>
                <StatusPill availability={availability} />
                <Tag>{program.level}</Tag>
                <Tag>{program.duration}</Tag>
                <Tag>{program.format}</Tag>
              </div>
            </div>
          </div>
        </div>

        <nav className="sk-anchor-nav" aria-label="Sections on this page">
          {SECTIONS.map(section => (
            <button
              key={section.id}
              type="button"
              className={`sk-anchor${activeSection === section.id ? ' is-active' : ''}`}
              style={activeSection === section.id ? { color: S.ink, borderBottomColor: accent.solid } : undefined}
              onClick={() => { setActiveSection(section.id); scrollToSection(section.id) }}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="sk-detail">
          <div className="sk-detail-main sk-stack">
            {/* Overview */}
            <section id="overview">
              <SectionHeading title="What this programme covers" />
              {program.whatYouWillLearn?.length ? (
                <ul className="sk-check-list">
                  {program.whatYouWillLearn.map(item => (
                    <li key={item}>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden style={{ flexShrink: 0, marginTop: 3 }}>
                        <circle cx="8" cy="8" r="7.2" fill={accent.soft} stroke={accent.line} strokeWidth="0.8" />
                        <path d="M4.6 8.3L6.9 10.6L11.4 5.7" stroke={accent.solid} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact title="Not published yet" body="Learning outcomes for this programme have not been written up." />
              )}

              {program.whoIsItFor?.length ? (
                <div style={{ marginTop: 30 }}>
                  <SectionHeading size="sm" title="Who it is for" />
                  <div className="sk-grid sk-grid-2">
                    {program.whoIsItFor.map(item => (
                      <Card key={item} tone="muted" padding={16}>
                        <span style={{ ...TY.bodySm, color: S.inkSecondary }}>{item}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            {/* Live learning */}
            <section id="learning-platform">
              <SectionHeading
                title="What is open in the learning platform"
                lead="Only material that actually exists in the platform is listed here."
              />
              {liveCourses.length ? (
                <>
                  <div className="sk-grid sk-grid-2">
                    {liveCourses.map(course => {
                      const lessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)
                      return (
                        <Link key={course.slug} to={`/courses/${course.slug}`} className="sk-card sk-card-interactive sk-linked-course">
                          <span style={{ ...TY.h3, color: S.ink, fontFamily: 'var(--font-display)' }}>{course.title}</span>
                          <MetaRow items={[`${lessons} lessons`, `${course.modules.length} modules`, course.level]} />
                          <span style={{ ...TY.bodySm, color: accent.text, fontWeight: 600 }}>Open course <span aria-hidden>→</span></span>
                        </Link>
                      )
                    })}
                  </div>
                  {modules.length > liveCourses.length && (
                    <div style={{ marginTop: 14 }}>
                      <Note>
                        The syllabus above describes {modules.length} modules. {liveCourses.length} course
                        {liveCourses.length === 1 ? '' : 's'} of that material {liveCourses.length === 1 ? 'is' : 'are'} currently
                        published; the rest is still being produced.
                      </Note>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  title="Nothing to open yet"
                  body="No lessons for this programme have been published. The curriculum below describes what is planned."
                />
              )}
            </section>

            {/* Curriculum */}
            <section id="curriculum">
              <SectionHeading
                title="Curriculum"
                lead={modules.length ? `${modules.length} published module${modules.length === 1 ? '' : 's'}.` : undefined}
              />
              <Curriculum program={program} />
            </section>

            {/* Projects */}
            <section id="projects">
              <SectionHeading title="Projects" />
              {program.projectsDetail?.length ? (
                <div className="sk-stack-sm">
                  {program.projectsDetail.map(project => (
                    <Card key={project.title} padding={20}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                        <h3 style={{ ...TY.h3, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{project.title}</h3>
                        <Tag>{project.difficulty}</Tag>
                      </div>
                      <p style={{ ...TY.body, color: S.inkSecondary, margin: '0 0 12px' }}>{project.what}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {project.skills.map(skill => <Tag key={skill}>{skill}</Tag>)}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState compact title="No project briefs published" body="This programme does not have published project work." />
              )}
            </section>

            {/* Delivery */}
            <section id="delivery">
              <SectionHeading title="How it runs" />
              {program.learningExperience?.length ? (
                <ul className="sk-plain-list">
                  {program.learningExperience.map(item => <li key={item}>{item}</li>)}
                </ul>
              ) : null}

              <div style={{ marginTop: 22 }}>
                <SectionHeading size="sm" title="Assessment and credential" />
                <Card tone="muted" padding={18}>
                  <p style={{ ...TY.body, color: S.inkSecondary, margin: 0 }}>
                    Quizzes and assignments are marked inside the platform and count towards completion. On finishing the
                    required lessons and assessments you receive a <strong style={{ color: S.ink }}>{program.cert}</strong> from
                    Skylent. It records what you completed here — it is not an accredited or university-recognised
                    qualification, and it is not a guarantee of employment.
                  </p>
                </Card>
              </div>

              <div style={{ marginTop: 22 }}>
                <SectionHeading size="sm" title="Who teaches it" />
                {realFaculty.length ? (
                  <div className="sk-grid sk-grid-2">
                    {realFaculty.map(member => (
                      <Card key={member.name} padding={18}>
                        <div style={{ ...TY.h3, color: S.ink }}>{member.name}</div>
                        <div style={{ ...TY.bodySm, color: S.inkSecondary, marginTop: 4 }}>{member.role} · {member.expertise}</div>
                        {member.affiliation && <div style={{ ...TY.meta, color: S.inkMuted, marginTop: 4 }}>{member.affiliation}</div>}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    compact
                    title="Faculty not announced"
                    body="We have not confirmed named faculty for this programme, so we are not listing any."
                  />
                )}
              </div>
            </section>

            {/* Fees */}
            <section id="fees">
              <SectionHeading title="Fees" lead="One-time fees in Indian rupees. No hidden charges are added later." />
              <div className="sk-grid sk-grid-3 sk-price-grid">
                {program.pricing.map(tier => (
                  <Card
                    key={tier.name}
                    padding={20}
                    style={tier.highlight ? { borderColor: accent.line, boxShadow: `0 0 0 1px ${accent.line}` } : undefined}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ ...TY.h3, color: S.ink, fontFamily: 'var(--font-display)' }}>{tier.name}</span>
                      {tier.highlight && <Tag tone="accent">Most complete</Tag>}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: S.ink, letterSpacing: '-0.02em' }}>{formatInr(tier.price)}</div>
                    <ul className="sk-plain-list" style={{ marginTop: 14 }}>
                      {tier.features.map(feature => <li key={feature}>{feature}</li>)}
                    </ul>
                  </Card>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section id="faq">
              <SectionHeading title="Questions" />
              {program.faqs?.length ? (
                <div className="sk-accordion">
                  {program.faqs.map(faq => (
                    <details key={faq.q} className="sk-accordion-item sk-faq">
                      <summary>{faq.q}</summary>
                      <p>{faq.a}</p>
                    </details>
                  ))}
                </div>
              ) : (
                <EmptyState compact title="No questions published" body="Nothing has been written up for this programme yet." />
              )}
            </section>
          </div>

          <aside className="sk-detail-rail">
            <SummaryRail program={program} />
          </aside>
        </div>
      </Rail>

      <div className="sk-sticky-bar">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ ...TY.meta, color: S.inkMuted }}>{availability.label}</div>
          <div style={{ ...TY.bodySm, color: S.ink, fontWeight: 600 }}>
            {program.pricing.length ? `From ${formatInr(Math.min(...program.pricing.map(tier => tier.price)))}` : 'Fee on request'}
          </div>
        </div>
        <StickyCta program={program} />
      </div>
    </ProductShell>
  )
}

function StickyCta({ program }: { program: Program }) {
  const themeId = resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType)
  const availability = getProgrammeAvailability(program)
  const { startProgramEnrollment, enrolling } = useCatalogEnrollment()

  if (availability.canStartLearning) {
    return (
      <Button themeId={themeId} disabled={enrolling} onClick={() => startProgramEnrollment(program.slug)}>
        {enrolling ? 'Enrolling…' : availability.ctaLabel}
      </Button>
    )
  }
  return <ButtonLink to="/contact" themeId={themeId}>{availability.ctaLabel}</ButtonLink>
}
