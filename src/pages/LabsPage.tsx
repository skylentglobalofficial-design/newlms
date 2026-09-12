import { Link, useSearchParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, StatusPill, Note, Tag, EmptyState } from '../design/primitives'
import { S, TY } from '../design/tokens'
import { courses, programs } from '../data'
import {
  INTERACTIVE_LABS,
  archivedBriefSubjects,
  emptySubjectLabCopy,
  interactiveLabAvailability,
  labGroupingLabel,
  labsForCourse,
  labsForDomain,
  labsForProgram,
  practiceBriefsMatchingDomains,
  practiceBriefSubjects,
  type LabDomain,
  type VirtualLab,
} from '../lib/virtual-labs'
import { domainsForCourse, domainsForProgram, LAB_DOMAIN_LABEL } from '../lib/lab-domains'
import { labRunPath } from '../lib/safe-return'
import '../design/labs.css'

const SUBJECT_CHIPS: { domain: LabDomain; label: string }[] = [
  { domain: 'python', label: 'Python' },
  { domain: 'excel', label: 'Excel' },
  { domain: 'sql', label: 'SQL' },
  { domain: 'html', label: 'HTML & CSS' },
  { domain: 'ml', label: 'Machine learning' },
]

function isDomain(value: string | null): value is LabDomain {
  return SUBJECT_CHIPS.some(chip => chip.domain === value)
}

