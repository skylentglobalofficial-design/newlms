import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, ButtonLink, Note, SectionHeading, StatusPill } from '../design/primitives'
import { getSurfaceAccent } from '../design/accent'
import { S, TY } from '../design/tokens'
import { getInstitutionTypes, INSTITUTION_CAPABILITY_STATUS_LABELS } from '../lib/institution-types'
import type { InstitutionCapabilityStatus } from '../lib/institution-types'
import type { Availability } from '../lib/catalogue-status'

const accent = getSurfaceAccent('institution')

const STATUS_AVAILABILITY: Record<InstitutionCapabilityStatus, Availability> = {
  available: {
    id: 'available',
    label: INSTITUTION_CAPABILITY_STATUS_LABELS.available,
    tone: 'positive',
    ctaLabel: 'View',
    canStartLearning: true,
    explanation: '',
  },
  inquiry: {
    id: 'interest-open',
    label: INSTITUTION_CAPABILITY_STATUS_LABELS.inquiry,
    tone: 'neutral',
    ctaLabel: 'Enquire',
    canStartLearning: false,
    explanation: '',
  },
  concept: {
    id: 'not-available',
    label: INSTITUTION_CAPABILITY_STATUS_LABELS.concept,
    tone: 'muted',
    ctaLabel: 'Enquire',
    canStartLearning: false,
    explanation: '',
  },
}

export default function InstitutionsPage() {
  const types = getInstitutionTypes()

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="For institutions"
          title="Run your programmes on Skylent."
          lead="Schools, colleges, universities and training institutes get the same infrastructure — programmes, learners, faculty and progress — scoped to the organisation. Partnership starts with a conversation, not a checkout."
          actions={<ButtonLink to="/contact" themeId="institution">Discuss a partnership</ButtonLink>}
        />

        <div style={{ paddingBottom: 72 }}>
          <Note>
            Skylent OS dashboards exist for signed-in organisation accounts. Schooling and degree delivery for a
            partner is by enquiry — those academic programmes are not in the public catalogue yet.
          </Note>

          <div className="sk-stack" style={{ marginTop: 36 }}>
            {types.map(type => (
              <section key={type.id} id={type.id} style={{ scrollMarginTop: 110 }}>
                <div style={{ ...TY.label, color: accent.text, marginBottom: 8 }}>{type.sub}</div>
                <h2 style={{ ...TY.h2, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{type.label}</h2>
                <p style={{ ...TY.body, color: S.inkSecondary, margin: '10px 0 18px', maxWidth: '62ch' }}>{type.description}</p>

                <div className="sk-grid sk-grid-2">
                  {type.capabilities.map(capability => (
                    <Card key={capability.id} padding={18}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ ...TY.body, color: S.ink, fontWeight: 600, flex: '1 1 8rem', minWidth: 0 }}>{capability.label}</div>
                        <StatusPill availability={STATUS_AVAILABILITY[capability.status]} size="sm" />
                      </div>
                      <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '8px 0 0' }}>{capability.description}</p>
                    </Card>
                  ))}
                </div>

                {type.programItems.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <SectionHeading size="sm" title="Programmes that can be deployed" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
                      {type.programItems.map(program => (
                        <Link key={program.slug} to={program.href} style={{ ...TY.bodySm, color: accent.text, fontWeight: 600, textDecoration: 'none' }}>
                          {program.title} →
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          <div style={{ marginTop: 48, paddingTop: 28, borderTop: `1px solid ${S.line}`, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: '1 1 280px' }}>
              Academic pathways for learners are on the education page. The operating layer itself is Skylent OS.
            </p>
            <ButtonLink to="/education" variant="secondary" size="sm">Education</ButtonLink>
            <ButtonLink to="/os" variant="ghost" size="sm">Skylent OS</ButtonLink>
          </div>
        </div>
      </Rail>
    </ProductShell>
  )
}
