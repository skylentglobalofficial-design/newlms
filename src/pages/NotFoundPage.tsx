import ProductShell from '../design/ProductShell'
import { Rail, EmptyState, ButtonLink } from '../design/primitives'

export default function NotFoundPage() {
  return (
    <ProductShell>
      <Rail>
        <div style={{ paddingBlock: 96 }}>
          <EmptyState
            title="Page not found"
            body="That address is not a page on Skylent. Check the link, or go back to the catalogue."
            action={
              <>
                <ButtonLink to="/">Home</ButtonLink>
                <ButtonLink to="/programs" variant="secondary">Browse programmes</ButtonLink>
              </>
            }
          />
        </div>
      </Rail>
    </ProductShell>
  )
}
