import { useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import {
  ActionPanel,
  ComingSoonState,
  ContentRail,
  ContextHeader,
  NavList,
  ProductLayout,
  ProductTabs,
  ProgressPanel,
  WorkspaceBlock,
} from '../components/product-ui'
import {
  EXAM_LOOP,
  EXAM_WORKSPACE,
  OTHER_EXAMS_UNPUBLISHED,
  PUBLISHED_EXAMS,
  UNPUBLISHED_EXAMS,
  programsByType,
} from '../skylent-worlds'

const EXAM_TABS = [
  ...PUBLISHED_EXAMS.map((exam) => ({ id: exam.id, label: exam.name })),
  ...UNPUBLISHED_EXAMS.map((exam) => ({ id: exam.id, label: exam.name })),
  { id: 'other', label: 'Other exams' },
]

const ALL_EXAMS = [...PUBLISHED_EXAMS, ...UNPUBLISHED_EXAMS]

function examFromSearch(value: string | null, hash: string) {
  const fromHash = hash.replace('#', '')
  const candidate = value || fromHash
  if (EXAM_TABS.some((tab) => tab.id === candidate)) return candidate
  return 'jee'
}

function sectionFromSearch(value: string | null) {
  return EXAM_WORKSPACE.some((item) => item.id === value) ? value! : 'syllabus'
}

export default function ExamsPage() {
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const examId = examFromSearch(params.get('exam'), location.hash)
  const section = sectionFromSearch(params.get('section'))
  const examPrograms = programsByType('EXAM_PREP')
  const exam = ALL_EXAMS.find((item) => item.id === examId)
  const program = exam && 'slug' in exam && exam.slug
    ? examPrograms.find((item) => item.slug === exam.slug)
    : undefined

  function setExam(next: string) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('exam', next)
    if (next === 'other' || UNPUBLISHED_EXAMS.some((item) => item.id === next)) {
      nextParams.delete('section')
    } else if (!nextParams.get('section')) {
      nextParams.set('section', 'syllabus')
    }
    setParams(nextParams, { replace: true })
  }

  function setSection(next: string) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('exam', examId)
    nextParams.set('section', next)
    setParams(nextParams, { replace: true })
  }

  const workspaceCopy = useMemo(() => {
    if (!exam || !('published' in exam) || !exam.published) return null
    const subjectLine = exam.subjects.join(', ')
    const map: Record<string, { title: string; body: string; items: string[] }> = {
      syllabus: {
        title: 'Syllabus',
        body: `Subject coverage for ${exam.name}. This is the paper map, not a scoreboard.`,
        items: exam.subjects.map((subject) => `${subject} — published topic list lives in the programme.`),
      },
      preparation: {
        title: 'Preparation',
        body: `Study the ${exam.full} with the published programme. ${exam.target}.`,
        items: ['Follow the subject order in the programme', 'Use the curriculum modules as the weekly plan', subjectLine],
      },
      practice: {
        title: 'Practice',
        body: 'Timed questions and worked solutions are part of the programme. Attempts are not invented on this page.',
        items: ['Section practice after you enroll', 'Worked solutions after an attempt', 'No fabricated accuracy charts here'],
      },
      tests: {
        title: 'Tests',
        body: 'Section tests and full mocks exist inside the learning workspace after enrollment.',
        items: ['Section tests', 'Full mocks', 'Scores appear after you attempt them'],
      },
      review: {
        title: 'Review',
        body: 'Review is for mistakes you actually made — not a demo leaderboard.',
        items: ['Wrong-answer review', 'Topic gaps after tests', 'Re-attempt when the workspace unlocks it'],
      },
      progress: {
        title: 'Progress',
        body: 'Progress is personal and appears after work. This public page does not invent ranks.',
        items: EXAM_LOOP.map((step) => step),
      },
    }
    return map[section]
  }, [exam, section])

  const sidebar = examId !== 'other' && exam && exam.published ? (
    <div>
      <h2 className="product-filter-title">{exam.name} workspace</h2>
      <NavList
        items={EXAM_WORKSPACE.map((item) => ({ id: item.id, label: item.label }))}
        value={section}
        onChange={setSection}
      />
    </div>
  ) : (
    <div>
      <h2 className="product-filter-title">Exam selector</h2>
      <NavList
        items={EXAM_TABS}
        value={examId}
        onChange={setExam}
      />
    </div>
  )

  return (
    <WorldFrame world="exams">
      <ContentRail>
        <ContextHeader
          world="exams"
          eyebrow="Exams"
          title="Prepare for the exam you are actually taking."
          description="Select the paper, then work the loop: syllabus, practice, tests, review, and measurement. Ranks and result boards are not invented here."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Exams' }]}
          actions={<Link className="product-btn-ghost" to="/programs?type=EXAM_PREP">Exam programmes</Link>}
        />

        <div className="product-toolbar">
          <ProductTabs tabs={EXAM_TABS} value={examId} onChange={setExam} label="Exam selector" />
        </div>

        <ProductLayout sidebar={sidebar}>
          {exam && exam.published && (
            <div className="workspace-grid" id={exam.id} role="tabpanel" aria-labelledby={`tab-${exam.id}`}>
              <SectionLine name={exam.name} full={exam.full} target={exam.target} published />
              {workspaceCopy && (
                <WorkspaceBlock title={workspaceCopy.title}>
                  <p>{workspaceCopy.body}</p>
                  <ul>
                    {workspaceCopy.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </WorkspaceBlock>
              )}
              {program ? (
                <ActionPanel title={`${exam.name} programme`}>
                  <p className="panel-note" style={{ marginTop: 0 }}>{program.desc}</p>
                  <ProgrammeMetaLine duration={program.duration} format={program.format} />
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="product-btn" to={`/programs/${program.slug}`}>Open {exam.name} programme</Link>
                    <a className="product-btn-ghost" href="#assessment-note">Assessment</a>
                  </div>
                </ActionPanel>
              ) : (
                <ComingSoonState
                  title="Programme record missing"
                  description="This exam is marked published in navigation, but the programme is not in the catalogue."
                />
              )}
              <ProgressPanel
                steps={[...EXAM_LOOP]}
                note="The loop is the product. Numbers appear after you attempt tests in the learning workspace."
              />
              <p id="assessment-note" className="panel-note">
                Assessment stays inside the programme: practice, tests, and review. School board prep is in Schooling, not here.
              </p>
            </div>
          )}

          {exam && !exam.published && (
            <div id={exam.id}>
              <SectionLine name={exam.name} full={exam.full} target={exam.target} published={false} />
              <ComingSoonState
                title={`${exam.name} is not published`}
                description={`${exam.full}. Subjects (${exam.subjects.join(', ')}) are listed so the destination is honest — there is no syllabus product, mock series, or scoreboard here yet.`}
              />
            </div>
          )}

          {examId === 'other' && (
            <div id="other-exams">
              <ComingSoonState
                title="Other papers are not published"
                description={`${OTHER_EXAMS_UNPUBLISHED.join(', ')} are named so you can see the gap. There is no CUET, CLAT, GMAT, GRE, or UPSC product here yet.`}
              />
              <p className="panel-note">
                <Link to="/junior">Schooling</Link> is a different world from exam prep.
              </p>
            </div>
          )}
        </ProductLayout>
      </ContentRail>
    </WorldFrame>
  )
}

function SectionLine({
  name,
  full,
  target,
  published,
}: {
  name: string
  full: string
  target: string
  published: boolean
}) {
  return (
    <div className="product-section-head">
      <div>
        <h2>{name}</h2>
        <p>{full}. {target}. {published ? 'Published programme.' : 'Coming soon.'}</p>
      </div>
    </div>
  )
}

function ProgrammeMetaLine({ duration, format }: { duration: string; format: string }) {
  return <p className="programme-meta"><span>{duration}</span><span>{format}</span></p>
}
