import { C, FadeIn } from '../shared'
import { T } from '../ui'
import type { ExamProgramOverview } from '../../api/exams'
import { EX, examMonoLabel, examSectionHead } from '../exams/examStyles'
import { WorkflowMap } from '../contextual/WorkflowMap'
import { VS } from '../../lib/visualSystem'

function Section({ id, eyebrow, title, children, bg = VS.pageBg }: { id?: string; eyebrow: string; title: string; children: React.ReactNode; bg?: string }) {
  return (
    <section id={id} style={{ background: bg, padding: EX.sectionPad, color: VS.textPrimary }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
        <FadeIn>
          <div style={examMonoLabel('dark')}>{eyebrow}</div>
          <h2 style={{ ...examSectionHead('dark'), marginBottom: 24 }}>{title}</h2>
        </FadeIn>
        {children}
      </div>
    </section>
  )
}

export function NeetFlagshipSections({ overview }: { overview: ExamProgramOverview }) {
  const subjects = overview.sections.length > 0
    ? overview.sections.map(s => s.name)
    : ['Biology', 'Chemistry', 'Physics']

  return (
    <>
      <Section id="exam-workflow" eyebrow="Preparation journey" title="Read → Practice → Revise → Test">
        <WorkflowMap
          label="NEET preparation path"
          steps={[
            { label: 'Read', detail: 'Structured topic notes and diagrams' },
            { label: 'Practice', detail: 'Topic question banks' },
            { label: 'Revise', detail: 'Flagged concepts and flash review' },
            { label: 'Test', detail: 'Timed subject tests' },
            { label: 'Mock', detail: 'Full exam simulations' },
            { label: 'Analyse', detail: 'Review mistakes and weak topics' },
          ]}
          accent="#059669"
        />
      </Section>

      <Section id="sections" eyebrow="Subject structure" title="Biology · Chemistry · Physics" bg={VS.surface}>
        <div className="flagship-subject-rows">
          {subjects.map((subject, i) => {
            const section = overview.sections[i]
            return (
              <div key={subject} className="flagship-subject-row">
                <div className="flagship-subject-index">{String(i + 1).padStart(2, '0')}</div>
                <div className="flagship-subject-main">
                  <div className="flagship-subject-name">{subject}</div>
                  {section && (
                    <div className="flagship-subject-meta">
                      {section.topicCount} topics · {section.practiceCount} practice · {section.testCount} tests · {section.mockCount} mocks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section id="curriculum-map" eyebrow="Curriculum map" title="Topics and revision path">
        {overview.topics.length === 0 ? (
          <p style={{ color: VS.textSecondary, fontSize: 14 }}>Topic structure publishes with the curriculum. Enroll to access the full subject tree.</p>
        ) : (
          <div className="sn-curriculum-map">
            {overview.topics.slice(0, 12).map(topic => (
              <div key={topic.id} className="sn-curriculum-row">
                <div className="sn-curriculum-index">{topic.sectionCode.slice(0, 3)}</div>
                <div className="sn-curriculum-main">
                  <div className="sn-curriculum-title">{topic.title}</div>
                  <div className="sn-curriculum-topics">{topic.sectionName}</div>
                </div>
                <div className="sn-curriculum-duration">{topic.practiceCount}P · {topic.testCount}T · {topic.mockCount}M</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section id="tests" eyebrow="Mocks & tests" title="Practice and full simulations" bg={VS.surface}>
        <div className="flagship-assessment-rows">
          {overview.assessments.filter(a => a.examMode === 'MOCK' || a.examMode === 'TEST' || a.examMode === 'PRACTICE').slice(0, 8).map(item => (
            <div key={item.id} className="flagship-assessment-row">
              <span className="flagship-assessment-mode">{item.examMode}</span>
              <span className="flagship-assessment-title">{item.title}</span>
            </div>
          ))}
          {overview.assessments.length === 0 && (
            <p style={{ color: VS.textSecondary, fontSize: 14 }}>Published practice and mock nodes appear when curriculum content is live.</p>
          )}
        </div>
      </Section>

      <Section id="performance" eyebrow="Analysis" title="Performance from your attempts">
        <div className="flagship-performance-empty">
          <p style={{ color: VS.textSecondary, fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            Attempt history, section accuracy, and revision queues populate from your logged practice and mock submissions. This page does not show fabricated admission rates, ranks, or percentiles.
          </p>
        </div>
      </Section>
    </>
  )
}
