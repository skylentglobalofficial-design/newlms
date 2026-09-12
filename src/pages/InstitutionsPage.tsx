import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, ButtonLink, Note, StatusPill } from '../design/primitives'
import { getInstitutionTypes, INSTITUTION_CAPABILITY_STATUS_LABELS } from '../lib/institution-types'
import type { InstitutionCapabilityStatus } from '../lib/institution-types'
import type { Availability } from '../lib/catalogue-status'
import '../design/institutions.css'

const STATUS_AVAILABILITY: Record<InstitutionCapabilityStatus, Availability> = {
  available: {
    id: 'available',
    label: INSTITUTION_CAPABILITY_STATUS_LABELS.available,
    tone: 'positive',
    ctaLabel: 'View',
    canStartLearning: false,
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
    <ProductShell className="sk-inst">
      <Rail>
        <PageHeader
          eyebrow="Institution OS"
          title="Infrastructure for the organisation — not a course catalogue."
          lead="Schools, colleges, universities and training institutes get programmes, learners, faculty and progress scoped to the organisation. Partnership starts with a conversation, not checkout."
          actions={<ButtonLink to="/contact">Discuss a partnership</ButtonLink>}
        />

        <div className="sk-inst-body">
          <Note>
            Skylent OS dashboards exist for signed-in organisation accounts. Schooling and degree delivery for a
            partner is by enquiry — those academic programmes are not in the public catalogue yet. Live classroom
            sessions are planned; there is no meeting system to join today.
          </Note>

          <div className="sk-inst-types">
            {types.map(type => (
              <section key={type.id} id={type.id} className="sk-inst-type">
                <p className="sk-inst-kicker">{type.sub}</p>
                <h2>{type.label}</h2>
                <p className="sk-inst-desc">{type.description}</p>

                {type.workflow.length > 0 && (
                  <ol className="sk-inst-flow" aria-label={`${type.label} operating layers`}>
                    {type.workflow.map(step => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}

                <ul className="sk-inst-caps">
                  {type.capabilities.map(capability => (
                    <li key={capability.id}>
                      <div>
                        <strong>{capability.label}</strong>
                        <p>{capability.description}</p>
                      </div>
                      <StatusPill availability={STATUS_AVAILABILITY[capability.status]} size="sm" />
                    </li>
                  ))}
                </ul>

                {type.programItems.length > 0 && (
                  <p className="sk-inst-progs">
                    Can be deployed:{' '}
                    {type.programItems.map((program, index) => (
                      <span key={program.slug}>
                        {index > 0 ? ' · ' : ''}
                        <Link to={program.href}>{program.title}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </section>
            ))}
          </div>

          <div className="sk-inst-foot">
            <p>
              Academic pathways for learners are on Education. The operating layer itself is Skylent OS. This page
              is not enrolment.
            </p>
            <ButtonLink to="/education" variant="secondary" size="sm">Education</ButtonLink>
            <ButtonLink to="/os" variant="ghost" size="sm">Skylent OS</ButtonLink>
          </div>
        </div>
      </Rail>
    </ProductShell>
  )
}
