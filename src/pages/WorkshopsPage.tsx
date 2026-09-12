import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, StatusPill, Tag, EmptyState, Note } from '../design/primitives'
import { formatInr } from '../design/CatalogueCard'
import { getSurfaceAccent } from '../design/accent'
import { S, TY } from '../design/tokens'
import { getWorkshopAvailability } from '../lib/catalogue-status'
import { workshops } from '../data'
import type { Workshop } from '../data'

const accent = getSurfaceAccent('webinar')
const availability = getWorkshopAvailability()

export default function WorkshopsPage() {
  const [category, setCategory] = useState('All')
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(workshops.map(item => item.category)))],
    [],
  )

  const filtered = workshops.filter(item => category === 'All' || item.category === category)

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Webinars"
          title="Short sessions, when they exist."
          lead="These are planned topics — not a timetable. No date, host or seat count is published because no session is on the calendar."
        />

        <div style={{ paddingBottom: 72 }}>
          <Note>
            Registering interest does not book a place and nothing is charged. A webinar becomes bookable only when a
            date is actually announced.
          </Note>

          <div className="sk-chip-row" style={{ margin: '22px 0 28px' }}>
            {categories.map(item => (
              <button
                key={item}
                type="button"
                className={`sk-chip${category === item ? ' is-active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="Nothing in that topic" body="Try another filter, or clear it to see every planned session." />
          ) : (
            <div className="sk-grid sk-grid-3">
              {filtered.map(workshop => (
                <WorkshopCard key={workshop.slug} workshop={workshop} />
              ))}
            </div>
          )}
        </div>
      </Rail>
    </ProductShell>
  )
}

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  return (
    <Link to={`/workshops/${workshop.slug}`} style={{ textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
      <Card interactive padding={20} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <Tag>{workshop.category}</Tag>
          <StatusPill availability={availability} size="sm" />
        </div>
        <h2 style={{ ...TY.h3, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{workshop.title}</h2>
        <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: 1 }}>{workshop.desc}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <span style={{ ...TY.meta, color: S.inkMuted }}>{workshop.duration} · {workshop.mode}</span>
          <span style={{ ...TY.body, color: accent.text, fontWeight: 600 }}>{formatInr(workshop.price)}</span>
        </div>
      </Card>
    </Link>
  )
}
