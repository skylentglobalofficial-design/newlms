import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import {
  ActionPanel,
  AssessmentPanel,
  ComingSoonState,
  ContentRail,
  ContextHeader,
  EmptyState,
  FilterDrawer,
  FilterToggle,
  NavList,
  ProductLayout,
  ProductTabs,
  StickyActionBar,
  WorkspaceBlock,
} from '../components/product-ui'
import {
  EXAM_WORKSPACE,
  OTHER_EXAMS_UNPUBLISHED,
  PUBLISHED_EXAMS,
  UNPUBLISHED_EXAMS,
} from '../skylent-worlds'
import { programsByType } from '../lib/world-programs'

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
  const [filtersOpen, setFiltersOpen] = useState(false)
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
    setFiltersOpen(false)
  }

  function setSection(next: string) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('exam', examId)
    nextParams.set('section', next)
    setParams(nextParams, { replace: true })
    setFiltersOpen(false)
  }

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

  const enrollNote = program?.enrollmentStatus === 'coming_soon'
    ? 'Enrollment is not open yet. Register interest on the programme page.'
    : program?.enrollmentStatus === 'waitlist'
      ? 'Join the waitlist on the programme page.'
      : 'Enroll from the programme page, then practise and sit tests in the learning workspace.'

  return (
    <WorldFrame world="exams">
      <ContentRail>
        <ContextHeader
          world="exams"
          eyebrow="Exams"
          title="Prepare for the exam you are taking."
          description="Pick the paper, then work syllabus, preparation, practice, tests, and review. Scores appear after you attempt work — not here."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Exams' }]}
          actions={<Link className="product-btn-ghost" to="/programs?type=EXAM_PREP">Exam programmes</Link>}
        />

        <div className="product-toolbar">
          {exam?.published ? <FilterToggle open={filtersOpen} onClick={() => setFiltersOpen(true)} /> : null}
          <ProductTabs tabs={EXAM_TABS} value={examId} onChange={setExam} label="Exam selector" />
        </div>

        <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title={`${exam?.name ?? 'Exam'} workspace`}>
          {sidebar}
        </FilterDrawer>

        <ProductLayout sidebar={sidebar}>
          {exam && exam.published && (
            <div className="workspace-grid" id={`panel-${exam.id}`} role="tabpanel" aria-labelledby={`tab-${exam.id}`}>
              <SectionLine name={exam.name} full={exam.full} target={exam.target} published />
              <p className="panel-note" style={{ marginTop: 0 }}>
                Now: {section === 'syllabus' ? 'read the published syllabus' : `work ${section}`}. Next: {program ? `open the ${exam.name} programme` : 'wait until a programme is published'}.
              </p>

              {section === 'syllabus' && (
                <WorkspaceBlock title="Syllabus">
                  {program?.curriculumDetail?.length ? (
                    <ul>
                      {program.curriculumDetail.map((module) => (
                        <li key={module.number} id={`module-${module.number}`}>
                          <strong>{module.title}</strong>
                          {module.topics?.length ? ` — ${module.topics.join(', ')}` : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul>
                      {exam.subjects.map((subject) => <li key={subject}>{subject}</li>)}
                    </ul>
                  )}
                </WorkspaceBlock>
              )}

              {section === 'preparation' && (
                <WorkspaceBlock title="Preparation">
                  <p>{exam.full}. {exam.target}.</p>
                  {program?.whatYouWillLearn?.length ? (
                    <ul>
                      {program.whatYouWillLearn.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : (
                    <p>Preparation detail lives in the programme when it is published.</p>
                  )}
                </WorkspaceBlock>
              )}

              {section === 'practice' && (
                <WorkspaceBlock title="Practice">
                  {(() => {
                    const items = (program?.learningExperience ?? []).filter((item) => /practice|sets|doubt|weekly/i.test(item))
                    return items.length ? (
                      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
                    ) : (
                      <p>Practice sets open after enrollment. Attempts are not invented on this page.</p>
                    )
                  })()}
                  <p className="panel-note">No accuracy charts until you attempt work in the learning workspace.</p>
                </WorkspaceBlock>
              )}

              {section === 'tests' && (
                <>
                  {program?.examPattern ? (
                    <AssessmentPanel
                      title="Tests"
                      items={[
                        { title: 'Paper pattern', detail: program.examPattern },
                        ...(program.learningExperience ?? [])
                          .filter((item) => /test|mock/i.test(item))
                          .map((item) => ({ title: 'Included', detail: item })),
                      ]}
                    />
                  ) : (
                    <EmptyState title="No test series published" description="Section tests and mocks appear with the programme." />
                  )}
                </>
              )}

              {section === 'review' && (
                <EmptyState
                  title="Review after attempts"
                  description="Wrong-answer review and topic gaps appear after you sit tests in the learning workspace. This page does not invent a leaderboard."
                />
              )}

              {section === 'progress' && (
                <EmptyState
                  title="No attempts yet"
                  description="Progress is personal. Ranks, percentiles, and streaks appear after you enroll and take tests — not as demo numbers here."
                />
              )}

              {program ? (
                <ActionPanel title={`${exam.name} programme`}>
                  <p className="panel-note" style={{ marginTop: 0 }}>{program.desc}</p>
                  <p className="programme-meta"><span>{program.duration}</span><span>{program.format}</span></p>
                  <p className="panel-note">{enrollNote}</p>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="product-btn" to={`/programs/${program.slug}`}>Open {exam.name} programme</Link>
                    <Link className="product-btn-ghost" to={`/programs/${program.slug}#assessment`}>Assessment</Link>
                  </div>
                </ActionPanel>
              ) : (
                <ComingSoonState
                  title="Programme record missing"
                  description="This exam is marked published in navigation, but the programme is not in the catalogue."
                />
              )}
            </div>
          )}

          {exam && !exam.published && (
            <div id={`panel-${exam.id}`} role="tabpanel" aria-labelledby={`tab-${exam.id}`}>
              <SectionLine name={exam.name} full={exam.full} target={exam.target} published={false} />
              <ComingSoonState
                title={`${exam.name} is not published`}
                description={`${exam.full}. Subjects (${exam.subjects.join(', ')}) are listed so the destination is honest — there is no syllabus product, mock series, or scoreboard here yet.`}
              />
            </div>
          )}

          {examId === 'other' && (
            <div id="panel-other" role="tabpanel" aria-labelledby="tab-other">
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

        {program ? (
          <StickyActionBar>
            <span>{exam?.name} programme</span>
            <Link className="product-btn" to={`/programs/${program.slug}`}>Open programme</Link>
          </StickyActionBar>
        ) : null}
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
