import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { C, FadeIn, PageShell } from '../components/shared'
import {
  Section, Button, Eyebrow, Heading, SectionHeader,
} from '../components/ui'
import { Aurora } from '../components/foundation'
import { CAREER_OS_IA } from '../lib/product-architecture'
import {
  LEARN_INTENTS,
  capabilitiesForIntent,
  liveMatchesForIntent,
  type LearnIntentId,
  type LiveMatch,
} from '../lib/live-intents'
import { T } from '../tokens'

const NEXT_STEPS = [
  { label: 'Course', detail: 'Open a live course or programme from the catalogue.' },
  { label: 'LMS', detail: 'Enroll to continue lessons, quizzes, and assignments.' },
  { label: 'Evidence', detail: 'Progress stays on your enrollments — not a generated transcript.' },
  { label: 'Career OS', detail: 'Learning evidence can sit beside profile, applications, and interviews.' },
]

function MatchRow({ match, last }: { match: LiveMatch; last: boolean }) {
  return (
    <Link
      to={match.to}
      className="live-intent-row skills-match-row"
      style={{
        borderBottom: last ? 'none' : `1px solid ${T.lineDark}`,
      }}
    >
      <div className="skills-match-row__body">
        <div className="skills-match-row__meta">
          <span>{match.kind === 'programme' ? 'Programme' : 'Course'}</span>
          <span aria-hidden="true">·</span>
          <span>{match.availability}</span>
          {match.duration ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{match.duration}</span>
            </>
          ) : null}
        </div>
        <div className="skills-match-row__title">{match.title}</div>
        <div className="skills-match-row__capability">{match.capability}</div>
      </div>
      <span className="skills-match-row__action">
        {match.actionLabel} →
      </span>
    </Link>
  )
}

function IntentResults({
  intentId,
  onSelectIntent,
}: {
  intentId: LearnIntentId
  onSelectIntent: (id: LearnIntentId) => void
}) {
  const navigate = useNavigate()
  const intent = LEARN_INTENTS.find((item) => item.id === intentId)
  const matches = liveMatchesForIntent(intentId)
  const capabilities = capabilitiesForIntent(intentId)
  const otherIntents = LEARN_INTENTS.filter((item) => item.id !== intentId)

  return (
    <div id="your-direction" className="skills-direction">
      <div className="skills-direction__capabilities">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 10 }}>
          What you will actually learn to do
        </div>
        <h2 className="skills-direction__heading">{intent?.label}</h2>
        <p className="skills-direction__question">{intent?.question}</p>
        {capabilities.length > 0 ? (
          <ul className="skills-capability-list">
            {capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="skills-direction__empty-copy">
            No live curriculum statements are attached to this intent yet.
          </p>
        )}
      </div>

      <div className="skills-direction__path">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 10 }}>
          Available learning now
        </div>
        {matches.length === 0 ? (
          <div className="skills-empty">
            <p className="skills-empty__title">Nothing live for this intent yet.</p>
            <p className="skills-empty__copy">
              There is no open course or programme in the catalogue for this direction. Browse what is live, or pick another intent.
            </p>
            <div className="skills-empty__actions">
              <Button variant="primary" onClick={() => navigate('/courses')}>Browse available learning</Button>
              <Button variant="secondary" onClick={() => navigate('/programs')}>Programmes</Button>
            </div>
            <div className="skills-empty__alts">
              <span className="skills-empty__alts-label">Explore another intent</span>
              {otherIntents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="intent-chip"
                  onClick={() => onSelectIntent(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="live-intent-list">
            {matches.map((match, index) => (
              <MatchRow key={`${match.kind}-${match.slug}`} match={match} last={index === matches.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function WhatHappensNextSection() {
  return (
    <Section id="what-next" tone="canvas" divider style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionTight }}>
      <FadeIn>
        <SectionHeader
          tone="light"
          eyebrow="What happens next"
          title="Course → LMS → Evidence → Career OS"
          lead="This is the live loop after you enrol. Certificate issuance, payments, and job placement are not part of it."
        />
        <ol className="skills-next-flow">
          {NEXT_STEPS.map((step, index) => (
            <li key={step.label} className="skills-next-step">
              <div className="skills-next-step__label">
                <span className="skills-next-step__index">{String(index + 1).padStart(2, '0')}</span>
                {step.label}
              </div>
              <p className="skills-next-step__detail">{step.detail}</p>
            </li>
          ))}
        </ol>
      </FadeIn>
    </Section>
  )
}

function JobAssistanceSection() {
  const navigate = useNavigate()

  return (
    <Section id="job-assistance" tone="canvas" divider>
      <FadeIn>
        <Eyebrow tone="light">Not a course</Eyebrow>
        <Heading tone="light" size="md" style={{ margin: '20px 0 16px' }}>
          Career OS is a workspace.
        </Heading>
        <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.8, margin: '0 0 28px', maxWidth: 560 }}>
          Professional programmes include Career OS: profile, published opportunities, applications, interviews, and support. Jobs appear when partners publish them — the board is not filled with demo employers.
        </p>
        <div style={{ maxWidth: 720, marginBottom: 28 }}>
          {CAREER_OS_IA.map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 0.4fr) minmax(0, 1fr)',
                gap: 16,
                padding: '14px 0',
                borderBottom: i < arr.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                minWidth: 0,
              }}
              className="arch-career-ia-row"
            >
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: C.ink }}>{item.label}</strong>
              <span style={{ color: C.slate, fontSize: 14, lineHeight: 1.55 }}>{item.sub}</span>
            </div>
          ))}
        </div>
        <Button variant="primary" onClick={() => navigate('/career-os')}>Open Career OS →</Button>
      </FadeIn>
    </Section>
  )
}

