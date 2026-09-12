import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import AnchorNav, { useActiveSection } from '../design/AnchorNav'
import { Rail, ButtonLink, StatusPill, Note } from '../design/primitives'
import { resolveAcademicStages, type ResolvedStage, type ResolvedStream } from '../lib/academic-streams'
import { getProgrammeAvailability } from '../lib/catalogue-status'
import { courses, programs } from '../data'
import '../design/education.css'

function EducationHeader({ stages }: { stages: ResolvedStage[] }) {
  const stagesOpen = stages.filter(stage => stage.openCount > 0)
  const openProgrammes = programs.filter(program => getProgrammeAvailability(program).canStartLearning).length
  const publishedCourses = courses.filter(course => course.modules.some(module => module.lessons.length > 0)).length

  return (
    <section className="sk-edu-hero">
      <Rail>
        <p className="sk-edu-kicker">Education</p>
        <h1>A map of academic study.</h1>
        <p className="sk-edu-lead">
          Schooling, degrees and entrance exams — mapped by stage of study, not mixed into the skills catalogue.
        </p>
        <Note tone="caution">
          Skylent is not a university. It does not award degrees and it is not accredited by any university or
          examination board.{' '}
          {stagesOpen.length === 0
            ? `Nothing in the ${stages.length} stages below is open to study yet.`
            : `Only ${stagesOpen.map(stage => stage.label.toLowerCase()).join(' and ')} has anything open to study.`}{' '}
          What is open today is professional and skills material: {openProgrammes}{' '}
          {openProgrammes === 1 ? 'programme' : 'programmes'} and {publishedCourses}{' '}
          {publishedCourses === 1 ? 'course' : 'courses'}.
        </Note>
        <div className="sk-edu-hero-actions">
          <ButtonLink to="/education#open-today" themeId="schooling">See what is open today</ButtonLink>
          <ButtonLink to="/contact" variant="secondary" themeId="schooling">Register interest</ButtonLink>
        </div>
      </Rail>
    </section>
  )
}

function StreamRow({ stream }: { stream: ResolvedStream }) {
  return (
    <li className="sk-edu-row">
      <div className="sk-edu-row-id">
        <strong>{stream.abbr}</strong>
        <span>{stream.name}</span>
      </div>
      <p>{stream.audience}</p>
      <div className="sk-edu-row-status">
        <StatusPill availability={stream.availability} size="sm" />
        <Link to={stream.href}>{stream.availability.ctaLabel} →</Link>
      </div>
    </li>
  )
}

const STAGE_STRUCTURE: Record<ResolvedStage['id'], string> = {
  schooling: 'Grade band → Subject → Chapter → Lesson → Practice',
  undergraduate: 'Degree → Year → Semester → Subject → Module',
  postgraduate: 'Programme → Term → Specialisation → Case → Project',
  'competitive-exams': 'Exam → Syllabus → Preparation → Practice → Tests',
}

function StageBlock({ stage }: { stage: ResolvedStage }) {
  return (
    <section id={stage.id} className={`sk-edu-block is-${stage.id}`}>
      <header>
        <span>{stage.numeral}</span>
        <div>
          <h2>{stage.label}</h2>
          <p>{stage.sub}</p>
        </div>
      </header>
      <p className="sk-edu-structure">{STAGE_STRUCTURE[stage.id]}</p>
      <p className="sk-edu-block-intro">{stage.intro}</p>
      <ul className="sk-edu-rows">
        {stage.streams.map(stream => (
          <StreamRow key={stream.id} stream={stream} />
        ))}
      </ul>
      {stage.id === 'competitive-exams' && (
        <p className="sk-edu-exam-note">
          JEE Advanced and CAT are the only entrance exams Skylent has programmes for.{' '}
          <Link to="/exams">Open the exams surface</Link> — no mocks, ranks or live batches are published.
        </p>
      )}
      {stage.id === 'schooling' && (
        <p className="sk-edu-exam-note">
          Junior is the age-aware schooling experience.{' '}
          <Link to="/junior">Open Junior</Link>. No grade-band lessons are published yet.
        </p>
      )}
      {stage.id === 'undergraduate' && (
        <p className="sk-edu-exam-note">
          Undergraduate is a degree pathway alongside university study. Skylent does not award the degree.{' '}
          <Link to="/degrees#undergraduate">Open undergraduate pathways</Link>.
        </p>
      )}
      {stage.id === 'postgraduate' && (
        <p className="sk-edu-exam-note">
          Postgraduate is specialisation, cases and projects — not undergraduate with different wording.{' '}
          <Link to="/degrees#postgraduate">Open postgraduate pathways</Link>.
        </p>
      )}
    </section>
  )
}

function OpenToday() {
  const openProgrammes = programs.filter(program => getProgrammeAvailability(program).canStartLearning)
  const publishedCourses = courses.filter(course => course.modules.some(module => module.lessons.length > 0))

  return (
    <section id="open-today" className="sk-edu-open">
      <Rail>
        <h2>Open in the learning platform today</h2>
        <p>
          None of it is a degree. These are professional and skills materials with published lessons.
        </p>
        <ul className="sk-edu-open-list">
          {openProgrammes.map(program => (
            <li key={program.slug}>
              <Link to={`/programs/${program.slug}`}>{program.name}</Link>
              <span>Programme · {program.duration}</span>
            </li>
          ))}
          {publishedCourses.map(course => (
            <li key={course.slug}>
              <Link to={`/courses/${course.slug}`}>{course.title}</Link>
              <span>Course · {course.duration}</span>
            </li>
          ))}
        </ul>
        <p className="sk-edu-open-more">
          <Link to="/programs">All programmes</Link>
          <Link to="/courses">All courses</Link>
        </p>
      </Rail>
    </section>
  )
}

export default function EducationPage() {
  const stages = useMemo(() => resolveAcademicStages(), [])
  const sections = useMemo(
    () => stages.map(stage => ({ id: stage.id, label: stage.label, themeId: stage.themeId })),
    [stages],
  )
  const active = useActiveSection(stages.map(stage => stage.id))

  return (
    <ProductShell className="sk-edu">
      <EducationHeader stages={stages} />
      <AnchorNav sections={sections} active={active} label="Academic stages" />
      <Rail>
        {stages.map(stage => (
          <StageBlock key={stage.id} stage={stage} />
        ))}
      </Rail>
      <OpenToday />
      <section className="sk-edu-inst">
        <Rail>
          <div className="sk-edu-inst-grid">
            <div>
              <p className="sk-edu-kicker">For schools and universities</p>
              <h2>Institutions would teach this coursework</h2>
              <p>
                Degree and school material would reach learners through a partner institution. None are live in the
                public catalogue. Skylent would provide dashboards for programmes, learners, faculty and progress.
              </p>
              <ButtonLink to="/institutions" variant="secondary">For institutions</ButtonLink>
            </div>
            <dl>
              <div>
                <dt>No degrees are awarded</dt>
                <dd>Skylent issues its own completion certificates. They are not university qualifications.</dd>
              </div>
              <div>
                <dt>No partner institutions are named</dt>
                <dd>No university or school partnership is published on this site.</dd>
              </div>
              <div>
                <dt>Academic coursework is unpublished</dt>
                <dd>Schooling, undergraduate and postgraduate material is not in the learning platform.</dd>
              </div>
            </dl>
          </div>
        </Rail>
      </section>
    </ProductShell>
  )
}
