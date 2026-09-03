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

export function JeeFlagshipSections({ overview }: { overview: ExamProgramOverview }) {
  const subjects = overview.sections.length > 0
    ? overview.sections.map(s => s.name)
    : ['Physics', 'Chemistry', 'Mathematics']

  return (
    <>
      <Section id="exam-workflow" eyebrow="Preparation journey" title="How you prepare">
        <WorkflowMap
          label="JEE preparation path"
          steps={[
            { label: 'Concept', detail: 'Core theory and solved examples' },
            { label: 'Example', detail: 'Worked problems by difficulty' },
            { label: 'Practice', detail: 'Topic-level question sets' },
            { label: 'Test', detail: 'Timed chapter tests' },
            { label: 'Mock', detail: 'Full-length simulations' },
            { label: 'Review', detail: 'Solution walkthrough and error log' },
          ]}
          accent={C.orange}
        />
      </Section>

      <Section id="sections" eyebrow="Subject structure" title="Physics → Chemistry → Mathematics" bg={VS.surface}>
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

      <Section id="curriculum-map" eyebrow="Curriculum map" title="Chapters and topics">
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

      <Section id="tests" eyebrow="Mocks & tests" title="Timed practice and simulations" bg={VS.surface}>
        <p style={{ color: VS.textSecondary, fontSize: 15, lineHeight: 1.75, margin: '0 0 20px' }}>
          Chapter tests build speed and accuracy. Full mocks follow exam-style timing and question mix. Each attempt stores your responses for review — no pre-filled scores on this page.
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

      <Section id="performance" eyebrow="Performance" title="Your attempt history">
        <div className="flagship-performance-empty">
          <p style={{ color: VS.textSecondary, fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            After enrollment, practice, test, and mock attempts build a real performance history — section breakdown, accuracy trends, and flagged questions for review. No fabricated ranks or percentiles are shown here.
          </p>
          <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11, color: VS.textMuted }}>
            {overview.practiceCount + overview.testCount + overview.mockCount} published assessment nodes · performance derived from your attempts
          </div>
        </div>
      </Section>
    </>
  )
}
