import { Link } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import { ContentRail, ContextHeader } from '../components/product-ui'

const COPY = {
  privacy: {
    title: 'Privacy',
    lead: 'A full privacy policy is not published on this site yet.',
  },
  terms: {
    title: 'Terms of use',
    lead: 'Terms of use are not published on this site yet.',
  },
  cookies: {
    title: 'Cookies',
    lead: 'A cookie notice is not published on this site yet.',
  },
} as const

export default function LegalPage({ kind }: { kind: keyof typeof COPY }) {
  const copy = COPY[kind]
  return (
    <WorldFrame world="home">
      <ContentRail>
        <ContextHeader
          world="home"
          eyebrow="Legal"
          title={copy.title}
          description={copy.lead}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: copy.title }]}
        />
        <p className="panel-note" style={{ maxWidth: 640 }}>
          These pages exist so footer links are not dead. They are not a substitute for a reviewed legal document.
          If you need a copy of Skylent privacy or terms materials, <Link to="/contact">contact Skylent</Link>.
        </p>
      </ContentRail>
    </WorldFrame>
  )
}
