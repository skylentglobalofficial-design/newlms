import { Link, useParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import {
  ContentRail,
  ContextHeader,
  EmptyState,
  ProductLayout,
  StickyActionBar,
  formatInr,
} from '../components/product-ui'
import { workshops } from '../data'

export default function WorkshopDetailPage() {
  const { slug } = useParams()
  const workshop = workshops.find((item) => item.slug === slug)

  if (!workshop) {
    return (
      <WorldFrame world="learn">
        <ContentRail>
          <EmptyState
            title="Workshop not found"
            description="That session is not in the catalogue."
            action={<Link className="product-btn-ghost" to="/workshops">Back to workshops</Link>}
          />
        </ContentRail>
      </WorldFrame>
    )
  }

  return (
    <WorldFrame world="learn">
      <ContentRail>
        <ContextHeader
          world="learn"
          eyebrow="Workshop"
          title={workshop.title}
          description={workshop.desc}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Workshops', href: '/workshops' },
            { label: workshop.title },
          ]}
          actions={<Link className="product-btn-ghost" to="/contact">Contact about workshops</Link>}
        />

        <p className="programme-meta" style={{ marginTop: -8, marginBottom: 18 }}>
          <span>{workshop.category}</span>
          <span>{workshop.date}</span>
          <span>{workshop.duration}</span>
          <span>{workshop.mode}</span>
        </p>

        <ProductLayout
          variant="pdp"
          sidebar={
            <div>
              <h2 className="product-filter-title">Session summary</h2>
              <p style={{ margin: '0 0 8px', fontSize: '1.45rem', fontWeight: 750, letterSpacing: '-0.03em' }}>
                {formatInr(workshop.price)}
              </p>
              <ul className="assessment-list">
                <li><strong>Date</strong><span className="product-count">{workshop.date}</span></li>
                <li><strong>Duration</strong><span className="product-count">{workshop.duration}</span></li>
                <li><strong>Format</strong><span className="product-count">{workshop.mode}</span></li>
              </ul>
              <p className="panel-note">Registration is not live. Seat counts and discounts are not published here.</p>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                <Link className="product-btn" to="/contact">Contact about workshops</Link>
                <Link className="product-btn-ghost" to="/workshops">All workshops</Link>
              </div>
            </div>
          }
        >
          <section className="pdp-block">
            <h2>What the session covers</h2>
            <ul>
              {workshop.whatYouGet.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        </ProductLayout>
      </ContentRail>

      <StickyActionBar>
        <div>
          <strong>{workshop.title}</strong>
          <div className="panel-note" style={{ margin: 0 }}>{workshop.date} · {formatInr(workshop.price)}</div>
        </div>
        <Link className="product-btn" to="/contact">Contact</Link>
      </StickyActionBar>
    </WorldFrame>
  )
}
