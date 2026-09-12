import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, EmptyState, ButtonLink, Note } from '../design/primitives'
import { stories } from '../data'

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
