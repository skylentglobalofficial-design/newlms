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

export function CatFlagshipSections({ overview }: { overview: ExamProgramOverview }) {
  const sections = overview.sections.length > 0
    ? overview.sections.map(s => s.name)
    : ['VARC', 'DILR', 'QA']

  return (
    <>
      <Section id="exam-workflow" eyebrow="Preparation journey" title="Fundamentals → Mocks → Analysis">
        <WorkflowMap
          label="CAT preparation path"
          steps={[
            { label: 'Fundamentals', detail: 'Core concepts per section' },
            { label: 'Section drills', detail: 'Timed question sets' },
            { label: 'Timed practice', detail: 'Section-level pacing' },
            { label: 'Sectional', detail: '40-minute section tests' },
            { label: 'Mock', detail: 'Full CAT simulations' },
            { label: 'Analysis', detail: 'Accuracy vs attempt rate review' },
          ]}
          accent="#60a5fa"
        />
      </Section>

      <Section id="sections" eyebrow="Section structure" title="VARC · DILR · QA" bg={VS.surface}>
        <div className="flagship-subject-rows">
          {sections.map((section, i) => {
            const row = overview.sections[i]
            return (
              <div key={section} className="flagship-subject-row">
                <div className="flagship-subject-index">{String(i + 1).padStart(2, '0')}</div>
                <div className="flagship-subject-main">
                  <div className="flagship-subject-name">{section}</div>
                  {row && (
                    <div className="flagship-subject-meta">
                      {row.topicCount} topics · {row.practiceCount} practice · {row.testCount} tests · {row.mockCount} mocks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section id="curriculum-map" eyebrow="Curriculum map" title="Topics by section">
        {overview.topics.length === 0 ? (
          <p style={{ color: VS.textSecondary, fontSize: 14 }}>Topic structure publishes with the curriculum. Enroll to access the full section tree.</p>
        ) : (
          <div className="sn-curriculum-map">
            {overview.topics.slice(0, 12).map(topic => (
              <div key={topic.id} className="sn-curriculum-row">
                <div className="sn-curriculum-index">{topic.sectionCode.slice(0, 4)}</div>
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

      <Section id="tests" eyebrow="Mocks & tests" title="Sectional and full-length practice" bg={VS.surface}>
        <p style={{ color: VS.textSecondary, fontSize: 15, lineHeight: 1.75, margin: '0 0 20px' }}>
          Sectional tests train pacing within 40-minute blocks. Full mocks follow the CAT section order and timing. Each attempt stores responses for review — no fabricated percentile data on this page.
        </p>
        <div className="flagship-assessment-rows">
          {overview.assessments.filter(a => a.examMode === 'MOCK' || a.examMode === 'TEST').slice(0, 6).map(item => (
            <div key={item.id} className="flagship-assessment-row">
              <span className="flagship-assessment-mode">{item.examMode}</span>
              <span className="flagship-assessment-title">{item.title}</span>
              {item.durationMinutes ? <span className="flagship-assessment-meta">{item.durationMinutes} min</span> : null}
            </div>
          ))}
          {overview.assessments.filter(a => a.examMode === 'MOCK' || a.examMode === 'TEST').length === 0 && (
            <p style={{ color: VS.textSecondary, fontSize: 14 }}>Published tests and mocks appear here when the curriculum is live.</p>
          )}
        </div>
      </Section>

      <Section id="performance" eyebrow="Analysis" title="Performance from your attempts">
        <div className="flagship-performance-empty">
          <p style={{ color: VS.textSecondary, fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            Section accuracy, time per question, and weak-area queues populate from your logged attempts. This page does not show fabricated ranks, percentiles, or admission statistics.
          </p>
        </div>
      </Section>
    </>
  )
}
