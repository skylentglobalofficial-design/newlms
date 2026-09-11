import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { EnrollmentModal, PageShell } from '../components/shared'
import { Button } from '../components/ui'
import { resolveAuroraTheme, getDomainAccent, type AuroraThemeId } from '../aurora-themes'
import {
  AssessmentPanel,
  ContentRail,
  ContextHeader,
  CurriculumNav,
  EmptyState,
  ProductLayout,
  StickyActionBar,
} from '../components/product-ui'
import { programs } from '../data'
import type { ProgramType, EnrollmentStatus } from '../data'
import { isProgramEnrollable } from '../lib/catalog-api'
import { useCatalogProgram } from '../hooks/useCatalog'
import { worldForProgramType } from '../skylent-worlds'

const TYPE_LABELS: Record<ProgramType, string> = {
  PROFESSIONAL: 'Professional programme',
  CERTIFICATE: 'Certificate',
  WEBINAR: 'Webinar',
  EXAM_PREP: 'Exam preparation',
  SCHOOLING: 'Schooling',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
}

const CTA_LABEL: Record<EnrollmentStatus, string> = {
  open: 'Enroll Now',
  waitlist: 'Join Waitlist',
  coming_soon: 'Register Interest',
}

function programEnrollmentCtaLabel({
  catalogLoading,
  enrollable,
  status,
  programType,
  surface,
}: {
  catalogLoading: boolean
  enrollable: boolean
  status: EnrollmentStatus
  programType: ProgramType
  surface: 'primary' | 'panel'
}): string {
  if (catalogLoading) return 'Checking availability…'
  if (enrollable) return programType === 'PROFESSIONAL' ? 'Apply Now' : CTA_LABEL.open
  if (surface === 'panel') {
    if (status === 'coming_soon') return 'Launching soon'
    if (status === 'waitlist') return 'Join waitlist'
    return 'Enrollment not available yet'
  }
  if (status === 'waitlist') return CTA_LABEL.waitlist
  if (status === 'coming_soon') return CTA_LABEL.coming_soon
  return 'Enrollment unavailable'
}

function programPathway(type: ProgramType): string[] {
  if (type === 'EXAM_PREP') return ['Syllabus', 'Preparation', 'Practice', 'Tests', 'Assessment', 'Admissions path']
  if (type === 'SCHOOLING') return ['Grade', 'Subject', 'Concept', 'Activity', 'Assessment']
  if (type === 'UNDERGRADUATE') return ['Degree', 'Curriculum', 'Labs', 'Projects', 'Internships', 'Progression']
  if (type === 'POSTGRADUATE') return ['Specialisation', 'Coursework', 'Research', 'Capstone', 'Faculty', 'Pathways']
  return ['Skills', 'Curriculum', 'Projects', 'Practice', 'Evidence', 'Career relevance']
}

