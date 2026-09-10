import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  courseEnrollmentMessage,
  programEnrollmentMessage,
  type CatalogEnrollmentStatus,
} from '../lib/catalog-api'
import { fulfillCatalogEnrollment, learnPathForWorkspace } from '../lib/catalog-enrollment'
import { C } from '../tokens'
import { getDomainAccent, type AuroraThemeId } from '../aurora-themes'

export type CatalogEnrollItem = {
  kind: 'course' | 'program'
  slug: string
  title: string
  price: number
  enrollmentStatus?: CatalogEnrollmentStatus
  enrollable: boolean
  linkedCourseSlugs?: string[]
}

/** Product access modal — kept out of shared shell so LMS enroll client is not on `/`. */
export function EnrollmentModal({
  item,
  onClose,
  themeId,
}: {
  item: CatalogEnrollItem
  onClose: () => void
  themeId?: AuroraThemeId
}) {
  const { user } = useAuth()
  const accent = getDomainAccent(themeId ?? (item.kind === 'program' ? 'professional' : 'data-science'))
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const helperMessage = item.kind === 'program'
    ? programEnrollmentMessage({
        enrollmentStatus: item.enrollmentStatus ?? null,
        linkedCourseSlugs: item.linkedCourseSlugs ?? [],
      })
    : courseEnrollmentMessage()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  async function handlePrimaryAction() {
    if (!item.enrollable) {
      onClose()
      navigate('/contact')
      return
    }

    if (!user) {
      onClose()
      navigate('/login', { state: { enrollTarget: { kind: item.kind, slug: item.slug } } })
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const workspace = await fulfillCatalogEnrollment({ kind: item.kind, slug: item.slug })
      onClose()
      navigate(learnPathForWorkspace(workspace))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to enroll right now')
    } finally {
      setSubmitting(false)
    }
  }

  const primaryLabel = !item.enrollable
    ? item.enrollmentStatus === 'waitlist'
      ? 'Talk to us about the waitlist'
      : item.enrollmentStatus === 'coming_soon'
        ? 'Register interest'
        : 'Enrollment not available yet'
    : user
      ? submitting ? 'Opening workspace…' : 'Get learning access'
      : 'Sign in to enroll'

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(11,13,15,0.6)', zIndex: 500, backdropFilter: 'blur(6px)' }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="enrollment-modal-title" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: C.white, borderRadius: 18, padding: '36px 40px', width: 540, maxWidth: '94vw', zIndex: 501, boxShadow: '0 40px 120px rgba(0,0,0,0.32)', overflowY: 'auto', maxHeight: '92vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ color: accent.text, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 3 }}>
              {item.enrollable ? 'Product access' : 'Enrollment status'}
            </div>
            <div id="enrollment-modal-title" style={{ color: C.ink, fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{item.title}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close enrollment dialog" style={{ background: C.sand, border: 'none', borderRadius: 7, padding: '7px 13px', cursor: 'pointer', color: C.slate, fontSize: 14 }}>✕</button>
        </div>

        <div style={{ background: C.sand, borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: '0.06em' }}>LISTED PRICE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: C.ink }}>₹{item.price.toLocaleString('en-IN')}</div>
          <div style={{ color: C.slate, fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
            Payment is not collected here yet. {item.enrollable ? 'Enrollment grants access to the live learning workspace.' : 'We will notify you when enrollment opens.'}
          </div>
        </div>

        <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.65, margin: '0 0 20px' }}>{helperMessage}</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: C.sand, border: 'none', color: C.ink, borderRadius: 8, padding: 13, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Close</button>
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={submitting}
            style={{ flex: 2, background: accent.primary, border: 'none', color: C.black, borderRadius: 8, padding: 13, fontSize: 14, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', opacity: submitting ? 0.7 : 1 }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </>
  )
}

export default EnrollmentModal
