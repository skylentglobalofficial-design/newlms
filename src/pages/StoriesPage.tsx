import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, EmptyState, ButtonLink, Note, Card } from '../design/primitives'
import { S, TY } from '../design/tokens'
import { stories } from '../data'

const QUEUE = [
  { label: 'Learner journeys', status: 'Awaiting verification' },
  { label: 'Programme experiences', status: 'In editorial review' },
  { label: 'Institution stories', status: 'Not yet published' },
]

export default function StoriesPage() {
  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Stories"
          title="Verified experiences only."
          lead="This page will publish learner, programme and institution stories once the people, the work and the outcomes have been checked. Nothing here is a testimonial."
        />

        <div style={{ paddingBottom: 72, display: 'grid', gap: 22, maxWidth: 720 }}>
          <Note>
            {stories.length === 0
              ? 'No verified learner stories are published yet. Sample names, salaries and placement claims are not shown.'
              : `${stories.length} verified ${stories.length === 1 ? 'story is' : 'stories are'} published.`}
          </Note>

          <Card padding={0} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${S.line}` }}>
              <div style={{ ...TY.label, color: S.inkMuted }}>Editorial queue</div>
              <div style={{ ...TY.h3, color: S.ink, marginTop: 6, fontFamily: 'var(--font-display)' }}>Stories in preparation</div>
            </div>
            {QUEUE.map((item, index) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '16px 20px',
                  borderBottom: index < QUEUE.length - 1 ? `1px solid ${S.line}` : 'none',
                }}
              >
                <div>
                  <div style={{ ...TY.body, color: S.ink, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ ...TY.meta, color: S.inkMuted, marginTop: 3 }}>{item.status}</div>
                </div>
              </div>
            ))}
          </Card>

          <EmptyState
            compact
            title="Nothing to read yet"
            body="When a story is verified it will appear here with the programme the person actually took. Until then, the catalogue and Career OS show what the product does today."
            action={
              <>
                <ButtonLink to="/programs" variant="secondary" size="sm">Browse programmes</ButtonLink>
                <ButtonLink to="/career-os" variant="ghost" size="sm">Career OS</ButtonLink>
              </>
            }
          />
        </div>
      </Rail>
    </ProductShell>
  )
}
