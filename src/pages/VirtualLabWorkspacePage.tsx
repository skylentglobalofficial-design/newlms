import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, StatusPill, EmptyState, ButtonLink, Note } from '../design/primitives'
import { getInteractiveLab, interactiveLabAvailability } from '../lib/virtual-labs'
import '../design/labs.css'

const ClassificationLab = lazy(() => import('../labs/ClassificationLab'))

export default function VirtualLabWorkspacePage() {
  const { labId } = useParams<{ labId: string }>()
  const lab = labId ? getInteractiveLab(labId) : undefined

  if (!lab || !lab.workspace) {
    return (
      <ProductShell className="sk-labs">
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState
              title="Experiment not available"
              body="That workspace has not been migrated into Skylent yet."
              action={<ButtonLink to="/labs">Back to labs</ButtonLink>}
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  const availability = interactiveLabAvailability(lab)

  return (
    <ProductShell className="sk-labs" footer={false}>
      <Rail>
        <div className="sk-lab-hero">
          <Link to="/labs" className="sk-backlink">← All labs</Link>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
            <StatusPill availability={availability} size="sm" />
            <span style={{ fontSize: 12.5, color: 'var(--sk-ink-muted)' }}>{lab.subject} · {lab.duration}</span>
          </div>
          <h1>{lab.title}</h1>
          <p>{lab.objective}</p>
        </div>

        <div className="sk-lab-shell">
          <Suspense fallback={<p>Loading experiment…</p>}>
            {lab.workspace === 'knn' && <ClassificationLab />}
          </Suspense>
          <aside className="sk-lab-side">
            <h2>How to use</h2>
            <ol>
              {lab.howToUse.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <h2 style={{ marginTop: 22 }}>What to observe</h2>
            <ul>
              {lab.observe.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Note>
              Completion is stored only in this browser. It does not unlock a certificate or Career OS evidence.
            </Note>
          </aside>
        </div>
      </Rail>
    </ProductShell>
  )
}
