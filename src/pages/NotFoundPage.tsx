import ProductShell from '../design/ProductShell'
import { Rail, ButtonLink } from '../design/primitives'
import '../design/product.css'

export default function NotFoundPage() {
  return (
    <ProductShell>
      <Rail>
        <div className="sk-notfound">
          <p className="sk-eyebrow">404</p>
          <h1>This page is not on Skylent.</h1>
          <p>
            That address is not a page here. Check the link, or go back to something that actually exists.
          </p>
          <div className="sk-notfound-actions">
            <ButtonLink to="/">Home</ButtonLink>
            <ButtonLink to="/skills" variant="secondary">Find something to learn</ButtonLink>
            <ButtonLink to="/education" variant="quiet">Education</ButtonLink>
          </div>
        </div>
      </Rail>
    </ProductShell>
  )
}