export default function SkillsPage() {
  const navigate = useNavigate()
  const [intentId, setIntentId] = useState<LearnIntentId | null>(null)

  return (
    <PageShell auroraTheme="professional">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 24}px ${T.gutter} ${T.sectionTight}` }}>
        <Aurora themeId="professional" variant="hero" />
        <div className="skills-rail" style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <div className="skills-intent">
              <div className="skylent-label" style={{ color: C.indigo, marginBottom: 14 }}>Learn · live</div>
              <h1 className="skylent-display-lg" style={{ color: C.ink, margin: '0 0 16px', maxWidth: 720 }}>
                What are you trying to learn or become?
              </h1>
              <p className="skylent-body-lg" style={{ color: C.slate, maxWidth: 560, margin: '0 0 28px' }}>
                Tell Skylent a direction. Matches are live courses and open programmes from the catalogue — not a generated list.
              </p>
              <div className="skills-intent-chips" role="group" aria-label="Learning intents">
                {LEARN_INTENTS.map((item) => {
                  const selected = intentId === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="intent-chip"
                      onClick={() => setIntentId(item.id)}
                      aria-pressed={selected}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {intentId ? (
              <IntentResults intentId={intentId} onSelectIntent={setIntentId} />
            ) : (
              <div id="your-direction" className="skills-direction skills-direction--idle">
                <div className="skills-direction__capabilities">
                  <div className="skylent-label" style={{ color: C.slate, marginBottom: 10 }}>
                    What you will actually learn to do
                  </div>
                  <p className="skills-direction__empty-copy">
                    Choose an intent. Skylent will show capabilities from the live curriculum, then the real path available today.
                  </p>
                </div>
                <div className="skills-direction__path">
                  <div className="skylent-label" style={{ color: C.slate, marginBottom: 10 }}>
                    Available learning now
                  </div>
                  <p className="skills-direction__empty-copy">
                    Pick an intent to see the matching course or programme available today.
                  </p>
                </div>
              </div>
            )}

            <div className="skills-intent-browse">
              <Button variant="secondary" onClick={() => navigate('/courses')}>Courses</Button>
              <Button variant="secondary" onClick={() => navigate('/programs')}>Programmes</Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <WhatHappensNextSection />
      <JobAssistanceSection />
    </PageShell>
  )
}