function PdpBlock({
  id,
  title,
  children,
}: {
  id?: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="pdp-block">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function EnrollmentPanel({
  program, status, ctaLabel, onCTA, lowestPrice, multipleTiers, enrollable, catalogLoading,
}: {
  program: NonNullable<ReturnType<typeof programs.find>>
  status: EnrollmentStatus
  ctaLabel: string
  onCTA: () => void
  accent: ReturnType<typeof getDomainAccent>
  lowestPrice: number
  multipleTiers: boolean
  enrollable: boolean
  catalogLoading: boolean
}) {
  return (
    <div>
      <h2 className="product-filter-title">Programme summary</h2>
      <p style={{ margin: '0 0 8px', fontSize: '1.45rem', fontWeight: 750, letterSpacing: '-0.03em' }}>
        ₹{lowestPrice.toLocaleString('en-IN')}
      </p>
      {multipleTiers && <p className="panel-note" style={{ marginTop: 0 }}>Plans compared below</p>}
      <ul className="assessment-list">
        <li><strong>{status === 'coming_soon' ? 'Planned' : 'Next batch'}</strong><span className="product-count">{program.upcomingBatch}</span></li>
        <li><strong>Duration</strong><span className="product-count">{program.duration}</span></li>
        <li><strong>Format</strong><span className="product-count">{program.format}</span></li>
        <li><strong>Level</strong><span className="product-count">{program.level}</span></li>
        <li><strong>Credential</strong><span className="product-count">{program.cert}</span></li>
        {program.careerSupport ? <li><strong>Career OS</strong><span className="product-count">Unlocks on completion</span></li> : null}
      </ul>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        <Button
          variant="primary"
          full
          themeId={resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType)}
          onClick={catalogLoading ? undefined : onCTA}
          style={catalogLoading ? { opacity: 0.72, cursor: 'not-allowed' } : undefined}
        >
          {catalogLoading ? ctaLabel : enrollable ? `${ctaLabel} →` : ctaLabel}
        </Button>
        <Link to="/contact" className="product-btn-ghost">Talk to an advisor</Link>
      </div>
      <p className="panel-note">Enrollment follows the live catalogue. Assessment is part of the programme, not a footer.</p>
    </div>
  )
}

export default function ProgramPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const program = programs.find((item) => item.slug === slug)
  const catalog = useCatalogProgram(slug)

  const [curriculumOpen, setCurriculumOpen] = useState<string | null>(null)
  const [faqOpen, setFaqOpen] = useState<string | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  const isExamPrep = program?.programType === 'EXAM_PREP'
  const isCareerOS = !!program?.careerSupport
  const enrollStatus = (catalog.data?.enrollmentStatus ?? program?.enrollmentStatus ?? 'open') as EnrollmentStatus
  const catalogLoading = catalog.loading
  const enrollable = Boolean(catalog.data && isProgramEnrollable(catalog.data))
  const projectCount = catalog.data?.projectCount ?? program?.projects ?? 0
  const pricingTiers = catalog.data?.pricing.length ? catalog.data.pricing : (program?.pricing ?? [])
  const lowestPrice = pricingTiers.length ? Math.min(...pricingTiers.map((tier) => tier.price)) : 0
  const typeLabel = program ? TYPE_LABELS[program.programType] : ''
  const ctaLabel = program
    ? programEnrollmentCtaLabel({ catalogLoading, enrollable, status: enrollStatus, programType: program.programType, surface: 'primary' })
    : ''
  const panelCtaLabel = program
    ? programEnrollmentCtaLabel({ catalogLoading, enrollable, status: enrollStatus, programType: program.programType, surface: 'panel' })
    : ''
  const auroraTheme: AuroraThemeId = program ? resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType) : 'general'
  const domainAccent = getDomainAccent(auroraTheme)

  const navSections = program ? [
    { id: 'overview', label: 'Overview' },
    { id: 'who', label: isExamPrep ? 'Who it is for' : 'Who it is for' },
    { id: 'assessment', label: 'Assessment' },
    ...(program.curriculumDetail?.length ? [{ id: 'curriculum', label: isExamPrep ? 'Syllabus' : 'Curriculum' }] : []),
    ...(program.projectsDetail?.length ? [{ id: 'projects', label: isExamPrep ? 'Practice' : 'Projects' }] : []),
    ...(program.learningExperience?.length ? [{ id: 'experience', label: isExamPrep ? 'Preparation' : 'Learning' }] : []),
    ...(isCareerOS ? [{ id: 'career', label: 'Career' }] : []),
    ...(program.faqs?.length ? [{ id: 'faq', label: 'FAQ' }] : []),
    { id: 'pricing', label: 'Fees' },
  ] : []

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    navSections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(section.id) },
        { rootMargin: '-20% 0px -68% 0px', threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((obs) => obs.disconnect())
  }, [program?.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!program) {
    return (
      <PageShell>
        <div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
          <div>
            <h1 className="product-title">Programme not found</h1>
            <Button variant="primary" onClick={() => navigate('/programs')} style={{ marginTop: 16 }}>All programmes</Button>
          </div>
        </div>
      </PageShell>
    )
  }

  const highlightTier = pricingTiers.find((tier) => tier.highlight) ?? pricingTiers[0]
  const world = worldForProgramType(program.programType)
  const pathway = programPathway(program.programType)
  const assessmentItems = isExamPrep
    ? [
        { title: 'Topic drills', detail: 'Practice against the syllabus, then mark what you missed.' },
        { title: 'Section tests', detail: 'Timed papers by subject. Scores appear after you sit them.' },
        { title: 'Full mocks', detail: 'Complete attempts with review — nothing is invented on this page.' },
        { title: 'Admissions path', detail: 'This prepares you for the paper. It is not an admissions guarantee.' },
      ]
    : [
        { title: 'Module checks', detail: 'Short assessments after each unit of work.' },
        { title: 'Projects', detail: projectCount ? `${projectCount} assessed project${projectCount === 1 ? '' : 's'} you can show.` : 'Project work as published in the curriculum.' },
        { title: 'Practice', detail: 'Tools and problems under constraint, inside the programme.' },
        { title: 'Credential', detail: program.cert },
      ]

  function openEnroll() {
    if (!catalogLoading) setApplyOpen(true)
  }

  return (
    <PageShell aurora={false} auroraTheme={auroraTheme}>
      <div className="product-shell program-pdp" data-world={world}>
        <ContentRail>
          <ContextHeader
            world={world}
            eyebrow={typeLabel}
            title={program.name}
            description={program.desc}
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Programmes', href: '/programs' },
              { label: program.name },
            ]}
            actions={
              <>
                <Button variant="primary" themeId={auroraTheme} onClick={openEnroll} style={catalogLoading ? { opacity: 0.72, cursor: 'not-allowed' } : undefined}>{ctaLabel}</Button>
                <Button variant="secondary" onClick={() => {
                  const el = document.getElementById(program.curriculumDetail?.length ? 'curriculum' : 'assessment')
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}>
                  {isExamPrep ? 'View syllabus' : 'View curriculum'}
                </Button>
              </>
            }
          />

          <p className="programme-meta" style={{ marginTop: -8, marginBottom: 16 }}>
            <span>{program.level}</span>
            <span>{program.duration}</span>
            <span>{program.format}</span>
            {isCareerOS ? <span>Career OS</span> : null}
            {enrollStatus === 'coming_soon' ? <span>Coming soon</span> : null}
          </p>

          <nav className="product-tabs" aria-label="On this page" style={{ marginBottom: 18 }}>
            {navSections.map((section) => (
              <button
                key={section.id}
                type="button"
                aria-current={activeSection === section.id ? 'location' : undefined}
                onClick={() => {
                  const el = document.getElementById(section.id)
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <ProductLayout
            variant="pdp"
            sidebar={
              <EnrollmentPanel
                program={program}
                status={enrollStatus}
                ctaLabel={panelCtaLabel}
                onCTA={openEnroll}
                accent={domainAccent}
                lowestPrice={lowestPrice}
                multipleTiers={pricingTiers.length > 1}
                enrollable={enrollable}
                catalogLoading={catalogLoading}
              />
            }
          >
            <div className="pdp-main">
              <PdpBlock id="overview" title={isExamPrep ? 'What this preparation is' : 'What this is'}>
                <p>{program.desc}</p>
                <p><strong>Outcome: </strong>{program.outcome}</p>
                <p className="programme-meta">{pathway.map((step) => <span key={step}>{step}</span>)}</p>
              </PdpBlock>

              {program.whoIsItFor?.length ? (
                <PdpBlock id="who" title="Who it is for">
                  <ul>
                    {program.whoIsItFor.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </PdpBlock>
              ) : null}

              {program.whatYouWillLearn?.length ? (
                <PdpBlock title={isExamPrep ? 'What you will cover' : 'Skills you will build'}>
                  <ul>
                    {program.whatYouWillLearn.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </PdpBlock>
              ) : null}

              <div id="assessment">
                <AssessmentPanel
                  title="Assessment"
                  items={assessmentItems}
                />
              </div>

              {program.curriculumDetail?.length ? (
                <PdpBlock id="curriculum" title={isExamPrep ? 'Syllabus' : 'Curriculum'}>
                  {isExamPrep && program.examSections?.length ? (
                    <p className="programme-meta">{program.examSections.map((section) => <span key={section}>{section}</span>)}</p>
                  ) : null}
                  <CurriculumNav
                    items={program.curriculumDetail.map((mod) => ({ id: mod.number, label: mod.title, meta: mod.duration }))}
                    current={curriculumOpen ?? undefined}
                  />
                  <div style={{ marginTop: 12 }}>
                    {program.curriculumDetail.map((mod) => {
                      const open = curriculumOpen === mod.number
                      return (
                        <div key={mod.number} id={`module-${mod.number}`} className="workspace-block" style={{ marginBottom: 8 }}>
                          <button
                            type="button"
                            onClick={() => setCurriculumOpen(open ? null : mod.number)}
                            aria-expanded={open}
                            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 12, background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
                          >
                            <strong>{mod.number}. {mod.title}</strong>
                            <span className="product-count">{mod.duration}</span>
                          </button>
                          {open ? (
                            <>
                              <p>{mod.description}</p>
                              {mod.topics?.length ? <p className="programme-meta">{mod.topics.map((topic) => <span key={topic}>{topic}</span>)}</p> : null}
                            </>
                          ) : <p>{mod.description}</p>}
                        </div>
                      )
                    })}
                  </div>
                </PdpBlock>
              ) : null}

              {program.projectsDetail?.length ? (
                <PdpBlock id="projects" title={isExamPrep ? 'Practice' : 'Projects'}>
                  <ul className="assessment-list">
                    {program.projectsDetail.map((project) => (
                      <li key={project.title}>
                        <strong>{project.title}</strong>
                        <span className="product-count">{project.difficulty} · {project.what}</span>
                      </li>
                    ))}
                  </ul>
                </PdpBlock>
              ) : null}

              {program.learningExperience?.length ? (
                <PdpBlock id="experience" title={isExamPrep ? 'How preparation is structured' : 'How it is taught'}>
                  <ul>
                    {program.learningExperience.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </PdpBlock>
              ) : null}

              {isCareerOS ? (
                <PdpBlock id="career" title="Career relevance">
                  <p>Completing this programme unlocks Career OS so you can turn coursework into applications. No placement numbers are published here.</p>
                  <p><Link to="/career">Open Career</Link></p>
                </PdpBlock>
              ) : null}

              {program.faculty?.length ? (
                <PdpBlock title={isExamPrep ? 'Subject experts' : 'Faculty'}>
                  {program.faculty.some((person) => person.placeholder) ? (
                    <EmptyState title="Faculty profiles not published yet" description="Names appear when enrollment is open. Placeholder faculty are not shown as real people." />
                  ) : (
                    <ul className="assessment-list">
                      {program.faculty.map((person) => (
                        <li key={person.name}>
                          <strong>{person.name}</strong>
                          <span className="product-count">{person.role} · {person.expertise}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </PdpBlock>
              ) : null}

              {program.faqs?.length ? (
                <PdpBlock id="faq" title="FAQ">
                  {program.faqs.map((faq) => {
                    const open = faqOpen === faq.q
                    return (
                      <div key={faq.q} style={{ borderBottom: '1px solid var(--product-line)' }}>
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setFaqOpen(open ? null : faq.q)}
                          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
                        >
                          <strong>{faq.q}</strong>
                          <span aria-hidden="true">{open ? '−' : '+'}</span>
                        </button>
                        {open ? <p>{faq.a}</p> : null}
                      </div>
                    )
                  })}
                </PdpBlock>
              ) : null}

              <PdpBlock id="pricing" title="Fees">
                <div className="program-pricing-wrap" style={{ overflowX: 'auto' }}>
                  <table className="product-table">
                    <thead>
                      <tr>
                        <th>Plan</th>
                        {pricingTiers.map((tier) => <th key={tier.name}>{tier.name}{tier.highlight ? ' · recommended' : ''}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Price</td>
                        {pricingTiers.map((tier) => <td key={tier.name}>₹{tier.price.toLocaleString('en-IN')}</td>)}
                      </tr>
                      {Array.from(new Set(pricingTiers.flatMap((tier) => tier.features))).map((feature) => (
                        <tr key={feature}>
                          <td>{feature}</td>
                          {pricingTiers.map((tier) => (
                            <td key={tier.name}>{tier.features.includes(feature) ? 'Yes' : '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Button variant="primary" onClick={openEnroll}>{ctaLabel}</Button>
                </div>
              </PdpBlock>
            </div>
          </ProductLayout>
        </ContentRail>

        <StickyActionBar>
          <div>
            <strong>{program.name}</strong>
            <div className="panel-note" style={{ margin: 0 }}>₹{lowestPrice.toLocaleString('en-IN')} · {program.duration}</div>
          </div>
          <button type="button" className="product-btn" disabled={catalogLoading} onClick={openEnroll}>
            {ctaLabel}
          </button>
        </StickyActionBar>

        {applyOpen && (
          <EnrollmentModal
            item={{
              kind: 'program',
              slug: program.slug,
              title: program.name,
              price: highlightTier.price,
              enrollmentStatus: enrollStatus,
              enrollable,
              linkedCourseSlugs: catalog.data?.linkedCourseSlugs ?? [],
            }}
            themeId={auroraTheme}
            onClose={() => setApplyOpen(false)}
          />
        )}
      </div>
    </PageShell>
  )
}
