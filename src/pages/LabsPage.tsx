import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, StatusPill, Note, Tag, EmptyState } from '../design/primitives'
import { S, TY } from '../design/tokens'
import {
  INTERACTIVE_LABS,
  archivedBriefSubjects,
  interactiveLabAvailability,
  labGroupingLabel,
  practiceBriefSubjects,
} from '../lib/virtual-labs'
import '../design/labs.css'

export default function LabsPage() {
  const practice = practiceBriefSubjects()
  const archived = archivedBriefSubjects()

  return (
    <ProductShell className="sk-labs">
      <Rail>
        <div className="sk-lab-hero">
          <p className="sk-eyebrow">Virtual labs</p>
          <h1>Practice by doing the experiment.</h1>
          <p>
            Labs sit between a lesson and a project: change an input, run it, observe what happened, reset, try
            again. Live classes are not part of this yet.
          </p>
        </div>

        <Note>
          The interactive lab below runs in your browser. Older briefs are written exercises with a simulated
          workspace — they are not a live Python or SQL runtime, and they are not degree programmes.
        </Note>

        <section style={{ marginTop: 32 }}>
          <h2 style={{ ...TY.h2, fontFamily: 'var(--font-display)', margin: '0 0 14px' }}>Interactive now</h2>
          <div className="sk-lab-grid">
            {INTERACTIVE_LABS.map(lab => {
              const availability = interactiveLabAvailability(lab)
              return (
                <Link key={lab.id} to={`/labs/${lab.id}/run`} className="sk-lab-card">
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
        </section>

        <section>
          <h2 style={{ ...TY.h2, fontFamily: 'var(--font-display)', margin: '0 0 8px' }}>Practice briefs</h2>
          <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '0 0 16px', maxWidth: '62ch' }}>
            Structured exercises from the existing lab catalogue. Opening one still requires sign-in. Output you
            see there is a walkthrough, not code executed on a server.
          </p>
          {practice.length === 0 ? (
            <EmptyState title="No practice briefs" body="Nothing in this grouping is published." />
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
              not open academic programmes. Kept here so the exercises are not silently deleted.
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