export default function LabsPage() {
  const [params, setParams] = useSearchParams()
  const courseSlug = params.get('course')
  const programSlug = params.get('program')
  const domainParam = params.get('domain')
  const domainFilter = isDomain(domainParam) ? domainParam : null

  const course = courseSlug ? courses.find(item => item.slug === courseSlug) : undefined
  const program = programSlug ? programs.find(item => item.slug === programSlug) : undefined

  let interactive: VirtualLab[] = INTERACTIVE_LABS
  let practice = practiceBriefSubjects()
  let contextLabel = 'all subjects'
  let filterActive = false

  if (course) {
    interactive = labsForCourse(course.slug)
    practice = practiceBriefsMatchingDomains(domainsForCourse(course))
    contextLabel = course.title
    filterActive = true
  } else if (program) {
    interactive = labsForProgram(program.slug)
    practice = practiceBriefsMatchingDomains(domainsForProgram(program))
    contextLabel = program.name
    filterActive = true
  } else if (domainFilter) {
    interactive = labsForDomain(domainFilter)
    practice = practiceBriefsMatchingDomains([domainFilter])
    contextLabel = LAB_DOMAIN_LABEL[domainFilter]
    filterActive = true
  }

  const archived = filterActive ? [] : archivedBriefSubjects()
  const catalogueFrom = course
    ? `/labs?course=${course.slug}`
    : program
      ? `/labs?program=${program.slug}`
      : domainFilter
        ? `/labs?domain=${domainFilter}`
        : '/labs'

  function setFilter(next: { course?: string; program?: string; domain?: string }) {
    const nextParams = new URLSearchParams()
    if (next.course) nextParams.set('course', next.course)
    if (next.program) nextParams.set('program', next.program)
    if (next.domain) nextParams.set('domain', next.domain)
    setParams(nextParams, { replace: true })
  }

  return (
    <ProductShell className="sk-labs">
      <Rail>
        <div className="sk-lab-hero">
          <p className="sk-eyebrow">Virtual labs</p>
          <h1>Practice the subject you are studying.</h1>
          <p>
            Labs follow the course and module in front of you. A Python lesson opens a Python experiment — not HTML,
            not a classifier you have not reached yet. Live classes are not part of this yet.
          </p>
        </div>

        <Note>
          Each interactive lab runs in your browser. They are not a Python interpreter, a SQL database, or Microsoft
          Excel. Older briefs are written exercises with a simulated workspace — they are not degree programmes.
        </Note>

        <div className="sk-lab-filters" role="group" aria-label="Filter labs by subject">
          <button
            type="button"
            className={`sk-lab-filter${!filterActive ? ' is-on' : ''}`}
            onClick={() => setFilter({})}
          >
            All subjects
          </button>
          {SUBJECT_CHIPS.map(chip => (
            <button
              key={chip.domain}
              type="button"
              className={`sk-lab-filter${domainFilter === chip.domain && !course && !program ? ' is-on' : ''}`}
              onClick={() => setFilter({ domain: chip.domain })}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {course && (
          <p className="sk-lab-context">
            Showing labs that match <strong>{course.title}</strong>.{' '}
            <Link to={`/courses/${course.slug}`}>Open the course</Link>
            {' · '}
            <button type="button" className="sk-inline-link" onClick={() => setFilter({})}>Clear</button>
          </p>
        )}
        {program && !course && (
          <p className="sk-lab-context">
            Showing labs that match <strong>{program.name}</strong>.{' '}
            <Link to={`/programs/${program.slug}`}>Open the programme</Link>
            {' · '}
            <button type="button" className="sk-inline-link" onClick={() => setFilter({})}>Clear</button>
          </p>
        )}

        <section style={{ marginTop: 32 }}>
          <h2 style={{ ...TY.h2, fontFamily: 'var(--font-display)', margin: '0 0 14px' }}>
            {filterActive ? `Interactive now · ${contextLabel}` : 'Interactive now'}
          </h2>
          {interactive.length === 0 ? (
            <EmptyState
              title="No lab for this subject"
              body={emptySubjectLabCopy(contextLabel)}
            />
          ) : (
            <div className="sk-lab-grid">
              {interactive.map(lab => {
                const availability = interactiveLabAvailability(lab)
                return (
                  <Link key={lab.id} to={labRunPath(lab.id, catalogueFrom)} className="sk-lab-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <Tag>{lab.subject}</Tag>
                      <StatusPill availability={availability} size="sm" />
                    </div>
                    <h2>{lab.title}</h2>
                    <p>{lab.objective}</p>
                    <span className="sk-lab-card-meta">{lab.duration} · {lab.kind}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ ...TY.h2, fontFamily: 'var(--font-display)', margin: '0 0 8px' }}>Practice briefs</h2>
          <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '0 0 16px', maxWidth: '62ch' }}>
            Structured exercises from the existing lab catalogue, shown only when they match this subject. Opening one
            still requires sign-in. Output you see there is a walkthrough, not code executed on a server.
          </p>
          {practice.length === 0 ? (
            <EmptyState
              title="No practice briefs"
              body={filterActive ? emptySubjectLabCopy(contextLabel) : 'Nothing in this grouping is published.'}
            />
          ) : (
            <div className="sk-lab-grid">
              {practice.map(subject => (
                <Link key={subject.id} to={`/labs/${subject.id}`} className="sk-lab-card">
                  <Tag>{labGroupingLabel(subject.program)}</Tag>
                  <h2>{subject.title}</h2>
                  <p>{subject.desc}</p>
                  <span className="sk-lab-card-meta">
                    {subject.experiments.length} experiments · simulated workspace
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {archived.length > 0 && (
          <section style={{ paddingBottom: 72 }}>
            <h2 style={{ ...TY.h2, fontFamily: 'var(--font-display)', margin: '0 0 8px' }}>Archived academic briefs</h2>
            <p style={{ ...TY.bodySm, color: S.inkMuted, margin: '0 0 16px', maxWidth: '62ch' }}>
              These outlines used degree-style labels (MBA, BCA, MCA). They are not Skylent degrees and they are
              not matched to live courses. Kept here so the exercises are not silently deleted.
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: S.inkSecondary, fontSize: 14, lineHeight: 1.7 }}>
              {archived.map(subject => (
                <li key={subject.id}>
                  <Link to={`/labs/${subject.id}`} style={{ color: 'inherit', fontWeight: 600 }}>
                    {subject.title}
                  </Link>
                  {' — '}{subject.experiments.length} experiments · {labGroupingLabel(subject.program)}
                </li>
              ))}
            </ul>
          </section>
        )}
      </Rail>
    </ProductShell>
  )
}
