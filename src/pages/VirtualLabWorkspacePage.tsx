import { lazy, Suspense } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, StatusPill, EmptyState, ButtonLink, Note } from '../design/primitives'
import { INTERACTIVE_LABS, getInteractiveLab, interactiveLabAvailability } from '../lib/virtual-labs'
import { labBackLabel, labRunPath, safeInternalPath } from '../lib/safe-return'
import '../design/labs.css'

const ClassificationLab = lazy(() => import('../labs/ClassificationLab'))
const PythonFilterLab = lazy(() => import('../labs/PythonFilterLab'))
const SqlFilterLab = lazy(() => import('../labs/SqlFilterLab'))
const ExcelGroupLab = lazy(() => import('../labs/ExcelGroupLab'))
const CssBoxLab = lazy(() => import('../labs/CssBoxLab'))

export default function VirtualLabWorkspacePage() {
  const { labId } = useParams<{ labId: string }>()
  const [params] = useSearchParams()
  const lab = labId ? getInteractiveLab(labId) : undefined
  const from = safeInternalPath(params.get('from'))

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
  const otherLabs = INTERACTIVE_LABS.filter(item => item.id !== lab.id && item.workspace)
  const backTo = from ?? `/labs/${lab.id}/run`

  return (
    <ProductShell className="sk-labs" footer={false}>
      <Rail>
        <div className="sk-lab-hero">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
            <Link to={from ?? '/labs'} className="sk-backlink">{labBackLabel(from)}</Link>
            {from && from !== '/labs' && (
              <Link to="/labs" className="sk-backlink">All labs</Link>
            )}
          </div>
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
            {lab.workspace === 'python' && <PythonFilterLab />}
            {lab.workspace === 'sql' && <SqlFilterLab />}
            {lab.workspace === 'excel' && <ExcelGroupLab />}
            {lab.workspace === 'css' && <CssBoxLab />}
          </Suspense>
          <aside className="sk-lab-side">
            <h2>Concept</h2>
            <p className="sk-lab-concept">{lab.concept}</p>
            <h2>How to use</h2>
            <ol>
              {lab.howToUse.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <h2>What to observe</h2>
            <ul>
              {lab.observe.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {otherLabs.length > 0 && (
              <>
                <h2>Other experiments</h2>
                <ul className="sk-lab-others">
                  {otherLabs.map(item => (
                    <li key={item.id}>
                      <Link to={labRunPath(item.id, backTo)}>{item.title}</Link>
                      <span>{item.subject}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Note>
              Completion is stored only in this browser. It does not unlock a certificate or Career OS evidence.
              These are browser experiments, not full interpreters or production infrastructure.
            </Note>
          </aside>
        </div>
      </Rail>
    </ProductShell>
  )
}
