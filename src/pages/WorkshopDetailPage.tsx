import { Link, useParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import {
  Rail, Card, StatusPill, Tag, ButtonLink, EmptyState, Note, DefinitionList, SectionHeading,
} from '../design/primitives'
import { formatInr } from '../design/CatalogueCard'
import { getSurfaceAccent } from '../design/accent'
import { S, TY } from '../design/tokens'
import { getWorkshopAvailability } from '../lib/catalogue-status'
import { workshops } from '../data'
import '../design/detail.css'

const THEME = 'webinar' as const
const accent = getSurfaceAccent(THEME)

export default function WorkshopDetailPage() {
  const { slug } = useParams()
  const workshop = workshops.find(item => item.slug === slug)
  const availability = getWorkshopAvailability()

  if (!workshop) {
    return (
      <ProductShell>
        <Rail>
          <div style={{ paddingBlock: 80 }}>
            <EmptyState
              title="Webinar not found"
              body="That session is not in the catalogue."
              action={<ButtonLink to="/workshops">All webinars</ButtonLink>}
            />
          </div>
        </Rail>
      </ProductShell>
    )
  }

  return (
    <ProductShell>
      <Rail>
        <div className="sk-detail-head">
          <Link to="/workshops" className="sk-backlink"><span aria-hidden>←</span> All webinars</Link>
          <div className="sk-detail-head-row">
            <div style={{ minWidth: 0, maxWidth: 680 }}>
              <div style={{ ...TY.meta, color: accent.text, fontWeight: 600, marginBottom: 8 }}>Webinar</div>
              <h1 style={{ ...TY.display, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{workshop.title}</h1>
              <p style={{ ...TY.bodyLg, color: S.inkSecondary, margin: '14px 0 0' }}>{workshop.desc}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 16 }}>
                <StatusPill availability={availability} />
                <Tag>{workshop.category}</Tag>
                <Tag>{workshop.duration}</Tag>
                <Tag>{workshop.mode}</Tag>
              </div>
            </div>
          </div>
        </div>

        <div className="sk-detail" style={{ paddingBottom: 72 }}>
          <div className="sk-detail-main sk-stack">
            <section>
              <SectionHeading title="What the session would cover" />
              <ul className="sk-plain-list">
                {workshop.whatYouGet.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div style={{ marginTop: 18 }}>
                <Note>
                  This is a planned outline. It is not a live event, there is no recording to watch, and no certificate
                  is issued for registering interest.
                </Note>
              </div>
            </section>
          </div>

          <aside className="sk-detail-rail">
            <Card padding={22} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <StatusPill availability={availability} />
                <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '10px 0 0' }}>{availability.explanation}</p>
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 600, color: S.ink, letterSpacing: '-0.02em' }}>
                  {formatInr(workshop.price)}
                </div>
                <div style={{ ...TY.meta, color: S.inkMuted, marginTop: 4 }}>Fee if a date is announced. Nothing is charged now.</div>
              </div>
              <DefinitionList
                items={[
                  { term: 'Date', value: 'Not scheduled' },
                  { term: 'Duration', value: workshop.duration },
                  { term: 'Mode', value: workshop.mode },
                  { term: 'Host', value: 'Not assigned' },
                ]}
              />
              <ButtonLink to="/contact" full size="lg" themeId={THEME}>
                {availability.ctaLabel}
              </ButtonLink>
            </Card>
          </aside>
        </div>
      </Rail>
    </ProductShell>
  )
}
