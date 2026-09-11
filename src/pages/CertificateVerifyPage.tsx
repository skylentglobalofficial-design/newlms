import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import { ContentRail, ContextHeader, EmptyState } from '../components/product-ui'
import { fetchPublicCertificate, type ApiCertificate } from '../lib/lms-api'

export default function CertificateVerifyPage() {
  const { publicId } = useParams<{ publicId: string }>()
  const [certificate, setCertificate] = useState<ApiCertificate | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!publicId) return
    setError(null)
    void fetchPublicCertificate(publicId)
      .then(setCertificate)
      .catch((err) => setError(err instanceof Error ? err.message : 'Certificate not found'))
  }, [publicId])

  return (
    <WorldFrame world="learn">
      <ContentRail>
        <ContextHeader
          world="learn"
          eyebrow="Certificate"
          title="Certificate verification"
          description="A public ID confirms whether Skylent issued a completion record. It does not confer accreditation."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Certificate' }]}
        />

        {!publicId || error ? (
          <EmptyState
            title="Certificate not found"
            description={error ?? 'That certificate ID is not in this system.'}
            action={<Link className="product-btn-ghost" to="/">Back home</Link>}
          />
        ) : !certificate ? (
          <p className="panel-note">Checking certificate ID…</p>
        ) : (
          <article className="pdp-block" style={{ maxWidth: 720 }}>
            <p className="programme-meta"><span>{certificate.issuerName}</span><span>Certificate of completion</span></p>
            <h2>{certificate.learnerName}</h2>
            <p>completed {certificate.courseTitle}</p>
            <p>Issued {certificate.issuedAt.slice(0, 10)}</p>
            <p>Certificate ID {certificate.publicId}</p>
            <p className="panel-note">{certificate.disclaimer}</p>
            <p>
              <a className="product-btn-ghost" href={`/api/v1/lms/certificates/${encodeURIComponent(certificate.publicId)}/file`}>
                Open PDF
              </a>
            </p>
          </article>
        )}
      </ContentRail>
    </WorldFrame>
  )
}
