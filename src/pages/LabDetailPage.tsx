import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, Tag, EmptyState, ButtonLink, Button, Progress } from '../design/primitives'
import { S, TY } from '../design/tokens'
import { labSubjects } from '../data'
import type { LabExperimentStatus, LabType } from '../data'
import { useAuth } from '../context/AuthContext'
import { useDemoState } from '../demo/DemoStateContext'

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

  useEffect(() => {
    if (ready && !user) navigate('/login', { state: { returnTo: `/labs/${labId}` } })
  }, [ready, user, navigate, labId])

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
          eyebrow={subject.program}
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
          <div style={{ marginBottom: 28, maxWidth: 420 }}>
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
