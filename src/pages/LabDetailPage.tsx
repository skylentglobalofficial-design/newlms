import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, Tag, EmptyState, ButtonLink, Button, Progress, Note, StatusPill } from '../design/primitives'
import { S, TY } from '../design/tokens'
import { labSubjects } from '../data'
import type { LabExperimentStatus, LabType } from '../data'
import { useAuth } from '../context/AuthContext'
import { useDemoState } from '../demo/DemoStateContext'
import { getInteractiveLab, interactiveLabAvailability, labGroupingLabel } from '../lib/virtual-labs'
import '../design/labs.css'

const labTypeLabels: Record<LabType, string> = {
  coding: 'Coding',
  data: 'Data',
  business: 'Business',
  simulation: 'Simulation',
}

const statusLabel: Record<LabExperimentStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  submitted: 'Submitted',
  completed: 'Completed',
}

export default function LabDetailPage() {
  const { labId } = useParams<{ labId: string }>()
  const navigate = useNavigate()
  const { user, ready } = useAuth()
  const demo = useDemoState()
  const interactive = labId ? getInteractiveLab(labId) : undefined

  useEffect(() => {
    if (interactive) return
    if (ready && !user) navigate('/login', { state: { returnTo: `/labs/${labId}` } })
  }, [ready, user, navigate, labId, interactive])

  if (interactive) {
    const availability = interactiveLabAvailability(interactive)
    return (
      <ProductShell className="sk-labs">
        <Rail>
          <div className="sk-lab-hero">
            <Link to="/labs" className="sk-backlink">← All labs</Link>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <StatusPill availability={availability} />
              <Tag>{interactive.subject}</Tag>
            </div>
            <h1>{interactive.title}</h1>
            <p>{interactive.objective}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
              <ButtonLink to={`/labs/${interactive.id}/run`}>Open experiment</ButtonLink>
              <ButtonLink to="/labs" variant="secondary">All labs</ButtonLink>
            </div>
          </div>
          <div className="sk-lab-shell">
            <div className="sk-lab-side">
              <h2>Concept</h2>
              <p style={{ ...TY.bodySm, color: S.inkSecondary }}>{interactive.concept}</p>
            </div>
            <div className="sk-lab-side">
              <h2>How to use</h2>
              <ol>{interactive.howToUse.map(step => <li key={step}>{step}</li>)}</ol>
            </div>
          </div>
        </Rail>
      </ProductShell>
    )
  }

  const subject = labSubjects.find(item => item.id === labId)
  const labProgress = labId ? demo.getLabProgress(labId) : { launched: false, complete: false, experiments: {} }

  if (!ready || !user) {
    return (
      <ProductShell footer={false}>
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState title="Sign in to open this lab" body="Lab experiments are available to signed-in learners." />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  if (!subject) {
    return (
      <ProductShell>
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState
              title="Lab not found"
              body="That subject is not in the lab catalogue."
              action={<ButtonLink to="/labs">Back to labs</ButtonLink>}
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  const statuses: Record<string, LabExperimentStatus> = {}
  subject.experiments.forEach(experiment => {
    statuses[experiment.id] = labProgress.experiments[experiment.id] ?? 'not_started'
  })
  const completedCount = Object.values(statuses).filter(status => status === 'completed').length

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          back={{ label: 'All labs', to: '/labs' }}
          eyebrow={labGroupingLabel(subject.program)}
          title={subject.title}
          lead={subject.desc}
          meta={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <Tag>{labTypeLabels[subject.labType]}</Tag>
              <Tag>{subject.semester}</Tag>
              <Tag>{subject.subject}</Tag>
            </div>
          }
        />

        <div style={{ paddingBottom: 72 }}>
          <Note>
            This is a written exercise with a simulated workspace. It does not execute your code on a server,
            and the grouping label is not a Skylent degree.
          </Note>
          <div style={{ margin: '28px 0', maxWidth: 420 }}>
            <Progress value={completedCount} total={subject.experiments.length} themeId="professional" label="Completed" />
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {subject.experiments.map(experiment => {
              const status = statuses[experiment.id] ?? 'not_started'
              const action =
                status === 'not_started' ? 'Start' :
                status === 'in_progress' ? 'Continue' :
                status === 'submitted' ? 'View' : 'Review'
              return (
                <Card key={experiment.id} padding={20} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ ...TY.meta, color: S.inkMuted, fontVariantNumeric: 'tabular-nums', minWidth: 32 }}>
                    {String(experiment.number).padStart(2, '0')}
                  </div>
                  <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <Tag>{labTypeLabels[experiment.type]}</Tag>
                      <span style={{ ...TY.meta, color: S.inkMuted }}>{experiment.duration}</span>
                      <span style={{ ...TY.meta, color: S.inkMuted }}>{statusLabel[status]}</span>
                    </div>
                    <div style={{ ...TY.body, color: S.ink, fontWeight: 600 }}>{experiment.title}</div>
                    <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '6px 0 0' }}>{experiment.objective}</p>
                  </div>
                  <Button size="sm" themeId="professional" onClick={() => navigate(`/labs/${labId}/${experiment.id}`)}>
                    {action}
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>
      </Rail>
    </ProductShell>
  )
}
